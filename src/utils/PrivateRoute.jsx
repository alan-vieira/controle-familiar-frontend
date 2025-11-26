import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuthStatus } from '../services/auth';

export default function PrivateRoute({ children }) {
  const [isAllowed, setIsAllowed] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      const status = await checkAuthStatus();
      setIsAllowed(status.logged_in === true);
    };
    verify();
  }, []);

  if (isAllowed === null) {
    return <p>Verificando autenticação...</p>;
  }

  return isAllowed ? children : <Navigate to="/login" state={{ from: location }} replace />;
}