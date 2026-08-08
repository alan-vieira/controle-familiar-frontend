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