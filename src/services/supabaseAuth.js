// src/services/supabaseAuth.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

export const checkAuthStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    logged_in: !!session,
    user: session?.user || null
  };
};

export { supabase };