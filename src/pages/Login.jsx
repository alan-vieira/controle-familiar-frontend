import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      // ✅ VERIFICAR se o login teve sucesso
      if (result.success) {
        console.log('Login bem-sucedido, redirecionando para:', from);
        navigate(from, { replace: true });
      } else {
        // Login falhou — mostrar erro
        setError(result.error || 'Credenciais inválidas');
        console.error('Falha no login:', result.error);
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded bg-white p-6 shadow">
        <h2 className="text-center text-2xl font-bold">🔐 Login</h2>
        
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            name="username"
            autoComplete="username"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}