// src/services/auth.js

import { api, apiPost } from './api';

const TOKEN_KEY = 'token';

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function decodeToken(token) {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now() + 30000;
}

export function isAuthenticated() {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

export async function login(username, password) {
  try {
    console.log('Iniciando login para:', username);
    const data = await apiPost('/api/auth/login', { username, password });
    
    console.log('Resposta do login:', data);
    
    if (data.access_token) {
      console.log('Token recebido, salvando...');
      setToken(data.access_token);
      const savedToken = localStorage.getItem('token');
      console.log('Token salvo no localStorage:', savedToken ? 'OK' : 'FALHOU');
      return { success: true, data };
    }
    
    console.warn('Resposta não contém access_token:', data);
    return { success: false, error: 'Resposta inválida do servidor' };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      error: error.data?.msg || error.message || 'Erro ao fazer login' 
    };
  }
}

export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await apiPost('/api/auth/logout', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    }
  } catch (error) {
    console.warn('Erro ao fazer logout no servidor:', error);
  } finally {
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

export async function validateTokenWithServer() {
  try {
    const response = await api('/api/auth/validate', { method: 'GET' });
    return response.valid === true;
  } catch (error) {
    return false;
  }
}

export default {
  login,
  logout,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  isTokenExpired,
  decodeToken,
  validateTokenWithServer,
};