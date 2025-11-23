// js/main.js - SEM MÓDULOS - VERSÃO CORRIGIDA
console.log('🚀 Main.js carregando...');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando Controle Financeiro Familiar...');
  
  // Sistema de Abas
  function initTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        tabLinks.forEach(l => {
          l.classList.remove('active-tab', 'text-primary-600', 'border-primary-600');
        });
        
        tabContents.forEach(content => content.classList.add('hidden'));
        
        link.classList.add('active-tab', 'text-primary-600', 'border-primary-600');
        
        const targetTab = link.dataset.tab;
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.remove('hidden');
          
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
    document.querySelectorAll('[data-modal-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal-toggle');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.toggle('hidden');
          document.body.classList.toggle('overflow-hidden');
        }
      });
    });

    document.querySelectorAll('.fixed.inset-0').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }
      });
    });
  }

  // Inicialização de Filtros
  function initFilters() {
    const despesasMes = document.getElementById('despesas-mes');
    if (despesasMes) {
      despesasMes.addEventListener('change', (e) => {
        if (window.carregarDespesas) {
          window.carregarDespesas(e.target.value);
        }
      });
    }

    const rendasMes = document.getElementById('rendas-mes');
    if (rendasMes) {
      rendasMes.addEventListener('change', (e) => {
        if (window.carregarRendas) {
          window.carregarRendas(e.target.value);
        }
      });
    }
  }

  // Configuração Inicial
  function setupInitialData() {
    const mes = new Date().toISOString().slice(0, 7);
    
    const monthInputs = document.querySelectorAll('input[type="month"]');
    monthInputs.forEach(input => {
      input.value = mes;
    });

    setTimeout(() => {
      if (window.carregarListaColaboradores && window.carregarDespesas) {
        console.log('✅ Carregando dados iniciais...');
        window.carregarListaColaboradores().then(() => {
          window.carregarDespesas(mes);
          window.carregarRendas(mes);
          window.carregarColaboradores();
        });
      } else {
        console.log('⏳ Aguardando funções...');
        setTimeout(setupInitialData, 1000);
      }
    }, 500);
  }

  // Inicializa sistemas
  initTabs();
  initModals();
  initFilters();
  setupInitialData();
  
  console.log('✅ Aplicação inicializada com sucesso!');
});