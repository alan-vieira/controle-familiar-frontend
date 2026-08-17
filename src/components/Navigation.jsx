// src/components/Navigation.jsx
export default function Navigation({ activeTab, onTabChange }) {
  const tabs = ['Desp', 'Rend', 'Colab', 'Resumo'];

  return (
    <nav className="bg-gray-100 px-2 py-1.5 border-b border-gray-200">
      <div className="flex overflow-x-auto gap-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}