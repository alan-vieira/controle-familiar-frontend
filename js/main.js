console.log('✅ Main.js carregando...');

async function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const baseUrl = window.CONFIG?.API_BASE_URL || 'https://controle-familiar.onrender.com';
  try {
    const res = await fetch(`${baseUrl}/api/auth/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
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

  // Abas
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
      const tab = link.dataset.tab;
      document.getElementById(tab)?.classList.remove('hidden');
      
      if (tab === 'despesas') window.carregarDespesas?.(document.getElementById('despesas-mes')?.value);
      else if (tab === 'rendas') window.carregarRendas?.(document.getElementById('rendas-mes')?.value);
      else if (tab === 'colaboradores') window.carregarColaboradores?.();
    });
  });

  // Modais
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
  });

  // Filtros
  document.getElementById('despesas-mes')?.addEventListener('change', e => window.carregarDespesas?.(e.target.value));
  document.getElementById('rendas-mes')?.addEventListener('change', e => window.carregarRendas?.(e.target.value));

  // Dados iniciais
  const mes = new Date().toISOString().slice(0, 7);
  document.querySelectorAll('input[type="month"]').forEach(i => i.value = mes);
  setTimeout(async () => {
    await window.carregarListaColaboradores?.();
    window.carregarDespesas?.(mes);
    window.carregarRendas?.(mes);
    window.carregarColaboradores?.();
  }, 500);
});