// js/main.js - VERSÃO FINAL SEM MÓDULOS

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando Controle Financeiro Familiar...');
  
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
          
          // Carrega dados da aba quando ativada
          setTimeout(() => {
            switch(targetTab) {
              case 'despesas':
                const mesDespesas = document.getElementById('despesas-mes')?.value;
                if (window.carregarDespesas) {
                  window.carregarDespesas(mesDespesas);
                }
                break;
              case 'rendas':
                const mesRendas = document.getElementById('rendas-mes')?.value;
                if (window.carregarRendas) {
                  window.carregarRendas(mesRendas);
                }
                break;
              case 'colaboradores':
                if (window.carregarColaboradores) {
                  window.carregarColaboradores();
                }
                break;
            }
          }, 100);
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
        if (window.carregarDespesas) {
          window.carregarDespesas(e.target.value);
        }
      });
    }

    // Filtro de mês para rendas
    const rendasMes = document.getElementById('rendas-mes');
    if (rendasMes) {
      rendasMes.addEventListener('change', (e) => {
        if (window.carregarRendas) {
          window.carregarRendas(e.target.value);
        }
      });
    }

    // Botão carregar resumo
    const btnResumo = document.getElementById('btn-carregar-resumo');
    if (btnResumo) {
      btnResumo.addEventListener('click', () => {
        const mes = document.getElementById('resumo-mes')?.value;
        if (mes) {
          showToast('Funcionalidade de resumo em desenvolvimento');
        }
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

    // Carrega dados iniciais após um breve delay para garantir que todos os scripts carregaram
    setTimeout(() => {
      if (window.carregarListaColaboradores && window.carregarDespesas && window.carregarRendas && window.carregarColaboradores) {
        console.log('✅ Carregando dados iniciais...');
        window.carregarListaColaboradores().then(() => {
          window.carregarDespesas(mes);
          window.carregarRendas(mes);
          window.carregarColaboradores();
        }).catch(error => {
          console.error('Erro ao carregar dados iniciais:', error);
        });
      } else {
        console.log('⏳ Aguardando funções carregarem...');
        // Tenta novamente após 1 segundo
        setTimeout(setupInitialData, 1000);
      }
    }, 500);
  }

  // Inicializa sistemas
  initTabs();
  initModals();
  initFilters();
  
  // Configura dados iniciais
  setupInitialData();
  
  console.log('✅ Aplicação inicializada com sucesso!');
});