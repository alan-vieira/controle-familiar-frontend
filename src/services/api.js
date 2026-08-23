const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com';

export default async function api(endpoint, options = {}) {
  // Permite URLs completas ou relativas
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/api/${endpoint}`;

  // 1. GARANTE O CABEÇALHO CONTENT-TYPE para requisições com body/data
  const headers = {
    ...(options.body || options.data ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  // 2. NORMALIZA O BODY (suporta tanto 'body' quanto 'data' como propriedade)
  let requestBody = options.body;
  if (options.data && !options.body) {
    requestBody = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
  } else if (typeof requestBody === 'object' && requestBody !== null) {
    requestBody = JSON.stringify(requestBody);
  }

  // 3. CONFIGURAÇÃO DA REQUISIÇÃO
  const config = {
    ...options,
    body: requestBody,
    credentials: 'include', // Essencial para enviar cookies HttpOnly de autenticação
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // 4. PARSE DA RESPOSTA (lida com JSON ou texto vazio)
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 5. TRATAMENTO DE ERROS
    if (!response.ok) {
      const error = new Error(responseData.message || responseData || 'Erro na requisição');
      error.response = { data: responseData, status: response.status };
      throw error;
    }

    // 6. RETORNO PADRONIZADO (mantém compatibilidade com response.data)
    return { 
      data: responseData, 
      status: response.status, 
      headers: response.headers 
    };
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
    throw error;
  }
}