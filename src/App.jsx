// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route, useNavigate, useState } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// ✅ Corrigido: removido espaço extra
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function IdleLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    let timer;

    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timer) clearTimeout(timer);
    };
  }, [navigate]);

  return null;
}

function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // ✅ Corrigido: destructuring correto
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

  if (loading) return <div>Carregando...</div>;
  return authenticated ? children : null;
}

function App() {
  return (
    <Router>
      <IdleLogout />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;