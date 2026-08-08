// src/services/auth.js

import { api, apiPost } from './api';

const TOKEN_KEY = 'token';

/**
 * Armazena o token de autenticação
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove o token de autenticação
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Retorna o token atual
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Decodifica o payload do JWT sem validar assinatura
 * (para verificar expiração)
 */
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

/**
 * Verifica se o token está expirado
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp está em segundos, Date.now() em ms
  // Adiciona 30 segundos de margem de segurança
  return decoded.exp * 1000 < Date.now() + 30000;
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

/**
 * Login do usuário
 */
export async function login(username, password) {
  try {
    const data = await apiPost('/auth/login', { username, password });
    
    if (data.access_token) {
      setToken(data.access_token);
      return { success: true, data };
    }
    
    return { success: false, error: 'Resposta inválida do servidor' };
  } catch (error) {
    return { 
      success: false, 
      error: error.data?.msg || 'Erro ao fazer login' 
    };
  }
}

/**
 * Logout do usuário
 */
export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await apiPost('/auth/logout', {}, { 
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

/**
 * Valida o token com o servidor
 * (opcional, para casos onde precisamos de certeza absoluta)
 */
export async function validateTokenWithServer() {
  try {
    const response = await api('/auth/validate', { method: 'GET' });
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