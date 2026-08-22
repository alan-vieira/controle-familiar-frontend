import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;