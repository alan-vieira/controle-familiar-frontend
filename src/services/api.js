import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

// Configurações
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

/**
 * Cliente Axios com HttpOnly cookies + retry logic + interceptor /api
 * Combina segurança HttpOnly + robustez da versão v0.4.0
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,           // 🔐 HttpOnly cookies
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
});

// ============================================
// INTERCEPTORS
// ============================================

// 1. Request: Garante prefixo /api nas URLs relativas
api.interceptors.request.use((config) => {
  if (!config.url?.startsWith('http') && !config.url?.startsWith('/api')) {
    config.url = `/api${config.url?.startsWith('/') ? config.url : '/' + config.url}`;
  }
  
  // Logs de debug
  console.log('🚀 [API] Request:', config.method?.toUpperCase(), config.url);
  console.log('📦 [API] Headers:', config.headers);
  console.log('📝 [API] Body:', config.data);
  return config;
});

// 2. Response: Logs + tratamento de erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ [API] Erro:', error.message, error.config?.url, 'Status:', error.response?.status);
    
    // ============================================
    // RETRY LOGIC (da versão v0.4.0 que funcionava)
    // ============================================
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
    
    // ============================================
    // 401 HANDLING (HttpOnly + fallback)
    // ============================================
    if (error.response?.status === 401) {
      console.warn('🔐 [API] 401 Unauthorized - disparando auth:expired');
      
      // Dispara evento para AuthContext/PrivateRoute lidar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      
      // Não tenta refresh automático (HttpOnly cookie é gerenciado pelo servidor)
      // Apenas propaga o erro para o componente tratar
    }
    
    // Padroniza erro para compatibilidade com componentes
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

// ============================================
// MÉTODOS DE CONVENIÊNCIA (compatibilidade total)
// ============================================
export const apiGet = (url, options) => api.get(url, options);
export const apiPost = (url, data, options) => api.post(url, data, options);
export const apiPut = (url, data, options) => api.put(url, data, options);
export const apiPatch = (url, data, options) => api.patch(url, data, options);
export const apiDelete = (url, options) => api.delete(url, options);

export default api;