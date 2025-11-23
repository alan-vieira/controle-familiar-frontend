import CONFIG, { CATEGORIAS, TIPOS_PAGAMENTO } from './config.js';

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
  return CATEGORIAS[cat] || cat;
}

function formatTipoPagamento(tipo) {
  return TIPOS_PAGAMENTO[tipo] || tipo;
}

function mesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Service para requisições HTTP
class ApiService {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async getDespesas(mes = null) {
    const endpoint = mes ? `/api/despesas?mes_vigente=${mes}` : '/api/despesas';
    return this.request(endpoint);
  }

  async saveDespesa(data, id = null) {
    const endpoint = id ? `/api/despesas/${id}` : '/api/despesas';
    return this.request(endpoint, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    });
  }

  async getRendas(mes = null) {
    const endpoint = mes ? `/api/rendas?mes=${mes}` : '/api/rendas';
    return this.request(endpoint);
  }

  async saveRenda(data, id = null) {
    const endpoint = id ? `/api/rendas/${id}` : '/api/rendas';
    return this.request(endpoint, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    });
  }

  async getColaboradores() {
    return this.request('/api/colaboradores');
  }

  async saveColaborador(data, id = null) {
    const endpoint = id ? `/api/colaboradores/${id}` : '/api/colaboradores';
    return this.request(endpoint, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteItem(endpoint, id) {
    return this.request(`/api/${endpoint}/${id}`, { method: 'DELETE' });
  }

  async getResumo(mes) {
    return this.request(`/api/resumo/${mes}`);
  }

  async getStatusDivisao(mes) {
    return this.request(`/api/divisao/${mes}`);
  }

  async toggleDivisaoPaga(mes, paga = true, dataAcerto = null) {
    const endpoint = paga 
      ? `/api/divisao/${mes}/marcar-pago`
      : `/api/divisao/${mes}/desmarcar-pago`;
    
    const payload = paga ? { data_acerto: dataAcerto || new Date().toISOString().split('T')[0] } : {};
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const apiService = new ApiService();

// Estado global
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];
let currentLoadingButton = null;

// Loading Manager
class LoadingManager {
  showButton(button) {
    if (currentLoadingButton) {
      this.hideButton(currentLoadingButton);
    }
    currentLoadingButton = button;
    button.classList.add('btn-loading');
    button.disabled = true;
  }

  hideButton(button) {
    button.classList.remove('btn-loading');
    button.disabled = false;
    if (currentLoadingButton === button) {
      currentLoadingButton = null;
    }
  }

  showGlobal() {
    document.body.classList.add('loading');
    // Adiciona barra de loading global
    if (!document.getElementById('global-loading-bar')) {
      const loadingBar = document.createElement('div');
      loadingBar.id = 'global-loading-bar';
      loadingBar.className = 'global-loading';
      document.body.appendChild(loadingBar);
    }
  }

  hideGlobal() {
    document.body.classList.remove('loading');
    const loadingBar = document.getElementById('global-loading-bar');
    if (loadingBar) {
      loadingBar.remove();
    }
  }
}

export const loadingManager = new LoadingManager();

// Toast System
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

// Modal System
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
    loadingManager.showGlobal();
    const data = await apiService.getColaboradores();
    listaColaboradores = data.colaboradores || [];
    
    const selects = ['despesa-colab', 'renda-colab'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '<option value="">Selecione...</option>' +
        listaColaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    });
  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar lista de colaboradores.', true);
  } finally {
    loadingManager.hideGlobal();
  }
}

// =============== DESPESAS ===============
async function carregarDespesas(mes = null) {
  try {
    loadingManager.showGlobal();
    const data = await apiService.getDespesas(mes);
    renderDespesas(data);
  } catch (err) {
    console.error('Erro ao carregar despesas:', err);
    showToast('Erro ao carregar despesas.', true);
    renderDespesasError();
  } finally {
    loadingManager.hideGlobal();
  }
}

function renderDespesas(data) {
  const tbodyDesktop = document.getElementById('despesas-tbody-desktop');
  const cardsContainer = document.getElementById('despesas-cards');

  if (!tbodyDesktop || !cardsContainer) return;

  if (!data || data.length === 0) {
    const emptyMessage = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center">
          <div class="empty-state">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Nenhuma despesa</h3>
            <p class="text-gray-500">Nenhuma despesa registrada para este mês.</p>
          </div>
        </td>
      </tr>
    `;
    tbodyDesktop.innerHTML = emptyMessage;
    cardsContainer.innerHTML = `
      <div class="empty-state">
        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Nenhuma despesa</h3>
        <p class="text-gray-500">Nenhuma despesa registrada para este mês.</p>
      </div>
    `;
    return;
  }

  // Tabela desktop
  tbodyDesktop.innerHTML = data.map(d => {
    const colaborador = listaColaboradores.find(c => c.id === d.colaborador_id);
    return `
      <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          data-despesa='${JSON.stringify(d).replace(/'/g, "&#39;")}'>
        <td class="px-2 py-3 md:px-4">${formatDateBR(d.data_compra)}</td>
        <td class="px-2 py-3 md:px-4">
          <div class="font-medium">${d.descricao}</div>
          <div class="text-xs text-gray-500">${colaborador?.nome || 'N/A'}</div>
        </td>
        <td class="px-2 py-3 md:px-4">
          <span class="categoria-badge categoria-${d.categoria}">${formatCategoria(d.categoria)}</span>
        </td>
        <td class="px-2 py-3 md:px-4 font-semibold text-red-600">${formatCurrency(d.valor)}</td>
        <td class="px-2 py-3 md:px-4">
          <button class="btn-editar text-blue-600 hover:text-blue-900 mr-2" title="Editar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="btn-excluir text-red-600 hover:text-red-900" title="Excluir">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Cards mobile
  cardsContainer.innerHTML = data.map(d => {
    const colaborador = listaColaboradores.find(c => c.id === d.colaborador_id);
    return `
      <div class="mobile-card bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="font-medium text-gray-900 dark:text-white">${formatDateBR(d.data_compra)}</span>
            <div class="text-xs text-gray-500 mt-1">${colaborador?.nome || 'N/A'}</div>
          </div>
          <span class="text-red-600 font-bold text-lg">${formatCurrency(d.valor)}</span>
        </div>
        <div class="mb-3">
          <div class="font-medium text-gray-900 dark:text-white truncate-2">${d.descricao}</div>
        </div>
        <div class="flex justify-between items-center">
          <span class="categoria-badge categoria-${d.categoria}">${formatCategoria(d.categoria)}</span>
          <div class="flex space-x-2">
            <button onclick="editarDespesaFromData(${d.id})" class="btn-editar text-blue-600 hover:text-blue-900" title="Editar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="btn-excluir text-red-600 hover:text-red-900" title="Excluir">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDespesasError() {
  const tbodyDesktop = document.getElementById('despesas-tbody-desktop');
  const cardsContainer = document.getElementById('despesas-cards');

  const errorMessage = `
    <tr>
      <td colspan="5" class="px-4 py-8 text-center text-red-600">
        Erro ao carregar despesas. Tente novamente.
      </td>
    </tr>
  `;

  if (tbodyDesktop) tbodyDesktop.innerHTML = errorMessage;
  if (cardsContainer) cardsContainer.innerHTML = '<p class="text-center text-red-600">Erro ao carregar despesas.</p>';
}

// =============== RENDAS ===============
async function carregarRendas(mes = null) {
  try {
    loadingManager.showGlobal();
    const data = await apiService.getRendas(mes);
    renderRendas(data);
  } catch (err) {
    console.error('Erro ao carregar rendas:', err);
    showToast('Erro ao carregar rendas.', true);
    renderRendasError();
  } finally {
    loadingManager.hideGlobal();
  }
}

function renderRendas(data) {
  const tbody = document.getElementById('rendas-tbody');
  if (!tbody) return;

  if (!data.rendas || data.rendas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center">
          <div class="empty-state">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Nenhuma renda</h3>
            <p class="text-gray-500">Nenhuma renda registrada para este mês.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.rendas.map(r => `
    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${r.nome}</td>
      <td class="px-4 py-3">${r.mes_ano}</td>
      <td class="px-4 py-3 font-semibold text-green-600">${formatCurrency(r.valor)}</td>
      <td class="px-4 py-3">
        <button onclick="editarRenda(${r.id}, '${r.nome}', '${r.mes_ano}', ${r.valor})" 
                class="btn-editar text-blue-600 hover:text-blue-900 mr-2" title="Editar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button onclick="confirmarExclusao(${r.id}, 'rendas')" 
                class="btn-excluir text-red-600 hover:text-red-900" title="Excluir">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderRendasError() {
  const tbody = document.getElementById('rendas-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center text-red-600">
          Erro ao carregar rendas. Tente novamente.
        </td>
      </tr>
    `;
  }
}

// =============== COLABORADORES ===============
async function carregarColaboradores() {
  try {
    loadingManager.showGlobal();
    const data = await apiService.getColaboradores();
    renderColaboradores(data);
  } catch (err) {
    console.error('Erro ao carregar colaboradores:', err);
    showToast('Erro ao carregar colaboradores.', true);
    renderColaboradoresError();
  } finally {
    loadingManager.hideGlobal();
  }
}

function renderColaboradores(data) {
  const tbody = document.getElementById('colabs-tbody');
  if (!tbody) return;

  if (!data.colaboradores || data.colaboradores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-4 py-8 text-center">
          <div class="empty-state">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Nenhum colaborador</h3>
            <p class="text-gray-500">Nenhum colaborador registrado.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.colaboradores.map(c => `
    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${c.nome}</td>
      <td class="px-4 py-3">Dia ${c.dia_fechamento}</td>
      <td class="px-4 py-3">
        <button onclick="editarColaborador(${c.id}, '${c.nome}', ${c.dia_fechamento})" 
                class="btn-editar text-blue-600 hover:text-blue-900 mr-2" title="Editar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button onclick="confirmarExclusao(${c.id}, 'colaboradores')" 
                class="btn-excluir text-red-600 hover:text-red-900" title="Excluir">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderColaboradoresError() {
  const tbody = document.getElementById('colabs-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-4 py-8 text-center text-red-600">
          Erro ao carregar colaboradores. Tente novamente.
        </td>
      </tr>
    `;
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

function editarDespesaFromData(id) {
  const row = document.querySelector(`tr[data-despesa]`);
  if (row) {
    try {
      const data = JSON.parse(row.dataset.despesa.replace(/&#39;/g, "'"));
      if (data.id === id) {
        editarDespesa(data.id, data.data_compra, data.descricao, data.valor, data.tipo_pg, data.colaborador_id, data.categoria);
        return;
      }
    } catch (e) {
      console.error('Erro ao parsear dados da despesa:', e);
    }
  }
  // Fallback: recarregar dados se não encontrar
  showToast('Carregando dados da despesa...');
  setTimeout(() => {
    const mes = document.getElementById('despesas-mes')?.value;
    carregarDespesas(mes);
  }, 100);
}

function editarRenda(id, nome, mes, valor) {
  document.getElementById('renda-id').value = id;
  
  // Encontrar o ID do colaborador pelo nome
  const colaborador = listaColaboradores.find(c => c.nome === nome);
  if (colaborador) {
    document.getElementById('renda-colab').value = colaborador.id;
  }
  
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
    if (row && row.dataset.despesa) {
      try {
        const data = JSON.parse(row.dataset.despesa.replace(/&#39;/g, "'"));
        editarDespesa(data.id, data.data_compra, data.descricao, data.valor, data.tipo_pg, data.colaborador_id, data.categoria);
      } catch (error) {
        console.error('Erro ao editar despesa:', error);
        showToast('Erro ao carregar dados para edição', true);
      }
    }
  } else if (e.target.closest('.btn-excluir')) {
    const row = e.target.closest('tr');
    if (row && row.dataset.despesa) {
      try {
        const data = JSON.parse(row.dataset.despesa.replace(/&#39;/g, "'"));
        confirmarExclusao(data.id, 'despesas');
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        showToast('Erro ao preparar exclusão', true);
      }
    }
  }
});

// =============== EXCLUSÃO ===============
function confirmarExclusao(id, tipo) {
  currentDeleteId = id;
  currentDeleteEndpoint = tipo;
  abrirModal('deleteModal');
}

document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
  const button = document.getElementById('confirm-delete-btn');
  try {
    loadingManager.showButton(button);
    await apiService.deleteItem(currentDeleteEndpoint, currentDeleteId);
    
    showToast('Item excluído com sucesso!');
    fecharModal('deleteModal');
    
    // Recarregar dados conforme a aba atual
    const mesDespesas = document.getElementById('despesas-mes')?.value;
    const mesRendas = document.getElementById('rendas-mes')?.value;
    
    if (currentDeleteEndpoint === 'despesas') {
      await carregarDespesas(mesDespesas);
    } else if (currentDeleteEndpoint === 'rendas') {
      await carregarRendas(mesRendas);
    } else {
      await carregarColaboradores();
      await carregarListaColaboradores(); // Atualizar selects
    }
  } catch (err) {
    console.error('Erro ao excluir:', err);
    showToast(err.message || 'Erro ao excluir item.', true);
  } finally {
    loadingManager.hideButton(button);
  }
});

// =============== FORMULÁRIOS ===============
document.getElementById('form-despesa')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = e.target.querySelector('button[type="submit"]');
  
  const id = document.getElementById('despesa-id').value;
  const data = document.getElementById('despesa-data').value;
  const descricao = document.getElementById('despesa-descricao').value.trim();
  const valor = parseFloat(document.getElementById('despesa-valor').value);
  const tipo = document.getElementById('despesa-tipo').value;
  const colabId = parseInt(document.getElementById('despesa-colab').value);
  const categoria = document.getElementById('despesa-categoria').value;

  // Validação
  if (!data || !descricao || isNaN(valor) || valor <= 0 || !tipo || !colabId || !categoria) {
    showToast('Preencha todos os campos corretamente.', true);
    return;
  }

  const payload = { 
    data_compra: data, 
    descricao, 
    valor, 
    tipo_pg: tipo, 
    colaborador_id: colabId, 
    categoria 
  };
  
  const mes = document.getElementById('despesas-mes')?.value;

  try {
    loadingManager.showButton(button);
    fecharModal('despesaModal');

    await apiService.saveDespesa(payload, id || undefined);
    
    showToast(id ? 'Despesa atualizada!' : 'Despesa registrada!');
    document.getElementById('form-despesa').reset();
    document.getElementById('despesa-id').value = '';
    await carregarDespesas(mes);
  } catch (err) {
    console.error('Erro ao salvar despesa:', err);
    showToast(err.message || 'Erro ao salvar despesa.', true);
    abrirModal('despesaModal');
  } finally {
    loadingManager.hideButton(button);
  }
});

document.getElementById('form-renda')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = e.target.querySelector('button[type="submit"]');
  
  const id = document.getElementById('renda-id').value;
  const colabId = parseInt(document.getElementById('renda-colab').value);
  const mes = document.getElementById('renda-mes').value;
  const valor = parseFloat(document.getElementById('renda-valor').value);

  if (!colabId || !mes || isNaN(valor) || valor < 0) {
    showToast('Preencha todos os campos corretamente.', true);
    return;
  }

  const payload = id 
    ? { valor } // Na edição, só atualiza o valor
    : { colaborador_id: colabId, mes_ano: mes, valor }; // Na criação, envia todos os dados
  
  const mesAtual = document.getElementById('rendas-mes')?.value;

  try {
    loadingManager.showButton(button);
    fecharModal('rendaModal');

    await apiService.saveRenda(payload, id || undefined);
    
    showToast(id ? 'Renda atualizada!' : 'Renda registrada!');
    document.getElementById('form-renda').reset();
    document.getElementById('renda-id').value = '';
    await carregarRendas(mesAtual);
  } catch (err) {
    console.error('Erro ao salvar renda:', err);
    showToast(err.message || 'Erro ao salvar renda.', true);
    abrirModal('rendaModal');
  } finally {
    loadingManager.hideButton(button);
  }
});

document.getElementById('form-colab')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = e.target.querySelector('button[type="submit"]');
  
  const id = document.getElementById('colab-id').value;
  const nome = document.getElementById('colab-nome').value.trim();
  const dia = parseInt(document.getElementById('colab-dia').value);

  if (!nome || isNaN(dia) || dia < 1 || dia > 31) {
    showToast('Preencha nome e dia de fechamento válido (1-31).', true);
    return;
  }

  const payload = { nome, dia_fechamento: dia };

  try {
    loadingManager.showButton(button);
    fecharModal('colabModal');

    await apiService.saveColaborador(payload, id || undefined);
    
    showToast(id ? 'Colaborador atualizado!' : 'Colaborador criado!');
    document.getElementById('form-colab').reset();
    document.getElementById('colab-id').value = '';
    
    // Recarregar colaboradores e atualizar selects
    await Promise.all([
      carregarColaboradores(),
      carregarListaColaboradores()
    ]);
  } catch (err) {
    console.error('Erro ao salvar colaborador:', err);
    showToast(err.message || 'Erro ao salvar colaborador.', true);
    abrirModal('colabModal');
  } finally {
    loadingManager.hideButton(button);
  }
});

// =============== RESUMO ===============
document.getElementById('btn-carregar-resumo')?.addEventListener('click', async () => {
  const button = document.getElementById('btn-carregar-resumo');
  const mes = document.getElementById('resumo-mes')?.value;
  
  if (!mes) {
    showToast('Selecione um mês.', true);
    return;
  }

  try {
    loadingManager.showButton(button);
    
    const [resumo, status] = await Promise.all([
      apiService.getResumo(mes),
      apiService.getStatusDivisao(mes)
    ]);

    renderResumo(resumo, status, mes);
  } catch (err) {
    console.error('Erro ao carregar resumo:', err);
    showToast(err.message || 'Erro ao carregar resumo.', true);
    renderResumoError();
  } finally {
    loadingManager.hideButton(button);
  }
});

function renderResumo(resumo, status, mes) {
  const container = document.getElementById('resumo-content');
  if (!container) return;

  if (!resumo.colaboradores || resumo.colaboradores.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Sem dados</h3>
        <p class="text-gray-500">Nenhum dado disponível para o mês selecionado.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-3 sm:mb-0">
          <span class="font-medium text-gray-900 dark:text-white">Status da divisão:</span>
          <span class="ml-2 ${status.paga ? 'text-green-600' : 'text-yellow-600'} font-semibold">
            ${status.paga ? '✅ Paga' : '⚠️ Pendente'}
          </span>
        </div>
        <button id="btn-toggle-divisao" 
                class="px-4 py-2 text-sm font-medium rounded-lg ${
                  status.paga 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                } transition-colors">
          ${status.paga ? 'Desmarcar como paga' : 'Marcar como paga'}
        </button>
      </div>
      ${status.paga && status.data_acerto ? `
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Data do acerto: ${formatDateBR(status.data_acerto)}
        </div>
      ` : ''}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  `;

  resumo.colaboradores.forEach(c => {
    const saldoClass = c.saldo >= 0 ? 'text-green-600' : 'text-red-600';
    const saldoIcon = c.saldo >= 0 ? '↑' : '↓';
    
    html += `
      <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3">${c.nome}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Renda:</span>
            <span class="font-medium text-green-600">${formatCurrency(c.renda)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Deve pagar:</span>
            <span class="font-medium text-blue-600">${formatCurrency(c.deve_pagar)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Pagou:</span>
            <span class="font-medium text-purple-600">${formatCurrency(c.pagou)}</span>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <div class="flex justify-between font-semibold">
              <span class="text-gray-900 dark:text-white">Saldo:</span>
              <span class="${saldoClass}">${saldoIcon} ${formatCurrency(Math.abs(c.saldo))}</span>
            </div>
            <div class="text-xs ${saldoClass} mt-1">
              ${c.saldo >= 0 ? 'A receber' : 'A pagar'}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  container.innerHTML = html;

  // Adiciona evento ao botão de alternar status
  document.getElementById('btn-toggle-divisao')?.addEventListener('click', async () => {
    const toggleButton = document.getElementById('btn-toggle-divisao');
    try {
      loadingManager.showButton(toggleButton);
      
      await apiService.toggleDivisaoPaga(mes, !status.paga);
      showToast(status.paga ? 'Divisão desmarcada como paga.' : 'Divisão marcada como paga!');
      
      // Recarrega o resumo para atualizar o status
      document.getElementById('btn-carregar-resumo').click();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      showToast(err.message || 'Erro ao atualizar status.', true);
    } finally {
      loadingManager.hideButton(toggleButton);
    }
  });
}

function renderResumoError() {
  const container = document.getElementById('resumo-content');
  if (container) {
    container.innerHTML = `
      <div class="text-center text-red-600 py-8">
        <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p>Erro ao carregar resumo. Tente novamente.</p>
      </div>
    `;
  }
}

export { 
  carregarListaColaboradores, 
  carregarDespesas, 
  carregarRendas, 
  carregarColaboradores,
  loadingManager 
};

// Exportar funções globais
window.carregarListaColaboradores = carregarListaColaboradores;
window.carregarDespesas = carregarDespesas;
window.carregarRendas = carregarRendas;
window.carregarColaboradores = carregarColaboradores;
window.showToast = showToast;
window.editarDespesa = editarDespesa;
window.editarRenda = editarRenda;
window.editarColaborador = editarColaborador;
window.confirmarExclusao = confirmarExclusao;

console.log('✅ CRUD.js carregado - funções disponíveis globalmente');