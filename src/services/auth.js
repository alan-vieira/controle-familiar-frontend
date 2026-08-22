// src/services/auth.js
import api from './api';

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
    
    // 'response' é o objeto completo do Axios
    const response = await api.post('/api/auth/login', { username, password });
    
    console.log('Resposta completa do Axios:', response);
    console.log('Dados retornados pelo backend:', response.data);
    
    // Verifica se o status é 200 (OK) e se os dados do usuário existem.
    // O navegador já salvou o cookie HttpOnly automaticamente graças ao 'withCredentials: true'.
    if (response.status === 200 && response.data && response.data.user) {
      console.log('Login bem-sucedido - cookie HttpOnly definido pelo navegador');
      return { success: true, data: response.data };
    }
    
    console.warn('Resposta inesperada do servidor:', response);
    return { success: false, error: 'Resposta inválida do servidor' };
    
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Extrai a mensagem de erro específica do backend (ex: "Credenciais inválidas")
    // ou usa uma mensagem genérica se o backend não retornar nada.
    const errorMessage = error.response?.data?.error || error.response?.data?.msg || error.message || 'Erro ao fazer login';
    
    return { 
      success: false, 
      error: errorMessage 
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
    
    // ✅ CORREÇÃO: Os dados do Axios estão sempre dentro de response.data
    console.log('Resposta do status:', response.data); // Para você ver no console do navegador
    return response.data?.logged_in === true;
    
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
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