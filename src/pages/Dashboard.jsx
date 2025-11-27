// src/pages/Dashboard.jsx
import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import DespesasTable from '../components/DespesasTable';
import RendasTable from '../components/RendasTable';
import ColaboradoresTable from '../components/ColaboradoresTable';
import ResumoMensal from '../components/ResumoMensal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Despesas');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-4 md:p-6">
        {['Despesas', 'Rendas'].includes(activeTab) && (
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Mês:</label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm"
            />
          </div>
        )}

        {activeTab === 'Despesas' && <DespesasTable mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && <RendasTable mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresTable />}
        {activeTab === 'Resumo' && <ResumoMensal />}
      </main>
    </div>
  );
}