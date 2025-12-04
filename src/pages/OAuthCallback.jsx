// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient'; // default import

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // ✅ Método correto na v2+
      const { error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('Erro no callback:', error.message);
        alert(`Falha na autenticação: ${error.message}`);
        navigate('/login', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processando login com Google...</div>;
}