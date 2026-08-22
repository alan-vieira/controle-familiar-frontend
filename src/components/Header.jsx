import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import api from '../services/api';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Dispara evento para o AuthContext/PrivateRoute lidar com o estado e redirecionamento
      window.dispatchEvent(new Event('auth:expired'));
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Controle Familiar</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
      >
        Sair
      </button>
    </header>
  );
}