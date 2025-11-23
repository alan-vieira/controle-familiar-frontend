// js/crud.js - SEM MÓDULOS - VERSÃO CORRIGIDA
console.log('🔧 CRUD.js carregando...');

// =============== SISTEMA DE AUTENTICAÇÃO ===============
async function fetchAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      throw new Error('Não autorizado');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// =============== FUNÇÕES UTILITÁRIAS ===============
function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  if (yyyy && mm && dd) {
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

function formatCategoria(cat) {
  const labels = window.CATEGORIAS || {
    'moradia': 'Moradia',
    'alimentacao': 'Alimentação',
    'restaurante_lanche': 'Restaurante/Lanche',
    'casa_utilidades': 'Casa/Utilidades',
    'saude': 'Saúde',
    'transporte': 'Transporte',
    'lazer_outros': 'Lazer/Outros'
  };
  return labels[cat] || cat;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;
  
  msg.textContent = message;
  toast.className = `fixed bottom-4 right-4 flex items-center p-4 text-sm font-normal rounded-lg shadow ${
    isError 
      ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800' 
      : 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800'
  }`;
  toast.classList.remove('hidden');
  
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

// =============== ESTADO GLOBAL ===============
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];

// =============== CARREGAR COLABORADORES ===============
async function carregarListaColaboradores() {
  try {
    const data = await fetchAuth('/api/colaboradores');
    listaColaboradores = data.colaboradores || [];
    
    const selects = ['despesa-colab', 'renda-colab'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">Selecione...</option>' +
          listaColaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
      }
    });
    
    return listaColaboradores;
  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar lista de colaboradores.', true);
    return [];
  }
}

// =============== DESPESAS ===============
async function carregarDespesas(mes = null) {
  try {
    const url = mes ? `/api/despesas?mes_vigente=${mes}` : `/api/despesas`;
    const data = await fetchAuth(url);
    
    const tbodyDesktop = document.getElementById('despesas-tbody-desktop');
    const cardsContainer = document.getElementById('despesas-cards');

    if (!tbodyDesktop || !cardsContainer) return;

    if (!data || data.length === 0) {
      tbodyDesktop.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Nenhuma despesa neste mês.</td></tr>';
      cardsContainer.innerHTML = '<p class="text-center text-gray-500">Nenhuma despesa neste mês.</p>';
      return;
    }

    // Tabela desktop
    tbodyDesktop.innerHTML = data.map(d => {
      const colaborador = listaColaboradores.find(c => c.id === d.colaborador_id);
      return `
        <tr class="border-b dark:border-gray-700">
          <td class="px-2 py-3">${formatDateBR(d.data_compra)}</td>
          <td class="px-2 py-3">
            <div class="font-medium">${d.descricao}</div>
            <div class="text-xs text-gray-500">${colaborador?.nome || 'N/A'}</div>
          </td>
          <td class="px-2 py-3">${formatCategoria(d.categoria)}</td>
          <td class="px-2 py-3 text-red-600 font-semibold">${formatCurrency(d.valor)}</td>
          <td class="px-2 py-3">
            <button onclick="editarDespesa(${d.id})" class="text-blue-600 hover:text-blue-900 mr-2">
              Editar
            </button>
            <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 hover:text-red-900">
              Excluir
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Cards mobile
    cardsContainer.innerHTML = data.map(d => {
      const colaborador = listaColaboradores.find(c => c.id === d.colaborador_id);
      return `
        <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-medium">${formatDateBR(d.data_compra)}</span>
              <div class="text-xs text-gray-500 mt-1">${colaborador?.nome || 'N/A'}</div>
            </div>
            <span class="text-red-600 font-bold text-lg">${formatCurrency(d.valor)}</span>
          </div>
          <div class="mb-3">
            <div class="font-medium">${d.descricao}</div>
          </div>
          <div class="flex justify-between items-center">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${formatCategoria(d.categoria)}</span>
            <div class="flex space-x-2">
              <button onclick="editarDespesa(${d.id})" class="text-blue-600 hover:text-blue-900">
                Editar
              </button>
              <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 hover:text-red-900">
                Excluir
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Erro ao carregar despesas:', err);
    showToast('Erro ao carregar despesas.', true);
  }
}

// =============== RENDAS ===============
async function carregarRendas(mes = null) {
  try {
    const url = mes ? `/api/rendas?mes=${mes}` : `/api/rendas`;
    const data = await fetchAuth(url);
    
    const tbody = document.getElementById('rendas-tbody');
    
    if (!tbody) return;

    if (!data.rendas || data.rendas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Nenhuma renda neste mês.</td></tr>';
      return;
    }

    tbody.innerHTML = data.rendas.map(r => `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-3 font-medium">${r.nome}</td>
        <td class="px-4 py-3">${r.mes_ano}</td>
        <td class="px-4 py-3 text-green-600 font-semibold">${formatCurrency(r.valor)}</td>
        <td class="px-4 py-3">
          <button onclick="editarRenda(${r.id})" class="text-blue-600 hover:text-blue-900 mr-2">
            Editar
          </button>
          <button onclick="confirmarExclusao(${r.id}, 'rendas')" class="text-red-600 hover:text-red-900">
            Excluir
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Erro ao carregar rendas:', err);
    showToast('Erro ao carregar rendas.', true);
  }
}

// =============== COLABORADORES ===============
async function carregarColaboradores() {
  try {
    await carregarListaColaboradores();
    const tbody = document.getElementById('colabs-tbody');
    
    if (!tbody) return;

    if (listaColaboradores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Nenhum colaborador registrado.</td></tr>';
      return;
    }

    tbody.innerHTML = listaColaboradores.map(c => `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-3 font-medium">${c.nome}</td>
        <td class="px-4 py-3">Dia ${c.dia_fechamento}</td>
        <td class="px-4 py-3">
          <button onclick="editarColaborador(${c.id})" class="text-blue-600 hover:text-blue-900 mr-2">
            Editar
          </button>
          <button onclick="confirmarExclusao(${c.id}, 'colaboradores')" class="text-red-600 hover:text-red-900">
            Excluir
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar colaboradores.', true);
  }
}

// =============== EDIÇÃO ===============
function editarDespesa(id) {
  showToast('Funcionalidade de edição em desenvolvimento', false);
  abrirModal('despesaModal');
}

function editarRenda(id) {
  showToast('Funcionalidade de edição em desenvolvimento', false);
  abrirModal('rendaModal');
}

function editarColaborador(id) {
  showToast('Funcionalidade de edição em desenvolvimento', false);
  abrirModal('colabModal');
}

// =============== EXCLUSÃO ===============
function confirmarExclusao(id, tipo) {
  currentDeleteId = id;
  currentDeleteEndpoint = tipo;
  abrirModal('deleteModal');
}

// =============== FORMULÁRIOS ===============
document.addEventListener('DOMContentLoaded', function() {
  // Formulário de despesa
  const formDespesa = document.getElementById('form-despesa');
  if (formDespesa) {
    formDespesa.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const data = document.getElementById('despesa-data').value;
      const descricao = document.getElementById('despesa-descricao').value;
      const valor = document.getElementById('despesa-valor').value;
      const tipo = document.getElementById('despesa-tipo').value;
      const colabId = document.getElementById('despesa-colab').value;
      const categoria = document.getElementById('despesa-categoria').value;

      if (!data || !descricao || !valor || !tipo || !colabId || !categoria) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        const payload = {
          data_compra: data,
          descricao: descricao,
          valor: parseFloat(valor),
          tipo_pg: tipo,
          colaborador_id: parseInt(colabId),
          categoria: categoria
        };

        await fetchAuth('/api/despesas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('Despesa registrada com sucesso!');
        fecharModal('despesaModal');
        formDespesa.reset();
        
        const mes = document.getElementById('despesas-mes')?.value;
        carregarDespesas(mes);
      } catch (err) {
        console.error('Erro ao salvar despesa:', err);
        showToast('Erro ao salvar despesa.', true);
      }
    });
  }

  // Formulário de renda
  const formRenda = document.getElementById('form-renda');
  if (formRenda) {
    formRenda.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const colabId = document.getElementById('renda-colab').value;
      const mes = document.getElementById('renda-mes').value;
      const valor = document.getElementById('renda-valor').value;

      if (!colabId || !mes || !valor) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        const payload = {
          colaborador_id: parseInt(colabId),
          mes_ano: mes,
          valor: parseFloat(valor)
        };

        await fetchAuth('/api/rendas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('Renda registrada com sucesso!');
        fecharModal('rendaModal');
        formRenda.reset();
        
        const mesAtual = document.getElementById('rendas-mes')?.value;
        carregarRendas(mesAtual);
      } catch (err) {
        console.error('Erro ao salvar renda:', err);
        showToast('Erro ao salvar renda.', true);
      }
    });
  }

  // Formulário de colaborador
  const formColab = document.getElementById('form-colab');
  if (formColab) {
    formColab.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nome = document.getElementById('colab-nome').value;
      const dia = document.getElementById('colab-dia').value;

      if (!nome || !dia) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        const payload = {
          nome: nome,
          dia_fechamento: parseInt(dia)
        };

        await fetchAuth('/api/colaboradores', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('Colaborador criado com sucesso!');
        fecharModal('colabModal');
        formColab.reset();
        
        carregarColaboradores();
        carregarListaColaboradores();
      } catch (err) {
        console.error('Erro ao salvar colaborador:', err);
        showToast('Erro ao salvar colaborador.', true);
      }
    });
  }

  // Botão de confirmação de exclusão
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function() {
      try {
        await fetchAuth(`/api/${currentDeleteEndpoint}/${currentDeleteId}`, {
          method: 'DELETE'
        });
        
        showToast('Item excluído com sucesso!');
        fecharModal('deleteModal');
        
        const mesDespesas = document.getElementById('despesas-mes')?.value;
        const mesRendas = document.getElementById('rendas-mes')?.value;
        
        if (currentDeleteEndpoint === 'despesas') carregarDespesas(mesDespesas);
        else if (currentDeleteEndpoint === 'rendas') carregarRendas(mesRendas);
        else carregarColaboradores();
      } catch (err) {
        console.error('Erro ao excluir:', err);
        showToast('Erro ao excluir item.', true);
      }
    });
  }
});

// =============== EXPORTAÇÕES GLOBAIS ===============
window.carregarListaColaboradores = carregarListaColaboradores;
window.carregarDespesas = carregarDespesas;
window.carregarRendas = carregarRendas;
window.carregarColaboradores = carregarColaboradores;
window.showToast = showToast;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.editarDespesa = editarDespesa;
window.editarRenda = editarRenda;
window.editarColaborador = editarColaborador;
window.confirmarExclusao = confirmarExclusao;

console.log('✅ CRUD.js carregado - SEM MÓDULOS');