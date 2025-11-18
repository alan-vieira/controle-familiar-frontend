// frontend/js/crud.js

// --- Defina a URL base da API do seu backend no Render ---
const API_BASE_URL = 'https://controle-familiar.onrender.com/api'; // Substitua pela URL real do seu backend
// --- FIM DA DEFINIÇÃO ---

// Funções utilitárias
function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  if (yyyy && mm && dd) {
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

function formatCategoria(cat) {
  const labels = {
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

function mesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Estado global
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];

// Função para lidar com erros de autenticação
async function handleAuthError() {
    abrirModal('loginModal');
    showToast('Sua sessão expirou ou você não está autenticado. Faça login novamente.', true);
}

// Alternar abas
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600'));
    link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
  });
});

// Mostrar feedback
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.className = `fixed bottom-4 right-4 flex items-center p-4 text-sm font-normal rounded-lg shadow ${
    isError ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800' : 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800'
  }`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Função para abrir/fechar modais e controlar overflow do body
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    // Foco no primeiro campo do formulário
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
  }
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

// Carregar lista de colaboradores para selects
async function carregarListaColaboradores() {
  try {
    const res = await fetch(`${API_BASE_URL}/colaboradores`); // <-- Atualizado
    // --- Verificar 401 ---
    if (res.status === 401) {
        await handleAuthError();
        return;
    }
    // ---
    const data = await res.json();
    listaColaboradores = data.colaboradores || [];

    const selects = ['despesa-colab', 'renda-colab'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '<option value="">Selecione...</option>' +
        listaColaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    });
  } catch (err) {
    showToast('Erro ao carregar lista de colaboradores.', true);
  }
}

// =============== DESPESAS ===============
async function carregarDespesas(mes = null) {
  try {
    const url = mes ? `${API_BASE_URL}/despesas?mes_vigente=${mes}` : `${API_BASE_URL}/despesas`; // <-- Atualizado
    const res = await fetch(url);
    // --- Verificar 401 ---
    if (res.status === 401) {
        await handleAuthError();
        return;
    }
    // ---
    const data = await res.json();
    const tbodyDesktop = document.getElementById('despesas-tbody-desktop');
    const cardsContainer = document.getElementById('despesas-cards');

    if (!tbodyDesktop || !cardsContainer) return;

    if (data.length === 0) {
      tbodyDesktop.innerHTML = '<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">Nenhuma despesa neste mês.</td></tr>';
      cardsContainer.innerHTML = '<p class="text-center text-gray-500">Nenhuma despesa neste mês.</p>';
      return;
    }

    // Tabela desktop
    tbodyDesktop.innerHTML = data.map(d => `
      <tr class="border-b dark:border-gray-700"
          data-id="${d.id}"
          data-data-compra="${d.data_compra}"
          data-descricao="${d.descricao.replace(/"/g, '&quot;')}"
          data-valor="${d.valor}"
          data-tipo-pg="${d.tipo_pg}"
          data-colaborador-id="${d.colaborador_id}"
          data-categoria="${d.categoria}">
        <td class="px-2 py-3 md:px-4">${formatDateBR(d.data_compra)}</td>
        <td class="px-2 py-3 md:px-4">${d.descricao}</td>
        <td class="px-2 py-3 md:px-4">${formatCategoria(d.categoria)}</td>
        <td class="px-2 py-3 md:px-4 text-red-600">R$ ${parseFloat(d.valor).toFixed(2)}</td>
        <td class="px-2 py-3 md:px-4">
          <button class="btn-editar text-blue-600 hover:text-blue-900 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button class="btn-excluir text-red-600 hover:text-red-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </td>
      </tr>
    `).join('');

    // Cards mobile
    cardsContainer.innerHTML = data.map(d => `
      <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm">
        <div class="flex justify-between mb-2">
          <span class="font-medium">${formatDateBR(d.data_compra)}</span>
          <span class="text-red-600 font-bold">R$ ${parseFloat(d.valor).toFixed(2)}</span>
        </div>
        <div class="mb-2">
          <strong>Descrição:</strong> ${d.descricao}
        </div>
        <div class="mb-2">
          <strong>Categoria:</strong> ${formatCategoria(d.categoria)}
        </div>
        <div class="flex justify-end space-x-2">
          <button onclick="editarDespesa(${d.id}, '${d.data_compra}', '${d.descricao.replace(/'/g, "\\'")}', ${d.valor}, '${d.tipo_pg}', ${d.colaborador_id}, '${d.categoria}')" class="text-blue-600 hover:text-blue-900">
            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 hover:text-red-900">
            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    // Opcional: verificar se o erro foi de rede e não 401 (já tratado acima)
    // Mas o bloco try/catch principal pode capturar outros erros de fetch
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
         // Erro de rede ou CORS
         showToast('Erro de conexão com o servidor.', true);
    } else {
        // Outros erros (ex: 500 do servidor)
        showToast('Erro ao carregar despesas.', true);
    }
  }
}

// =============== RENDAS ===============
async function carregarRendas(mes = null) {
  try {
    const url = mes ? `${API_BASE_URL}/rendas?mes=${mes}` : `${API_BASE_URL}/rendas`; // <-- Atualizado
    const res = await fetch(url);
    // --- Verificar 401 ---
    if (res.status === 401) {
        await handleAuthError();
        return;
    }
    // ---
    const data = await res.json();
    const tbody = document.getElementById('rendas-tbody');
    if (!tbody) return;

    if (!data.rendas || data.rendas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">Nenhuma renda neste mês.</td></tr>';
      return;
    }

    tbody.innerHTML = data.rendas.map(r => `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-3">${r.nome}</td>
        <td class="px-4 py-3">${r.mes_ano}</td>
        <td class="px-4 py-3">R$ ${parseFloat(r.valor).toFixed(2)}</td>
        <td class="px-4 py-3">
          <button onclick="editarRenda(${r.id}, '${r.nome}', '${r.mes_ano}', ${r.valor})" class="text-blue-600 hover:text-blue-900 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onclick="confirmarExclusao(${r.id}, 'rendas')" class="text-red-600 hover:text-red-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Erro ao carregar rendas.', true);
  }
}

// =============== COLABORADORES ===============
async function carregarColaboradores() {
  try {
    const res = await fetch(`${API_BASE_URL}/colaboradores`); // <-- Atualizado
    // --- Verificar 401 ---
    if (res.status === 401) {
        await handleAuthError();
        return;
    }
    // ---
    const data = await res.json();
    const tbody = document.getElementById('colabs-tbody');
    if (!tbody) return;
    if (!data.colaboradores || data.colaboradores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">Nenhum colaborador registrado.</td></tr>';
      return;
    }
    tbody.innerHTML = data.colaboradores.map(c => `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-3">${c.nome}</td>
        <td class="px-4 py-3">${c.dia_fechamento}</td>
        <td class="px-4 py-3">
          <button onclick="editarColaborador(${c.id}, '${c.nome}', ${c.dia_fechamento})" class="text-blue-600 hover:text-blue-900 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onclick="confirmarExclusao(${c.id}, 'colaboradores')" class="text-red-600 hover:text-red-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Erro ao carregar colaboradores.', true);
  }
}

// =============== EDIÇÃO ===============
function editarDespesa(id, data, descricao, valor, tipo, colabId, categoria) {
  document.getElementById('despesa-id').value = id;
  document.getElementById('despesa-data').value = data;
  document.getElementById('despesa-descricao').value = descricao;
  document.getElementById('despesa-valor').value = valor;
  document.getElementById('despesa-tipo').value = tipo;
  document.getElementById('despesa-colab').value = colabId;
  document.getElementById('despesa-categoria').value = categoria;
  abrirModal('despesaModal');
}

function editarRenda(id, nome, mes, valor) {
  document.getElementById('renda-id').value = id;
  document.getElementById('renda-colab').value = nome;
  document.getElementById('renda-mes').value = mes;
  document.getElementById('renda-valor').value = valor;
  abrirModal('rendaModal');
}

function editarColaborador(id, nome, dia) {
  document.getElementById('colab-id').value = id;
  document.getElementById('colab-nome').value = nome;
  document.getElementById('colab-dia').value = dia;
  abrirModal('colabModal');
}

// Event delegation para despesas (desktop)
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-editar')) {
    const row = e.target.closest('tr');
    const id = parseInt(row.dataset.id);
    const data = row.dataset.dataCompra;
    const descricao = row.dataset.descricao;
    const valor = parseFloat(row.dataset.valor);
    const tipo = row.dataset.tipoPg;
    const colabId = parseInt(row.dataset.colaboradorId);
    const categoria = row.dataset.categoria;
    editarDespesa(id, data, descricao, valor, tipo, colabId, categoria);
  } else if (e.target.closest('.btn-excluir')) {
    const id = parseInt(e.target.closest('tr').dataset.id);
    confirmarExclusao(id, 'despesas');
  }
});

// =============== EXCLUSÃO ===============
function confirmarExclusao(id, tipo) {
  currentDeleteId = id;
  currentDeleteEndpoint = tipo;
  abrirModal('deleteModal');
}

document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
  try {
    const endpoint = currentDeleteEndpoint;
    // --- Verificar 401 ---
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${currentDeleteId}`, { method: 'DELETE' }); // <-- Atualizado
    if (res.status === 401) {
        await handleAuthError();
        return;
    }
    // ---
    if (res.ok) {
      showToast('Item excluído com sucesso!');
      fecharModal('deleteModal');
      const mesDespesas = document.getElementById('despesas-mes')?.value;
      const mesRendas = document.getElementById('rendas-mes')?.value;
      if (endpoint === 'despesas') await carregarDespesas(mesDespesas); // Agora carregarDespesas também lida com 401
      else if (endpoint === 'rendas') await carregarRendas(mesRendas);
      else await carregarColaboradores();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Erro ao excluir.', true);
    }
  } catch (err) {
    showToast('Erro de conexão.', true);
  }
});

// =============== FORMULÁRIOS ===============
document.getElementById('form-despesa')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('despesa-id').value;
  const data = document.getElementById('despesa-data').value;
  const descricao = document.getElementById('despesa-descricao').value;
  const valor = parseFloat(document.getElementById('despesa-valor').value);
  const tipo = document.getElementById('despesa-tipo').value;
  const colabId = parseInt(document.getElementById('despesa-colab').value);
  const categoria = document.getElementById('despesa-categoria').value;

  if (!data || !descricao || isNaN(valor) || valor <= 0 || !tipo || !colabId || !categoria) {
    showToast('Preencha todos os campos corretamente.', true);
    return;
  }

  const payload = { data_compra: data, descricao, valor, tipo_pg: tipo, colaborador_id: colabId, categoria };
  const mes = document.getElementById('despesas-mes')?.value;

  try {
    fecharModal('despesaModal');

    let res;
    if (id) {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/despesas/${id}`, { // <-- Atualizado
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    } else {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/despesas`, { // <-- Atualizado
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    }

    if (res.ok) {
      showToast(id ? 'Despesa atualizada!' : 'Despesa registrada!');
      document.getElementById('form-despesa').reset();
      document.getElementById('despesa-id').value = '';
      await carregarDespesas(mes); // Esta função agora também lida com 401
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Erro ao salvar despesa.', true);
      abrirModal('despesaModal');
    }
  } catch (err) {
    console.error('Erro ao salvar despesa:', err);
    showToast('Erro de conexão.', true);
    abrirModal('despesaModal');
  }
});

document.getElementById('form-renda')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('renda-id').value;
  const colabId = parseInt(document.getElementById('renda-colab').value);
  const mes = document.getElementById('renda-mes').value;
  const valor = parseFloat(document.getElementById('renda-valor').value);

  if (!colabId || !mes || isNaN(valor) || valor < 0) {
    showToast('Preencha todos os campos corretamente.', true);
    return;
  }

  const payload = { colaborador_id: colabId, mes_ano: mes, valor };
  const mesAtual = document.getElementById('rendas-mes')?.value;

  try {
    fecharModal('rendaModal');

    let res;
    if (id) {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/rendas/${id}`, { // <-- Atualizado
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor })
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    } else {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/rendas`, { // <-- Atualizado
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    }

    if (res.ok) {
      showToast(id ? 'Renda atualizada!' : 'Renda registrada!');
      document.getElementById('form-renda').reset();
      document.getElementById('renda-id').value = '';
      await carregarRendas(mesAtual);
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Erro ao salvar renda.', true);
      abrirModal('rendaModal');
    }
  } catch (err) {
    console.error('Erro ao salvar renda:', err);
    showToast('Erro de conexão.', true);
    abrirModal('rendaModal');
  }
});

document.getElementById('form-colab')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('colab-id').value;
  const nome = document.getElementById('colab-nome').value;
  const dia = parseInt(document.getElementById('colab-dia').value);

  if (!nome || isNaN(dia) || dia < 1 || dia > 31) {
    showToast('Preencha nome e dia de fechamento válido (1-31).', true);
    return;
  }

  const payload = { nome, dia_fechamento: dia };

  try {
    fecharModal('colabModal');

    let res;
    if (id) {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/colaboradores/${id}`, { // <-- Atualizado
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    } else {
      // --- Verificar 401 ---
      res = await fetch(`${API_BASE_URL}/colaboradores`, { // <-- Atualizado
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---
    }

    if (res.ok) {
      showToast(id ? 'Colaborador atualizado!' : 'Colaborador criado!');
      document.getElementById('form-colab').reset();
      document.getElementById('colab-id').value = '';
      await carregarColaboradores(); // Esta função agora também lida com 401
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Erro ao salvar.', true);
      abrirModal('colabModal');
    }
  } catch (err) {
    console.error('Erro ao salvar colaborador:', err);
    showToast('Erro de conexão.', true);
    abrirModal('colabModal');
  }
});

// =============== RESUMO ===============
document.getElementById('btn-carregar-resumo')?.addEventListener('click', async () => {
  const mes = document.getElementById('resumo-mes')?.value;
  if (!mes) return showToast('Selecione um mês.', true);

  try {
    // --- Verificar 401 para ambas as chamadas ---
    const [resumoRes, statusRes] = await Promise.all([
      fetch(`${API_BASE_URL}/resumo/${mes}`), // <-- Atualizado
      fetch(`${API_BASE_URL}/divisao/${mes}`)  // <-- Atualizado
    ]);

    if (resumoRes.status === 401 || statusRes.status === 401) {
        await handleAuthError();
        return;
    }
    // ---

    const resumo = await resumoRes.json();
    const status = await statusRes.json();

    const container = document.getElementById('resumo-content');
    if (!container) return;

    if (!resumoRes.ok) {
      showToast(resumo.error || 'Erro ao carregar resumo.', true);
      return;
    }

    // Monta o HTML com status da divisão
    let html = `
      <div class="mb-4 flex items-center">
        <span class="mr-2 font-medium">Divisão do mês:</span>
        <span class="${status.paga ? 'text-green-600' : 'text-red-600'} font-medium">
          ${status.paga ? '✅ Paga' : '⚠️ Pendente'}
        </span>
        <button id="btn-toggle-divisao" class="ml-4 text-sm text-blue-600 hover:underline">
          ${status.paga ? 'Desmarcar como paga' : 'Marcar como paga'}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${resumo.colaboradores.map(c => `
          <div class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <h3 class="font-bold text-lg">${c.nome}</h3>
            <p><strong>Renda:</strong> R$ ${c.renda.toFixed(2)}</p>
            <p><strong>Deve pagar:</strong> R$ ${c.deve_pagar.toFixed(2)}</p>
            <p><strong>Pagou:</strong> R$ ${c.pagou.toFixed(2)}</p>
            <p class="${c.saldo >= 0 ? 'text-green-600' : 'text-red-600'}">
              <strong>Saldo:</strong> R$ ${c.saldo.toFixed(2)}
            </p>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;

    // Adiciona evento ao botão de alternar status
    document.getElementById('btn-toggle-divisao')?.addEventListener('click', async () => {
      const url = status.paga
        ? `${API_BASE_URL}/divisao/${mes}/desmarcar-pago` // <-- Atualizado
        : `${API_BASE_URL}/divisao/${mes}/marcar-pago`;   // <-- Atualizado

      const payload = status.paga ? {} : { data_acerto: new Date().toISOString().split('T')[0] };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // --- Verificar 401 ---
      if (res.status === 401) {
          await handleAuthError();
          return;
      }
      // ---

      if (res.ok) {
        showToast(status.paga ? 'Divisão desmarcada como paga.' : 'Divisão marcada como paga!');
        // Recarrega o resumo para atualizar o status
        document.getElementById('btn-carregar-resumo').click();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Erro ao atualizar status.', true);
      }
    });

  } catch (err) {
    // ... (tratamento de erro) ...
  }
});

// =============== INICIALIZAÇÃO ===============
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica login ao carregar a página
    try {
        const res = await fetch(`${API_BASE_URL}/auth/status`); // <-- Atualizado
        if (res.status === 401) {
            // Não está logado, mostrar modal de login
            abrirModal('loginModal');
            document.getElementById('nav-tabs').classList.add('hidden'); // Esconde as abas
        } else {
            // Está logado, mostrar as abas e carregar os dados
            document.getElementById('nav-tabs').classList.remove('hidden'); // Mostra as abas
            await inicializarAplicacao();
        }
    } catch (err) {
        console.error('Erro ao verificar login:', err);
        // Tratar erro de conexão
    }

    // Configurar botões de toggle de modal
    document.querySelectorAll('[data-modal-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-modal-toggle');
            const modal = document.getElementById(target);
            if (modal && modal.classList.contains('hidden')) {
                abrirModal(target);
            } else {
                fecharModal(target);
            }
        });
    });

    // Fechar modal ao clicar no fundo escuro
    document.querySelectorAll('.fixed.inset-0.z-50').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Event listener para o formulário de login
    document.getElementById('form-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // --- ATENÇÃO: Esta chamada deve corresponder à rota no backend ---
            // Se você implementou a solução com /api/login no backend, use:
            const res = await fetch(`${API_BASE_URL}/login`, { // <-- Chamada para a nova rota API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Envia como JSON
                },
                body: JSON.stringify({ username, password }) // Envia como JSON
            });

            if (res.ok) {
                window.location.reload(); // Recarrega a página para carregar o dashboard
            } else {
                const data = await res.json();
                document.getElementById('login-error-message').textContent = data.error || 'Erro ao fazer login.';
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
            document.getElementById('login-error-message').textContent = 'Erro de conexão.';
        }
    });
});

// Função para inicializar a aplicação após login
async function inicializarAplicacao() {
    await carregarListaColaboradores();

    const mes = mesAtual();
    document.getElementById('despesas-mes').value = mes;
    document.getElementById('rendas-mes').value = mes;
    document.getElementById('resumo-mes').value = mes;

    await carregarDespesas(mes);
    await carregarRendas(mes);
    await carregarColaboradores();

    document.getElementById('despesas-mes')?.addEventListener('change', (e) => {
        carregarDespesas(e.target.value);
    });
    document.getElementById('rendas-mes')?.addEventListener('change', (e) => {
        carregarRendas(e.target.value);
    });
}