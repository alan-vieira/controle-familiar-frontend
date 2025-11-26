import { useNavigate } from 'react-router-dom';

export default function Navigation({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const tabs = ['Despesas', 'Rendas', 'Colaboradores', 'Resumo'];

  return (
    <nav style={{ borderBottom: '1px solid #ddd', display: 'flex', gap: '20px', padding: '10px 20px', background: '#f9f9f9' }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => {
            onTabChange(tab);
            navigate('/');
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === tab ? 'bold' : 'normal',
            color: activeTab === tab ? '#1e61d8' : '#333',
            borderBottom: activeTab === tab ? '2px solid #1e61d8' : 'none'
          }}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}