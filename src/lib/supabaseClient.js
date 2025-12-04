import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',          // ✅ obrigatório para v2+
      detectSessionInUrl: true,
      persistSession: true,
    }
  }
);

export default supabase;