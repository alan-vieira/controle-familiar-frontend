// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import DespesasTable from '../components/DespesasTable';
import RendasTable from '../components/RendasTable';
import ColaboradoresTable from '../components/ColaboradoresTable';
import ResumoMensal from '../components/ResumoMensal';

// Função auxiliar para obter o mês atual no formato YYYY-MM
const getMesAtual = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Despesas');
  // ✅ Inicializa diretamente com o mês atual (sem começar vazio)
  const [mesSelecionado, setMesSelecionado] = useState(getMesAtual);

  // Opcional: se quiser garantir que o mês atual é definido mesmo em edge cases
  // o useEffect abaixo pode ser mantido, mas não é estritamente necessário
  // useEffect(() => {
  //   setMesSelecionado(getMesAtual());
  // }, []);

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
                // ✅ Aceita apenas valores válidos: YYYY-(01 a 12)
                if (/^\d{4}-(0[1-9]|1[0-2])$/.test(valor)) {
                  setMesSelecionado(valor);
                }
              }}
              className="border rounded px-3 py-2 w-full sm:w-auto"
            />
          </div>
        )}

        {activeTab === 'Despesas' && <DespesasTable mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && <RendasTable mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresTable />}
        {activeTab === 'Resumo' && <ResumoMensal mesAno={mesSelecionado} />}
      </div>
    </div>
  );
}