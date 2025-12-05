// src/pages/Callback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase lê automaticamente code/state da URL e finaliza o PKCE
      const { data: { error } } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('Erro no callback do OAuth:', error.message);
        alert(`Falha na autenticação: ${error.message}`);
        navigate('/login', { replace: true });
      } else {
        console.log('Login bem-sucedido!');
        navigate('/', { replace: true }); // ou '/despesas'
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg">Processando login com Google...</p>
      </div>
    </div>
  );
}