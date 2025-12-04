// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // named export ou default, conforme seu supabaseClient.js

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // O Supabase lê automaticamente o code da URL e usa o code_verifier do localStorage
      const { error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('Erro no OAuth callback:', error.message);
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