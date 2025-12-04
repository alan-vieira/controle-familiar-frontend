// src/services/api.js
import supabase from '../lib/supabaseClient';

const BASE_URL = 'https://controle-familiar.onrender.com/api';

export const api = async (endpoint, options = {}) => {
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch (err) {
    // Sem sessão ativa
  }

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

  let res;
  try {
    res = await fetch(`${BASE_URL}/${endpoint}`, config);
  } catch (err) {
    throw new Error('Sem conexão com o servidor');
  }

  if (!res.ok) {
    if (res.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
      return;
    }

    let errMsg = `Erro ${res.status}`;
    try {
      const json = await res.json();
      errMsg = json.error || json.message || errMsg;
    } catch {
      const text = await res.text();
      errMsg = text || errMsg;
    }
    throw new Error(errMsg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
};