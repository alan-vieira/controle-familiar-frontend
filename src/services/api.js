const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

export default async function api(endpoint, options = {}) {
  // 1. Monta a URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/api/${endpoint}`;

  // 2. GARANTIA ABSOLUTA DO CONTENT-TYPE
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 3. NORMALIZAÇÃO DO BODY (aceita 'body' ou 'data')
  let requestBody = options.body || options.data;
  if (requestBody && typeof requestBody === 'object') {
    requestBody = JSON.stringify(requestBody);
  }

  // 4. CONFIGURAÇÃO DA REQUISIÇÃO
  const config = {
    method: options.method || 'GET',
    headers: headers,
    credentials: 'include', // Essencial para enviar cookies HttpOnly de autenticação
  };

  // Só adiciona body se não for GET e se existir dados
  if (requestBody && config.method !== 'GET') {
    config.body = requestBody;
  }

  // 5. LOGS DE DEBUG (para você ver no console do navegador se está indo certo)
  console.log('🚀 [API] Request:', config.method, url);
  console.log('📦 [API] Headers:', headers);
  console.log('📝 [API] Body:', requestBody);

  try {
    const response = await fetch(url, config);
    
    // 6. PARSE DA RESPOSTA
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 7. TRATAMENTO DE ERROS
    if (!response.ok) {
      const error = new Error(responseData.message || responseData || 'Erro na requisição');
      error.response = { data: responseData, status: response.status };
      throw error;
    }

    // 8. RETORNO PADRONIZADO (mantém compatibilidade com response.data)
    return { data: responseData, status: response.status, headers: response.headers };
    
  } catch (error) {
    console.error('❌ [API] Erro:', error);
    throw error;
  }
}