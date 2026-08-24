import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
});

// ============================================
// INTERCEPTORS
// ============================================

// Request: Garante prefixo /api + logs + garante body
api.interceptors.request.use((config) => {
  // 1. URL: garante prefixo /api
  if (!config.url?.startsWith('http') && !config.url?.startsWith('/api')) {
    config.url = `/api${config.url?.startsWith('/') ? config.url : '/' + config.url}`;
  }

  // 2. GARANTE BODY: Se tem data e é POST/PUT/PATCH, garante que está no config
  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    // Axios deveria fazer isso automaticamente, mas garante
    if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = JSON.stringify(config.data);
      config.headers['Content-Type'] = 'application/json';
    }
  }

  // Logs
  console.log('🚀 [API] Request:', config.method?.toUpperCase(), config.url);
  console.log('📦 [API] Headers:', config.headers);
  console.log('📝 [API] Body:', config.data);
  return config;
});

// Response: Logs + retry + 401 handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ [API] Erro:', error.message, error.config?.url, 'Status:', error.response?.status);
    
    // Retry logic (3x para erros de rede/5xx)
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const isNetworkError = !error.response;
    const isRetryableStatus = error.response && retryableStatuses.includes(error.response.status);
    const isRetryable = (isNetworkError || isRetryableStatus) && 
                       originalRequest && 
                       !originalRequest._retryCount;
    
    if (isRetryable) {
      originalRequest._retryCount = 1;
      console.log(`🔄 [API] Retry 1/3 para ${originalRequest.url}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }
    
    // 401 handling
    if (error.response?.status === 401) {
      console.warn('🔐 [API] 401 Unauthorized - disparando auth:expired');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    
    // Padroniza erro
    const axiosError = new Error(
      error.response?.data?.msg || 
      error.response?.data?.error || 
      error.message || 
      'Erro na requisição'
    );
    axiosError.response = error.response;
    axiosError.isAxiosError = true;
    
    return Promise.reject(axiosError);
  }
);

// Métodos de conveniência
export const apiGet = (url, options) => api.get(url, options);
export const apiPost = (url, data, options) => api.post(url, data, options);
export const apiPut = (url, data, options) => api.put(url, data, options);
export const apiPatch = (url, data, options) => api.patch(url, data, options);
export const apiDelete = (url, options) => api.delete(url, options);

export default api;