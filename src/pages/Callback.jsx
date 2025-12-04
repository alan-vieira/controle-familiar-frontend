// src/pages/Callback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL parameters first
        const errorDescription = searchParams.get('error_description');
        const error = searchParams.get('error');

        if (error || errorDescription) {
          console.error('OAuth error:', error || errorDescription);
          alert(`Erro na autenticação: ${errorDescription || error}`);
          navigate('/login');
          return;
        }

        // For OAuth callbacks in a SPA, we need to use handleAuthCallback
        // This method processes the URL fragment containing the OAuth tokens
        const { data, error: callbackError } = await supabase.auth.exchangeCodeForSession();

        if (callbackError) {
          console.error('Erro no callback do OAuth:', callbackError.message);
          alert('Falha na autenticação. Tente novamente.');
          navigate('/login');
          return;
        }

        // If we have a session, redirect to dashboard
        if (data?.session) {
          console.log('Login bem-sucedido, redirecionando...');
          navigate('/');
        } else {
          // If no session, redirect to login
          console.log('Nenhuma sessão encontrada, redirecionando para login');
          navigate('/login');
        }
      } catch (err) {
        console.error('Erro inesperado no callback:', err);
        alert('Erro inesperado. Tente novamente.');
        navigate('/login');
      }
    };

    // Delay the callback processing slightly to ensure URL params are available
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg">Processando login com Google...</p>
      </div>
    </div>
  );
}