// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../lib/supabaseClient'; // ✅ caminho relativo correto

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase lê o code da URL automaticamente
      const { error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        console.error('Erro no OAuth callback:', error);
        alert('Falha na autenticação. Tente novamente.');
        navigate('/login');
      } else {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processando login...</div>;
}