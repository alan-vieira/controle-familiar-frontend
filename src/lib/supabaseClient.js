// src/lib/supabaseClient.js
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',          // ✅ obrigatório
      detectSessionInUrl: true,
      persistSession: true,
    }
  }
);