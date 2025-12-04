// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';
import supabase from './lib/supabaseClient'; // ✅ Corrigido: caminho relativo DENTRO de src/

function IdleLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login', { replace: true });
        } else {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-center">Carregando autenticação...</div>;
  }

  return authenticated ? children : null;
}

function App() {
  return (
    <Router>
      <IdleLogout />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;