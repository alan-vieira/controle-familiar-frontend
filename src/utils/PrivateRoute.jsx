// src/utils/PrivateRoute.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importa o Supabase via CDN (sem npm install)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return authenticated ? children : null;
}

export default PrivateRoute;