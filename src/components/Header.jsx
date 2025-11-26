// src/components/Header.jsx
import { logout } from '../services/auth';

export default function Header() {
  return (
    <header style={{
      backgroundColor: '#1e61d8',
      color: 'white',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>💰</span>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Controle Financeiro Familiar</h1>
      </div>
      <button
        onClick={logout}
        style={{
          background: 'none',
          border: '1px solid white',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        title="Sair"
      >
        Sair
      </button>
    </header>
  );
}