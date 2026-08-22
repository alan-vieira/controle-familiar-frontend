import axios from 'axios';

// URL base da API usando variável de ambiente do Vite
const API_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

/**
 * Cliente HTTP configurado com Axios
 * 
 * Configurações:
 * - withCredentials: true → ESSENCIAL para enviar cookies HttpOnly automaticamente
 * - baseURL: URL da API (produção ou desenvolvimento via Vite)
 * - timeout: 30 segundos (acomoda cold start do Render free tier)
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Permite envio automático de cookies HttpOnly
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Estado para controle de refresh token
let isRefreshing = false;
let failedQueue = [];

/**
 * Processa a fila de requisições que falharam com 401
 * Resolve ou rejeita todas as promises na fila baseado no resultado do refresh
 * 
 * @param {Error|null} error - Erro do refresh (se houver)
 * @param {string|null} token - Novo token (não usado com cookies, mas mantido para compatibilidade)
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  // Limpa a fila após processar
  failedQueue = [];
};

/**
 * Interceptor de Resposta - Trata erros 401 com Refresh Token Rotation
 * 
 * Fluxo:
 * 1. Se erro 401 e não é retry da requisição original
 * 2. Se já está fazendo refresh → adiciona à fila e aguarda
 * 3. Se não está fazendo refresh → inicia processo de refresh
 * 4. Tenta POST /api/auth/refresh (cookies HttpOnly são enviados automaticamente)
 * 5. Se sucesso → processa fila (resolve promises) e reenvia requisição original
 * 6. Se falha → processa fila (rejeita promises) e dispara evento 'auth:expired'
 * 7. finally → libera flag isRefreshing
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se é erro 401 (Não Autorizado) e não é uma requisição de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já está fazendo refresh, adiciona à fila e aguarda
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Após refresh bem-sucedido, reenvia a requisição original
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marca como retry e inicia processo de refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta fazer refresh do token
        // O cookie HttpOnly é enviado automaticamente graças a withCredentials: true
        await api.post('/api/auth/refresh');
        
        // Refresh bem-sucedido: processa fila (resolve todas as promises aguardando)
        processQueue(null);
        
        // Reenvia a requisição original que falhou
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou: processa fila rejeitando todas as promises
        processQueue(refreshError, null);
        
        // Dispara evento global para notificar expiração da sessão
        // O app pode ouvir este evento e redirecionar para login
        window.dispatchEvent(new Event('auth:expired'));
        
        return Promise.reject(refreshError);
      } finally {
        // Libera a flag para permitir novos refreshs
        isRefreshing = false;
      }
    }

    // Para outros erros, apenas propaga
    return Promise.reject(error);
  }
);

export default api;