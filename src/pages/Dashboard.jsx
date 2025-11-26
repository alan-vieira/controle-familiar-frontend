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
    <div>
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ padding: '20px' }}>
        {['Despesas', 'Rendas'].includes(activeTab) && (
          <div style={{ marginBottom: '20px' }}>
            <label>Mês: </label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              style={{ padding: '6px', marginLeft: '8px' }}
            />
          </div>
        )}

        {activeTab === 'Despesas' && <DespesasTable mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && <RendasTable mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresTable />}
        {activeTab === 'Resumo' && <ResumoMensal />}
      </div>
    </div>
  );
}