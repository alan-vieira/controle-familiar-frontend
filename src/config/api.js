// src/config/api.js

/**
 * Configuração da API
 * Use variáveis de ambiente para diferentes ambientes
 */
export const API_CONFIG = {
  // URL da API (use VITE_API_URL no .env)
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com',
  
  // Timeout padrão (ms)
  timeout: 10000,
  
  // Configuração de retry
  retry: {
    maxRetries: 3,
    baseDelay: 1000, // 1 segundo
    maxDelay: 10000, // 10 segundos
  },
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;