export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const BASE_URL = 'https://controle-familiar.onrender.com/api';

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/${endpoint}`, config);

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Erro ${res.status}`);
  }

  return res.json();
};