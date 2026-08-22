// src/utils/PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/auth';

/**
 * Componente de rota privada com verificação de sessão via API
 * 
 * Melhorias com HttpOnly Cookies:
 * 1. Verifica autenticação consultando /api/auth/status (não localStorage)
 * 2. Ouve eventos de token expirado/logout
 * 3. Mostra loading enquanto valida
 * 4. Redireciona sem recarregar a página
 */
export default function PrivateRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica autenticação consultando a API
    const checkAuth = async () => {
      try {
        const authenticated = await checkAuthStatus();
        setIsValid(authenticated);
        
        if (!authenticated) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsValid(false);
        navigate('/login', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    // Handler para eventos de token expirado
    const handleAuthExpired = () => {
      setIsValid(false);
      navigate('/login', { replace: true });
    };

    // Handler para eventos de logout
    const handleLogout = () => {
      setIsValid(false);
      navigate('/login', { replace: true });
    };

    // Verifica inicialmente
    checkAuth();

    // Adiciona event listeners
    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:logout', handleLogout);

    // Cleanup
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate, location]);

  // Mostra loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Redireciona se não estiver válido
  if (!isValid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Renderiza os children se estiver válido
  return children;
}