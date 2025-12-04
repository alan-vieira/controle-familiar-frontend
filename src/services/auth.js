// src/services/supabaseAuth.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };

// Login com Google
export const loginWithGoogle = () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://controle-familiar-frontend.vercel.app/auth/callback.html'
    }
  });
};

// Logout
export const logout = () => {
  return supabase.auth.signOut();
};

// Verifica se está logado
export const checkAuthStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { logged_in: !!session, user: session?.user || null };
};