// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Função ASSÍNCRONA dentro do useEffect
    const handleCallback = async () => {
      try {
        // ✅ await só pode estar DENTRO de async
        const {  { error } } = await supabase.auth.getSessionFromUrl();

        if (error) {
          console.error('Erro no callback:', error.message);
          navigate('/login', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        navigate('/login', { replace: true });
      }
    };

    // ✅ Chama a função async
    handleCallback();
  }, [navigate]);

  return <div>Processando login...</div>;
}