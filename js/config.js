// js/config.js - SEM MÓDULOS - VERSÃO CORRIGIDA
window.CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000'
    : 'https://controle-familiar.onrender.com',
  
  REQUEST_TIMEOUT: 15000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000
};

window.CATEGORIAS = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  restaurante_lanche: 'Restaurante/Lanche',
  casa_utilidades: 'Casa/Utilidades',
  saude: 'Saúde',
  transporte: 'Transporte',
  lazer_outros: 'Lazer/Outros'
};

window.TIPOS_PAGAMENTO = {
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro'
};

console.log('✅ Config.js carregado - SEM MÓDULOS');