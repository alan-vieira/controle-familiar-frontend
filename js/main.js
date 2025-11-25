// js/main.js - Inicialização, auth check e eventos de UI

console.log('✅ Main.js carregando...');

// Função para aguardar dependências (evita erros de ordem)
function waitForGlobals() {
  return new Promise(resolve => {
    const check = () => {
      if (window.carregarDespesas && window.CONFIG) {
        resolve();
      } else {
        setTimeout(check, 100);  // Checa a cada 100ms
      }
    };
    check();
  });
}

async function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com'; // ← ESPAÇOS REMOVIDOS
  try {
    const res = await fetch(`${baseUrl}/api/auth/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      return false;
    }
    return res.ok;
  } catch (error) {
    console.error('Erro na verificação de auth:', error);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const autenticado = await verificarAutenticacao();
  if (!autenticado) {
    window.location.href = 'login.html';
    return;
  }

  // Aguarda dependências
  await waitForGlobals();

  // Abas
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      // Reset all
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      // Activate clicked
      link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
      const tab = link.dataset.tab;
      const tabElement = document.getElementById(tab);
      if (tabElement) {
        tabElement.classList.remove('hidden');
        // Carrega dados conforme aba
        const mes = document.getElementById(`${tab}-mes`)?.value;
        if (tab === 'despesas') window.carregarDespesas(mes);
        else if (tab === 'rendas') window.carregarRendas(mes);
        else if (tab === 'colaboradores') window.carregarColaboradores();
        else if (tab === 'resumo' && window.carregarResumo) window.carregarResumo(mes);
      } else {
        console.warn(`Aba ${tab} não encontrada.`);
      }
    });
  });

  // Modais (com suporte a Escape)
  document.querySelectorAll('[data-modal-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modalToggle;
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    });
  });
  document.querySelectorAll('.fixed.inset-0').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
    // Suporte a Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

  // Filtros (com debounce para evitar requests excessivos)
  let debounceTimer;
  const addDebouncedChange = (elementId, callback) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(callback, 300);
      });
    }
  };
  addDebouncedChange('despesas-mes', e => window.carregarDespesas(e.target.value));
  addDebouncedChange('rendas-mes', e => window.carregarRendas(e.target.value));
  addDebouncedChange('resumo-mes', e => window.carregarResumo?.(e.target.value));

  // Dados iniciais
  const mesAtual = new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });  // Formato YYYY-MM
  document.querySelectorAll('input[type="month"]').forEach(i => i.value = mesAtual);
  
  // Carrega em paralelo
  await Promise.all([
    window.carregarListaColaboradores(),
    window.carregarDespesas(mesAtual),
    window.carregarRendas(mesAtual),
    window.carregarColaboradores()
  ]);
});