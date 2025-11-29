// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import DespesasTable from '../components/DespesasTable';
import RendasTable from '../components/RendasTable';
import ColaboradoresTable from '../components/ColaboradoresTable';
import ResumoMensal from '../components/ResumoMensal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Despesas');
  const [mesSelecionado, setMesSelecionado] = useState('');

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
        {['Despesas', 'Rendas', 'Resumo'].includes(activeTab) && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mês:</label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => {
                const valor = e.target.value;
                if (/^\d{4}-(0[1-9]|1[0-2])$/.test(valor)) {
                  setMesSelecionado(valor);
                }
              }}
              className="border rounded px-3 py-2 w-full sm:w-auto"
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