// src/services/auth.js
import { api } from './api';

/**
 * Serviço de autenticação baseado em Cookies HttpOnly
 * 
 * Não usa localStorage - a autenticação é gerenciada via cookies HttpOnly
 * e verificada através da API (/api/auth/status)
 */

/**
 * Faz login - o servidor define o cookie HttpOnly na resposta
 */
export async function login(username, password) {
  try {
    console.log('Iniciando login para:', username);
    const data = await api.post('/api/auth/login', { username, password });
    
    console.log('Resposta do login:', data);
    
    // O token vem no cookie HttpOnly, não no body da resposta
    // O navegador armazena automaticamente
    if (data.access_token || data.success) {
      console.log('Login bem-sucedido - cookie HttpOnly definido');
      return { success: true, data };
    }
    
    console.warn('Resposta inválida do servidor:', data);
    return { success: false, error: 'Resposta inválida do servidor' };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      error: error.response?.data?.msg || error.message || 'Erro ao fazer login' 
    };
  }
}

/**
 * Faz logout - limpa o cookie HttpOnly no servidor
 */
export async function logout() {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.warn('Erro ao fazer logout no servidor:', error);
  } finally {
    // Dispara evento para limpar estado local
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

/**
 * Verifica se o usuário está autenticado consultando a API
 * Usado no PrivateRoute para validar a sessão
 */
export async function checkAuthStatus() {
  try {
    const response = await api.get('/api/auth/status');
    // Se chegou aqui sem erro 401, está autenticado
    return response.valid === true || response.logged_in === true || response.authenticated === true;
  } catch (error) {
    // 401 ou erro de rede = não autenticado
    if (error.response?.status === 401) {
      return false;
    }
    // Para outros erros, assume não autenticado por segurança
    return false;
  }
}

/**
 * Decodifica token JWT (útil para pegar info do usuário se necessário)
 * Nota: com HttpOnly cookies, o token não está acessível via JS
 * Esta função é mantida para compatibilidade se o backend enviar o token no body
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

export default {
  login,
  logout,
  checkAuthStatus,
  decodeToken,
};