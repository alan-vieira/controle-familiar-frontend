import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();               // chama a API + remove token + dispara evento
    navigate('/login', { replace: true });
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