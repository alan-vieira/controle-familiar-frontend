// js/main.js - JWT + autenticação ativa
console.log('🚀 Main.js carregando...');

async function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com';
  try {
    const response = await fetch(`${baseUrl}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const autenticado = await verificarAutenticacao();
  if (!autenticado) {
    window.location.href = 'login.html';
    return;
  }

  // ... resto da inicialização (abas, modais, etc.)
  console.log('✅ Usuário autenticado via JWT.');

  function initTabs() { /* ... */ }
  function initModals() { /* ... */ }
  function initFilters() { /* ... */ }

  function setupInitialData() {
    const mes = new Date().toISOString().slice(0, 7);
    document.querySelectorAll('input[type="month"]').forEach(i => i.value = mes);
    setTimeout(() => {
      if (window.carregarListaColaboradores) {
        window.carregarListaColaboradores().then(() => {
          window.carregarDespesas?.(mes);
          window.carregarRendas?.(mes);
          window.carregarColaboradores?.();
        });
      } else {
        setTimeout(setupInitialData, 1000);
      }
    }, 500);
  }

  initTabs();
  initModals();
  initFilters();
  setupInitialData();
});