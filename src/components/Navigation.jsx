// src/components/Navigation.jsx
export default function Navigation({ activeTab, onTabChange }) {
  const tabs = ['Despesas', 'Rendas', 'Colaboradores', 'Resumo'];

  return (
    <nav className="bg-gray-100 p-2">
      <div className="flex overflow-x-auto space-x-2 pb-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium rounded whitespace-nowrap ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}