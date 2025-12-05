import { api } from './api';

export const login = async (username, password) => {
  const res = await fetch('https://controle-familiar.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Credenciais inválidas');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

export const checkAuthStatus = async () => {
  try {
    const data = await api('auth/status');
    return data;
  } catch {
    localStorage.removeItem('token');
    return { logged_in: false };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // Redireciona para login
  window.location.href = '/login';
};