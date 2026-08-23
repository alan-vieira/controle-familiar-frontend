const rawBaseUrl = (import.meta.env.VITE_API_URL || 'https://controle-familiar.onrender.com').replace(/\/$/, '');

// Remove /api do final se já vier na env var (evita /api//api/)
const API_BASE_URL = rawBaseUrl.replace(/\/api$/, '');

// Validação para evitar request para o próprio frontend
if (typeof window !== 'undefined' && API_BASE_URL.includes(window.location.origin)) {
  console.warn('[API] ⚠️ VITE_API_URL aponta para o próprio frontend! Verifique as env vars.');
  console.warn('[API] Usando fallback:', 'https://controle-familiar.onrender.com');
}

/**
 * Cliente HTTP estilo Axios usando fetch nativo
 * Suporta: api.get(url), api.post(url, data), api.put(url, data), api.delete(url)
 */
function createApiClient() {
  const request = async (endpoint, options = {}) => {
    // 1. Monta a URL - API_BASE_URL já inclui /api (ou não), endpoint é relativo
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/api/${endpoint}`;

    // 2. GARANTIA ABSOLUTA DO CONTENT-TYPE
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 3. NORMALIZAÇÃO DO BODY
    let requestBody = options.body || options.data;
    if (requestBody && typeof requestBody === 'object') {
      requestBody = JSON.stringify(requestBody);
    }

    // 4. CONFIGURAÇÃO DA REQUISIÇÃO
    const config = {
      method: options.method || 'GET',
      headers: headers,
      credentials: 'include', // Essencial para cookies HttpOnly
    };

    // Só adiciona body se não for GET e se existir dados
    if (requestBody && config.method !== 'GET') {
      config.body = requestBody;
    }

    // 5. LOGS DE DEBUG
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

      // 8. RETORNO PADRONIZADO (compatível com Axios: response.data)
      return { data: responseData, status: response.status, headers: response.headers };

    } catch (error) {
      console.error('❌ [API] Erro:', error);
      throw error;
    }
  };

  // Métodos de conveniência estilo Axios
  return {
    get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
    post: (url, data, options = {}) => request(url, { ...options, method: 'POST', data }),
    put: (url, data, options = {}) => request(url, { ...options, method: 'PUT', data }),
    patch: (url, data, options = {}) => request(url, { ...options, method: 'PATCH', data }),
    delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),
    // Mantém a função original para casos customizados
    request,
  };
}

export default createApiClient();