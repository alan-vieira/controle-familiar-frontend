import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com',
  withCredentials: true, // Essencial para cookies HttpOnly
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ INTERCEPTOR: Garante que todas as rotas tenham o prefixo /api
api.interceptors.request.use((config) => {
  // Se a URL for relativa e não começar com 'http' nem com '/api', adiciona o prefixo
  if (!config.url.startsWith('http') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? config.url : '/' + config.url}`;
  }
  return config;
});

export default api;