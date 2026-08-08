// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

// Timeout padrão (30 segundos — acomoda cold start do Render free tier)
const DEFAULT_TIMEOUT = 30000;

// Configuração de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos

/**
 * Verifica se o erro é retryable
 * (apenas erros de rede e 5xx, nunca 4xx)
 */
function isRetryableError(error) {
  // Erros de rede (fetch falhou completamente)
  if (!error.response) return true;
  
  // Erros 5xx (server error)
  const status = error.response.status;
  return status >= 500 && status < 600;
}

/**
 * Delay com Promise
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Interceptador de resposta para lidar com 401
 */
function handle401() {
  // Limpa o token
  localStorage.removeItem('token');
  
  // Dispara evento customizado para o PrivateRoute ouvir
  window.dispatchEvent(new CustomEvent('auth:expired'));
  
  // Não recarrega a página! O PrivateRoute vai redirecionar
  console.warn('Token expirado, redirecionando para login...');
}

/**
 * Faz uma requisição HTTP com retry e timeout
 * @param {string} endpoint - Endpoint da API (ex: '/despesas')
 * @param {Object} options - Opções do fetch
 * @param {number} options.timeout - Timeout em ms
 * @param {number} options.retries - Número de tentativas restantes
 * @returns {Promise<any>} - Resposta JSON
 */
export async function api(endpoint, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    ...fetchOptions
  } = options;

  // Adiciona token de autenticação
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  // Cria AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Trata 401 (token expirado)
    if (response.status === 401) {
      handle401();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    // Trata outros erros
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.msg || `Erro ${response.status}`);
      error.response = response;
      error.data = errorData;
      throw error;
    }

    // Retorna JSON ou texto vazio
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();

  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError = timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout (${timeout}ms)`);
      timeoutError.response = null;
      error = timeoutError;
    }

    // Retry para erros retryable
    if (retries > 0 && isRetryableError(error)) {
      console.log(`Retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}...`);
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // backoff progressivo
      return api(endpoint, { ...options, retries: retries - 1 });
    }

    throw error;
  }
}

/**
 * Métodos HTTP convenientes
 */
export const apiGet = (endpoint, options) => api(endpoint, { ...options, method: 'GET' });
export const apiPost = (endpoint, data, options) => api(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
export const apiPut = (endpoint, data, options) => api(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (endpoint, options) => api(endpoint, { ...options, method: 'DELETE' });

export default api;