// src/components/Navigation.jsx
export default function Navigation({ activeTab, onTabChange }) {
  // Nome interno (usado na lógica) → Nome de exibição (mostrado na tela)
  const tabs = [
    { id: 'Despesas', label: 'Desp' },
    { id: 'Rendas', label: 'Rend' },
    { id: 'Colaboradores', label: 'Colab' },
    { id: 'Resumo', label: 'Resumo' },
  ];

  return (
    <nav className="bg-gray-100 px-2 py-1.5 border-b border-gray-200">
      <div className="flex overflow-x-auto gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}  // Envia o nome completo
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              activeTab === tab.id  // Compara com o nome completo
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {tab.label}  // Mostra o nome abreviado
          </button>
        ))}
      </div>
    </nav>
  );
}