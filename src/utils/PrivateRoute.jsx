// src/utils/PrivateRoute.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

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