// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './utils/PrivateRoute';

// Componente interno para gerenciar ociosidade
function IdleLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        // Força limpeza total do estado da app
        window.location.reload();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'];
    const handler = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handler));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
      if (timer) clearTimeout(timer);
    };
  }, [navigate]);

  return null; // Este componente não renderiza nada
}

function App() {
  return (
    <Router>
      <IdleLogout />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;