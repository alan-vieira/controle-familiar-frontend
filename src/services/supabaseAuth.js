// src/services/supabaseAuth.js
// Autenticação com Supabase Auth via CDN (sem npm install)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Cria cliente usando variáveis de ambiente do Vercel
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Inicia login com Google
 * Redireciona o usuário para a tela de consentimento do Google
 */
export const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://controle-familiar-frontend.vercel.app/auth/callback.html'
    }
  });

  if (error) {
    console.error('Erro no login com Google:', error);
    throw new Error('Falha ao iniciar login com Google');
  }
};

/**
 * Encerra a sessão do usuário
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<{ logged_in: boolean, user: object|null }>}
 */
export const checkAuthStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    logged_in: !!session,
    user: session?.user || null
  };
};

// Exporta o cliente para uso direto, se necessário
export { supabase };