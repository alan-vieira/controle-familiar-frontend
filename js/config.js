// js/config.js - Corrigido
window.CONFIG = {
  API_BASE_URL: 'https://controle-familiar.onrender.com',
  VERSION: '1.0'
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

// Validação básica (opcional)
if (!window.CONFIG.API_BASE_URL.startsWith('http')) {
  console.error('API_BASE_URL inválido em config.js');
}

// Override opcional via localStorage (para testes)
const overrideUrl = localStorage.getItem('apiOverride');
if (overrideUrl) {
  window.CONFIG.API_BASE_URL = overrideUrl;
}