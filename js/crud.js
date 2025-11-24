// js/crud.js
console.log('🔧 CRUD.js carregando...');

// Nova função de API — SEM TOKEN, com cookies
async function fetchApi(url, options = {}) {
  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

// Funções utilitárias (mantidas)
function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  return yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : dateStr;
}

function formatCategoria(cat) {
  const labels = window.CATEGORIAS || {};
  return labels[cat] || cat;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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

// Estado global
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];

// Carregar colaboradores
async function carregarListaColaboradores() {
  try {
    const data = await fetchApi('/api/colaboradores');
    listaColaboradores = data.colaboradores || [];
    
    ['despesa-colab', 'renda-colab'].forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">Selecione...</option>' +
          listaColaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
      }
    });
    return listaColaboradores;
  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar colaboradores.', true);
    return [];
  }
}

// Despesas
async function carregarDespesas(mes = null) {
  try {
    const url = mes ? `/api/despesas?mes_vigente=${mes}` : `/api/despesas`;
    const data = await fetchApi(url);
    
    const tbody = document.getElementById('despesas-tbody-desktop');
    const cards = document.getElementById('despesas-cards');

    if (!data || data.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Nenhuma despesa.</td></tr>';
      if (cards) cards.innerHTML = '<p class="text-center text-gray-500">Nenhuma despesa.</p>';
      return;
    }

    if (tbody) {
      tbody.innerHTML = data.map(d => {
        const colab = listaColaboradores.find(c => c.id === d.colaborador_id);
        return `
          <tr>
            <td class="px-2 py-3">${formatDateBR(d.data_compra)}</td>
            <td class="px-2 py-3"><div class="font-medium">${d.descricao}</div><div class="text-xs text-gray-500">${colab?.nome || 'N/A'}</div></td>
            <td class="px-2 py-3">${formatCategoria(d.categoria)}</td>
            <td class="px-2 py-3 text-red-600 font-semibold">${formatCurrency(d.valor)}</td>
            <td class="px-2 py-3">
              <button onclick="editarDespesa(${d.id})" class="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
              <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (cards) {
      cards.innerHTML = data.map(d => {
        const colab = listaColaboradores.find(c => c.id === d.colaborador_id);
        return `
          <div class="mobile-card bg-white dark:bg-gray-700 border rounded-lg p-4 shadow-sm">
            <div class="flex justify-between mb-2">
              <span class="font-medium">${formatDateBR(d.data_compra)}</span>
              <span class="text-red-600 font-bold">${formatCurrency(d.valor)}</span>
            </div>
            <div class="font-medium mb-1">${d.descricao}</div>
            <div class="text-xs text-gray-500 mb-2">${colab?.nome || 'N/A'}</div>
            <div class="flex justify-between items-center">
              <span class="categoria-badge categoria-${d.categoria}">${formatCategoria(d.categoria)}</span>
              <div>
                <button onclick="editarDespesa(${d.id})" class="text-blue-600 text-sm mr-2">Editar</button>
                <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 text-sm">Excluir</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar despesas:', err);
    showToast('Erro ao carregar despesas.', true);
  }
}

// Rendas
async function carregarRendas(mes = null) {
  try {
    const url = mes ? `/api/rendas?mes=${mes}` : `/api/rendas`;
    const data = await fetchApi(url);
    
    const tbody = document.getElementById('rendas-tbody');
    if (!tbody) return;

    const rendas = data.rendas || [];
    if (rendas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Nenhuma renda.</td></tr>';
      return;
    }

    tbody.innerHTML = rendas.map(r => `
      <tr>
        <td class="px-4 py-3">${r.nome}</td>
        <td class="px-4 py-3">${r.mes_ano}</td>
        <td class="px-4 py-3 text-green-600 font-semibold">${formatCurrency(r.valor)}</td>
        <td class="px-4 py-3">
          <button onclick="editarRenda(${r.id})" class="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
          <button onclick="confirmarExclusao(${r.id}, 'rendas')" class="text-red-600 hover:text-red-900">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Erro ao carregar rendas:', err);
    showToast('Erro ao carregar rendas.', true);
  }
}

// Colaboradores
async function carregarColaboradores() {
  try {
    await carregarListaColaboradores();
    const tbody = document.getElementById('colabs-tbody');
    if (!tbody) return;

    if (listaColaboradores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Nenhum colaborador.</td></tr>';
      return;
    }

    tbody.innerHTML = listaColaboradores.map(c => `
      <tr>
        <td class="px-4 py-3">${c.nome}</td>
        <td class="px-4 py-3">Dia ${c.dia_fechamento}</td>
        <td class="px-4 py-3">
          <button onclick="editarColaborador(${c.id})" class="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
          <button onclick="confirmarExclusao(${c.id}, 'colaboradores')" class="text-red-600 hover:text-red-900">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar colaboradores.', true);
  }
}

// Funções de edição (placeholders)
function editarDespesa(id) { showToast('Edição em breve.'); }
function editarRenda(id) { showToast('Edição em breve.'); }
function editarColaborador(id) { showToast('Edição em breve.'); }

// Exclusão
function confirmarExclusao(id, tipo) {
  currentDeleteId = id;
  currentDeleteEndpoint = tipo;
  abrirModal('deleteModal');
}

// Eventos de formulário
document.addEventListener('DOMContentLoaded', function() {
  // Despesa
  const formDespesa = document.getElementById('form-despesa');
  if (formDespesa) {
    formDespesa.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { value: data } = document.getElementById('despesa-data');
      const { value: descricao } = document.getElementById('despesa-descricao');
      const { value: valor } = document.getElementById('despesa-valor');
      const { value: tipo } = document.getElementById('despesa-tipo');
      const { value: colabId } = document.getElementById('despesa-colab');
      const { value: categoria } = document.getElementById('despesa-categoria');

      if (!data || !descricao || !valor || !tipo || !colabId || !categoria) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        await fetchApi('/api/despesas', {
          method: 'POST',
          body: JSON.stringify({
            data_compra: data,
            descricao,
            valor: parseFloat(valor),
            tipo_pg: tipo,
            colaborador_id: parseInt(colabId),
            categoria
          })
        });
        showToast('Despesa salva!');
        fecharModal('despesaModal');
        formDespesa.reset();
        carregarDespesas(document.getElementById('despesas-mes')?.value);
      } catch (err) {
        showToast('Erro ao salvar.', true);
      }
    });
  }

  // Renda
  const formRenda = document.getElementById('form-renda');
  if (formRenda) {
    formRenda.addEventListener('submit', async (e) => {
      e.preventDefault();
      const colabId = document.getElementById('renda-colab').value;
      const mes = document.getElementById('renda-mes').value;
      const valor = document.getElementById('renda-valor').value;

      if (!colabId || !mes || !valor) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        await fetchApi('/api/rendas', {
          method: 'POST',
          body: JSON.stringify({
            colaborador_id: parseInt(colabId),
            mes_ano: mes,
            valor: parseFloat(valor)
          })
        });
        showToast('Renda salva!');
        fecharModal('rendaModal');
        formRenda.reset();
        carregarRendas(document.getElementById('rendas-mes')?.value);
      } catch (err) {
        showToast('Erro ao salvar.', true);
      }
    });
  }

  // Colaborador
  const formColab = document.getElementById('form-colab');
  if (formColab) {
    formColab.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('colab-nome').value;
      const dia = document.getElementById('colab-dia').value;

      if (!nome || !dia) {
        showToast('Preencha todos os campos.', true);
        return;
      }

      try {
        await fetchApi('/api/colaboradores', {
          method: 'POST',
          body: JSON.stringify({ nome, dia_fechamento: parseInt(dia) })
        });
        showToast('Colaborador salvo!');
        fecharModal('colabModal');
        formColab.reset();
        carregarColaboradores();
        carregarListaColaboradores();
      } catch (err) {
        showToast('Erro ao salvar.', true);
      }
    });
  }

  // Confirmação de exclusão
  const btn = document.getElementById('confirm-delete-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await fetchApi(`/api/${currentDeleteEndpoint}/${currentDeleteId}`, { method: 'DELETE' });
        showToast('Excluído com sucesso!');
        fecharModal('deleteModal');
        if (currentDeleteEndpoint === 'despesas') carregarDespesas(document.getElementById('despesas-mes')?.value);
        else if (currentDeleteEndpoint === 'rendas') carregarRendas(document.getElementById('rendas-mes')?.value);
        else carregarColaboradores();
      } catch (err) {
        showToast('Erro ao excluir.', true);
      }
    });
  }
});

// Exportações globais
window.carregarListaColaboradores = carregarListaColaboradores;
window.carregarDespesas = carregarDespesas;
window.carregarRendas = carregarRendas;
window.carregarColaboradores = carregarColaboradores;
window.editarDespesa = editarDespesa;
window.editarRenda = editarRenda;
window.editarColaborador = editarColaborador;
window.confirmarExclusao = confirmarExclusao;
window.showToast = showToast;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;

console.log('✅ CRUD.js carregado — corrigido para sessão com cookies');