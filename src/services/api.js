import axios from 'axios';

// 1. Configuração única e correta do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com',
  withCredentials: true, // ESSENCIAL: permite enviar cookies HttpOnly entre domínios diferentes
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Controle de Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 e não for uma tentativa de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta renovar o token (o cookie HttpOnly é enviado automaticamente)
        await api.post('/api/auth/refresh');
        
        processQueue(null);
        return api(originalRequest); // Reenvia a requisição original
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.dispatchEvent(new Event('auth:expired')); // Notifica o app para deslogar
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;