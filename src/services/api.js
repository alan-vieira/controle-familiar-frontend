// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

// Timeout padrão (30 segundos — acomoda cold start do Render free tier)
const DEFAULT_TIMEOUT = 30000;

// Configuração de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos

/**
 * Normaliza o endpoint para garantir barra inicial e prefixo /api
 */
function buildUrl(endpoint) {
  // Garante que começa com /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Se já tem /api, usa como está (caso do login: /api/auth/login)
  // Se não tem, adiciona /api
  const fullPath = path.startsWith('/api/') ? path : `/api${path}`;
  
  return `${API_URL}${fullPath}`;
}

/**
 * Verifica se o erro é retryable
 * (apenas erros de rede e 5xx, nunca 4xx)
 */
function isRetryableError(error) {
  if (!error.response) return true;
  const status = error.response.status;
  return status >= 500 && status < 600;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function handle401() {
  localStorage.removeItem('token');
  window.dispatchEvent(new CustomEvent('auth:expired'));
  console.warn('Token expirado, redirecionando para login...');
}

/**
 * Faz uma requisição HTTP com retry e timeout
 */
export async function api(endpoint, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    ...fetchOptions
  } = options;

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // AQUI ESTÁ A CORREÇÃO: usar buildUrl() em vez de concatenação direta
    const response = await fetch(buildUrl(endpoint), {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      handle401();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.msg || `Erro ${response.status}`);
      error.response = response;
      error.data = errorData;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout (${timeout}ms)`);
      timeoutError.response = null;
      error = timeoutError;
    }

    if (retries > 0 && isRetryableError(error)) {
      console.log(`Retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}...`);
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return api(endpoint, { ...options, retries: retries - 1 });
    }

    throw error;
  }
}

export const apiGet = (endpoint, options) => api(endpoint, { ...options, method: 'GET' });
export const apiPost = (endpoint, data, options) => api(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
export const apiPut = (endpoint, data, options) => api(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (endpoint, options) => api(endpoint, { ...options, method: 'DELETE' });

export default api;