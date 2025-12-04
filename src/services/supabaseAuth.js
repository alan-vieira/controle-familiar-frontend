// src/services/supabaseAuth.js
export const loginWithGoogle = () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://controle-familiar-frontend.vercel.app/auth/callback' // ✅ sem .html
    }
  });
};