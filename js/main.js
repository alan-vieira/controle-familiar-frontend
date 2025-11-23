import { loadingManager } from './crud.js';
import { carregarListaColaboradores, carregarDespesas, carregarRendas, carregarColaboradores } from './crud.js';

// Sistema de Abas
function initTabs() {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove classes ativas de todas as abas
      tabLinks.forEach(l => {
        l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600');
        l.classList.add('text-gray-500', 'border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
      });
      
      // Esconde todos os conteúdos
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Ativa a aba clicada
      link.classList.remove('text-gray-500', 'border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
      link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
      
      // Mostra o conteúdo correspondente
      const targetTab = link.dataset.tab;
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.remove('hidden');
      }
    });
  });
}

// Sistema de Modais
function initModals() {
  // Toggle de modais
  document.querySelectorAll('[data-modal-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-modal-toggle');
      const modal = document.getElementById(modalId);
      if (modal) {
        if (modal.classList.contains('hidden')) {
          modal.classList.remove('hidden');
          document.body.classList.add('overflow-hidden');
        } else {
          modal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }
      }
    });
  });

  // Fechar modal ao clicar no backdrop
  document.querySelectorAll('.fixed.inset-0').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.fixed.inset-0:not(.hidden)');
      if (openModal) {
        openModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    }
  });
}

// Inicialização de Filtros
function initFilters() {
  // Filtro de mês para despesas
  const despesasMes = document.getElementById('despesas-mes');
  if (despesasMes) {
    despesasMes.addEventListener('change', (e) => {
      carregarDespesas(e.target.value);
    });
  }

  // Filtro de mês para rendas
  const rendasMes = document.getElementById('rendas-mes');
  if (rendasMes) {
    rendasMes.addEventListener('change', (e) => {
      carregarRendas(e.target.value);
    });
  }
}

// Configuração Inicial
function setupInitialData() {
  const mes = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Define o mês atual nos filtros
  const monthInputs = document.querySelectorAll('input[type="month"]');
  monthInputs.forEach(input => {
    input.value = mes;
  });

  // Carrega dados iniciais
  carregarListaColaboradores().then(() => {
    carregarDespesas(mes);
    carregarRendas(mes);
    carregarColaboradores();
  });
}

// Error Handling Global
function initErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Erro global:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
  });
}

// Health Check da API
function initHealthCheck() {
  // Verifica se a API está online periodicamente
  setInterval(async () => {
    try {
      const response = await fetch('https://controle-familiar.onrender.com/health');
      if (!response.ok) throw new Error('API offline');
      console.log('✅ API está online');
    } catch (error) {
      console.warn('❌ API está offline:', error);
    }
  }, 300000); // A cada 5 minutos
}

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Controle Financeiro Familiar...');
  
  // Inicializa sistemas
  initTabs();
  initModals();
  initFilters();
  initErrorHandling();
  
  // Configura dados iniciais
  setupInitialData();
  
  // Health check (apenas em produção)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    initHealthCheck();
  }
  
  console.log('✅ Aplicação inicializada com sucesso!');
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}