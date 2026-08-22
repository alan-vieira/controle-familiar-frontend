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

export default api;
