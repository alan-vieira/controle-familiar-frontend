import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// INTERCEPTOR: Força o prefixo /api em todas as requisições relativas
api.interceptors.request.use((config) => {
  if (!config.url.startsWith('http') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? config.url : '/' + config.url}`;
  }
  return config;
});

// Logs de debug
api.interceptors.request.use((config) => {
  console.log('🚀 [API] Request:', config.method?.toUpperCase(), config.url);
  console.log('📦 [API] Headers:', config.headers);
  console.log('📝 [API] Body:', config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ [API] Erro:', error.message, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;