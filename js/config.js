// Configuração do ambiente
const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://controle-familiar.onrender.com',
  
  // Timeouts e retries
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// Constantes da aplicação
export const CATEGORIAS = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  restaurante_lanche: 'Restaurante/Lanche',
  casa_utilidades: 'Casa/Utilidades',
  saude: 'Saúde',
  transporte: 'Transporte',
  lazer_outros: 'Lazer/Outros'
};

export const TIPOS_PAGAMENTO = {
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro'
};

export default CONFIG;