// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
  // Não faça nada — a sessão é processada automaticamente
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      } else {
        navigate('/login');
      }
    };
    check();
  }, [navigate]);

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