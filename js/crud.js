// js/crud.js - Lógica de API, utilitários e CRUD

async function fetchAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  // ✅ URL corrigida (sem espaços)
  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

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

  try {
    const response = await fetch(fullUrl, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      throw new Error('Não autorizado');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.msg || `Erro ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// --- Utilitários ---
function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  return yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : dateStr;
}

function formatCategoria(cat) {
  return (window.CATEGORIAS || {})[cat] || cat;
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
    isError ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800' : 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800'
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

// --- Estado ---
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let listaColaboradores = [];

// --- Funções principais ---
async function carregarListaColaboradores() {
  try {
    const data = await fetchAuth('/api/colaboradores');
    listaColaboradores = Array.isArray(data) ? data : (data.colaboradores || []);
    ['despesa-colab', 'renda-colab'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<option value="">Selecione...</option>' +
          listaColaboradores.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
      }
    });
    return listaColaboradores;
  } catch (err) {
    showToast('Erro ao carregar colaboradores.', true);
    return [];
  }
}

async function carregarDespesas(mes = null) {
  try {
    const url = mes ? `/api/despesas?mes_vigente=${mes}` : '/api/despesas';
    const data = await fetchAuth(url);
    const despesas = Array.isArray(data) ? data : (data.despesas || []);
    
    const tbody = document.getElementById('despesas-tbody-desktop');
    const cards = document.getElementById('despesas-cards');
    const emptyMsg = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Nenhuma despesa.</td></tr>';
    const emptyCards = '<p class="text-center text-gray-500">Nenhuma despesa.</p>';
    
    if (tbody) tbody.innerHTML = despesas.length ? despesas.map(d => `
      <tr><td>${formatDateBR(d.data_compra)}</td><td>${d.descricao}</td><td>${formatCategoria(d.categoria)}</td><td class="text-red-600 font-semibold">${formatCurrency(d.valor)}</td><td><button onclick="editarDespesa(${d.id})" class="text-blue-600">Editar</button> <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600">Excluir</button></td></tr>
    `).join('') : emptyMsg;
    
    if (cards) cards.innerHTML = despesas.length ? despesas.map(d => `
      <div class="mobile-card bg-white dark:bg-gray-700 border rounded p-3 shadow-sm">
        <div class="flex justify-between"><span>${formatDateBR(d.data_compra)}</span><span class="text-red-600">${formatCurrency(d.valor)}</span></div>
        <div class="font-medium">${d.descricao}</div>
        <div class="flex justify-between mt-2">
          <span class="categoria-badge categoria-${d.categoria}">${formatCategoria(d.categoria)}</span>
          <div><button onclick="editarDespesa(${d.id})" class="text-blue-600 text-sm">Editar</button> <button onclick="confirmarExclusao(${d.id}, 'despesas')" class="text-red-600 text-sm">Excluir</button></div>
        </div>
      </div>
    `).join('') : emptyCards;
  } catch (err) {
    showToast('Erro ao carregar despesas.', true);
  }
}

async function carregarRendas(mes = null) {
  try {
    const url = mes ? `/api/rendas?mes=${mes}` : '/api/rendas';
    const data = await fetchAuth(url);
    const rendas = Array.isArray(data) ? data : (data.rendas || []);
    const tbody = document.getElementById('rendas-tbody');
    if (!tbody) return;
    tbody.innerHTML = rendas.length ? rendas.map(r => `
      <tr><td>${r.nome}</td><td>${r.mes_ano}</td><td class="text-green-600 font-semibold">${formatCurrency(r.valor)}</td><td><button onclick="editarRenda(${r.id})" class="text-blue-600">Editar</button> <button onclick="confirmarExclusao(${r.id}, 'rendas')" class="text-red-600">Excluir</button></td></tr>
    `).join('') : '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Nenhuma renda.</td></tr>';
  } catch (err) {
    showToast('Erro ao carregar rendas.', true);
  }
}

async function carregarColaboradores() {
  try {
    await carregarListaColaboradores();
    const tbody = document.getElementById('colabs-tbody');
    if (!tbody) return;
    tbody.innerHTML = listaColaboradores.length ? listaColaboradores.map(c => `
      <tr><td>${c.nome}</td><td>Dia ${c.dia_fechamento}</td><td><button onclick="editarColaborador(${c.id})" class="text-blue-600">Editar</button> <button onclick="confirmarExclusao(${c.id}, 'colaboradores')" class="text-red-600">Excluir</button></td></tr>
    `).join('') : '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Nenhum colaborador.</td></tr>';
  } catch (err) {
    showToast('Erro ao carregar colaboradores.', true);
  }
}

// --- Edição/Exclusão ---
function editarDespesa(id) { showToast('Edição em desenvolvimento.'); }
function editarRenda(id) { showToast('Edição em desenvolvimento.'); }
function editarColaborador(id) { showToast('Edição em desenvolvimento.'); }

function confirmarExclusao(id, tipo) {
  currentDeleteId = id;
  currentDeleteEndpoint = tipo;
  abrirModal('deleteModal');
}

// --- Eventos ---
document.addEventListener('DOMContentLoaded', function() {
  // Despesa form
  const f1 = document.getElementById('form-despesa');
  if (f1) f1.addEventListener('submit', async e => {
    e.preventDefault();
    const data = document.getElementById('despesa-data').value;
    const descricao = document.getElementById('despesa-descricao').value;
    const valor = parseFloat(document.getElementById('despesa-valor').value);
    const tipo = document.getElementById('despesa-tipo').value;
    const colab = parseInt(document.getElementById('despesa-colab').value);
    const cat = document.getElementById('despesa-categoria').value;
    if (!data || !descricao || isNaN(valor) || valor <= 0 || !tipo || !colab || !cat) {
      showToast('Preencha todos os campos corretamente.', true);
      return;
    }
    try {
      await fetchAuth('/api/despesas', { method: 'POST', body: JSON.stringify({
        data_compra: data, descricao, valor, tipo_pg: tipo, colaborador_id: colab, categoria: cat
      })});
      showToast('Despesa salva!');
      fecharModal('despesaModal');
      f1.reset();
      carregarDespesas(document.getElementById('despesas-mes')?.value);
    } catch (err) {
      showToast('Erro ao salvar.', true);
    }
  });

  // Renda form
  const f2 = document.getElementById('form-renda');
  if (f2) f2.addEventListener('submit', async e => {
    e.preventDefault();
    const colab = parseInt(document.getElementById('renda-colab').value);
    const mes = document.getElementById('renda-mes').value;
    const valor = parseFloat(document.getElementById('renda-valor').value);
    if (!colab || !mes || isNaN(valor) || valor <= 0) {
      showToast('Preencha todos os campos corretamente.', true);
      return;
    }
    try {
      await fetchAuth('/api/rendas', { method: 'POST', body: JSON.stringify({
        colaborador_id: colab, mes_ano: mes, valor
      })});
      showToast('Renda salva!');
      fecharModal('rendaModal');
      f2.reset();
      carregarRendas(document.getElementById('rendas-mes')?.value);
    } catch (err) {
      showToast('Erro ao salvar.', true);
    }
  });

  // Colab form
  const f3 = document.getElementById('form-colab');
  if (f3) f3.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('colab-nome').value;
    const dia = parseInt(document.getElementById('colab-dia').value);
    if (!nome || isNaN(dia) || dia < 1 || dia > 31) {
      showToast('Preencha nome e dia válido.', true);
      return;
    }
    try {
      await fetchAuth('/api/colaboradores', { method: 'POST', body: JSON.stringify({
        nome, dia_fechamento: dia
      })});
      showToast('Colaborador salvo!');
      fecharModal('colabModal');
      f3.reset();
      carregarColaboradores();
      carregarListaColaboradores();
    } catch (err) {
      showToast('Erro ao salvar.', true);
    }
  });

  // Delete button
  const delBtn = document.getElementById('confirm-delete-btn');
  if (delBtn) delBtn.addEventListener('click', async () => {
    try {
      await fetchAuth(`/api/${currentDeleteEndpoint}/${currentDeleteId}`, { method: 'DELETE' });
      showToast('Excluído com sucesso!');
      fecharModal('deleteModal');
      if (currentDeleteEndpoint === 'despesas') carregarDespesas(document.getElementById('despesas-mes')?.value);
      else if (currentDeleteEndpoint === 'rendas') carregarRendas(document.getElementById('rendas-mes')?.value);
      else carregarColaboradores();
    } catch (err) {
      showToast('Erro ao excluir.', true);
    }
  });
});

 // Resumo button
  const resumoBtn = document.getElementById('btn-carregar-resumo');
  if (resumoBtn) resumoBtn.addEventListener('click', () => {
    const mes = document.getElementById('resumo-mes')?.value;
    carregarResumo(mes);
  });
});

// --- Funções de Resumo Financeiro ---
async function carregarResumo(mes = null) {
  try {
    const url = mes ? `/api/resumo?mes=${mes}` : '/api/resumo';
    const data = await fetchAuth(url);

    const resumoContent = document.getElementById('resumo-content');
    if (!resumoContent) return;

    if (data && (data.total_despesas !== undefined || data.total_rendas !== undefined)) {
      resumoContent.innerHTML = `
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-600 p-4 rounded-lg shadow">
              <h3 class="font-semibold text-gray-700 dark:text-gray-200">Total de Rendas</h3>
              <p class="text-2xl font-bold text-green-600">${formatCurrency(data.total_rendas || 0)}</p>
            </div>
            <div class="bg-white dark:bg-gray-600 p-4 rounded-lg shadow">
              <h3 class="font-semibold text-gray-700 dark:text-gray-200">Total de Despesas</h3>
              <p class="text-2xl font-bold text-red-600">${formatCurrency(data.total_despesas || 0)}</p>
            </div>
            <div class="bg-white dark:bg-gray-600 p-4 rounded-lg shadow">
              <h3 class="font-semibold text-gray-700 dark:text-gray-200">Saldo</h3>
              <p class="text-2xl font-bold ${(data.total_rendas - data.total_despesas) >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency((data.total_rendas || 0) - (data.total_despesas || 0))}</p>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200">Despesas por Categoria</h3>
            <div class="mt-2 space-y-2">
              ${Object.entries(data.despesas_por_categoria || {}).map(([categoria, valor]) =>
                `<div class="flex justify-between border-b pb-1">
                  <span>${formatCategoria(categoria)}</span>
                  <span class="font-medium text-red-600">${formatCurrency(valor)}</span>
                </div>`
              ).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      resumoContent.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Nenhum dado disponível para o período selecionado.</p>';
    }
  } catch (err) {
    console.error('Erro ao carregar resumo:', err);
    const resumoContent = document.getElementById('resumo-content');
    if (resumoContent) {
      resumoContent.innerHTML = '<p class="text-red-500">Erro ao carregar resumo financeiro.</p>';
    }
    showToast('Erro ao carregar resumo.', true);
  }
}


// --- Exportações globais ---
window.carregarListaColaboradores = carregarListaColaboradores;
window.carregarDespesas = carregarDespesas;
window.carregarRendas = carregarRendas;
window.carregarColaboradores = carregarColaboradores;
window.carregarResumo = carregarResumo;
window.editarDespesa = editarDespesa;
window.editarRenda = editarRenda;
window.editarColaborador = editarColaborador;
window.confirmarExclusao = confirmarExclusao;
window.showToast = showToast;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;