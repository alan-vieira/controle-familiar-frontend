// js/config.js - Configurações globais para API e categorias

// Detecta ambiente baseado no hostname (dev vs prod)
const isProduction = window.location.hostname === 'controle-familiar.onrender.com';

window.CONFIG = {
  API_BASE_URL: isProduction 
    ? 'https://controle-familiar.onrender.com' 
    : 'http://localhost:3000',  // Fallback para dev
  VERSION: '1.0'  // Para cache-busting ou logs
};

// Validação básica
if (!window.CONFIG.API_BASE_URL.startsWith('http')) {
  console.error('API_BASE_URL inválido em config.js');
}

window.CATEGORIAS = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  restaurante_lanche: 'Restaurante/Lanche',
  casa_utilidades: 'Casa/Utilidades',
  saude: 'Saúde',
  transporte: 'Transporte',
  lazer_outros: 'Lazer/Outros'
};

// Validação: Garante que seja um objeto não vazio
if (typeof window.CATEGORIAS !== 'object' || Object.keys(window.CATEGORIAS).length === 0) {
  console.error('CATEGORIAS inválido em config.js');
}

// Override opcional via localStorage (para testes)
const overrideUrl = localStorage.getItem('apiOverride');
if (overrideUrl) {
  window.CONFIG.API_BASE_URL = overrideUrl;
}