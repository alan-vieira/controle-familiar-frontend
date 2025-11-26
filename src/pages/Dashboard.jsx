// src/pages/Dashboard.jsx
import React, { useState } from 'react';
// import Header from '../components/Header'; // opcional: removido
import BottomNav from '../components/BottomNav';
import DespesasList from '../components/DespesasList';
import RendasList from '../components/RendasList';
import ColaboradoresList from '../components/ColaboradoresList';
import ResumoMensal from '../components/ResumoMensal';

const generateMonthOptions = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    months.push({
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleString('pt-BR', { year: 'numeric', month: 'long' })
    });
  }
  return months;
};

const monthOptions = generateMonthOptions();

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Resumo');
  const [mesSelecionado, setMesSelecionado] = useState(monthOptions[0].value);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}

      <main
        key={activeTab} // opcional: scroll-to-top ao trocar aba
        className="pb-16 max-w-md mx-auto px-4 pt-4"
      >
        {['Despesas', 'Rendas'].includes(activeTab) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês:
            </label>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'Despesas' && <DespesasList mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && <RendasList mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresList />}
        {activeTab === 'Resumo' && <ResumoMensal />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}