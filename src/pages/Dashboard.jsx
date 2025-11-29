// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'; // 👈 adicione useEffect
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import DespesasTable from '../components/DespesasTable';
import RendasTable from '../components/RendasTable';
import ColaboradoresTable from '../components/ColaboradoresTable';
import ResumoMensal from '../components/ResumoMensal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Despesas');
  const [mesSelecionado, setMesSelecionado] = useState('');

  // 👇 Define o mês atual após a montagem
  useEffect(() => {
    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMesSelecionado(mesAtual);
  }, []);

  return (
    <div>
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-4 md:p-6">
        {['Despesas', 'Rendas'].includes(activeTab) && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mês:</label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        )}

        {activeTab === 'Despesas' && mesSelecionado && <DespesasTable mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && mesSelecionado && <RendasTable mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresTable />}
        {activeTab === 'Resumo' && mesSelecionado && <ResumoMensal mesAno={mesSelecionado} />}
      </div>
    </div>
  );
}