// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Verifica se a URL contém os parâmetros esperados
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('code')) {
        console.warn('OAuthCallback acessado sem código de autorização');
        navigate('/login', { replace: true });
        return;
      }

      const { error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('Erro no OAuth callback:', error.message);
        alert(`Falha na autenticação: ${error.message}`);
        navigate('/login', { replace: true });
      } else {
        // Sucesso: redireciona para a página inicial
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>Processando login com Google...</div>;
}