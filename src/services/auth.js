// src/services/supabaseAuth.js
import supabase from '../lib/supabaseClient';

export const loginWithGoogle = () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://controle-familiar-frontend.vercel.app/auth/callback'
    }
  });
};

export const logout = () => {
  return supabase.auth.signOut();
};

export const checkAuthStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { logged_in: !!session, user: session?.user || null };
};