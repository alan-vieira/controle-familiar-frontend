// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import DespesasTable from '../components/DespesasTable';
import RendasTable from '../components/RendasTable';
import ColaboradoresTable from '../components/ColaboradoresTable';
import ResumoMensal from '../components/ResumoMensal';

const getMesAtual = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const validarMes = (valor) => {
  if (!valor || typeof valor !== 'string') return null;
  const [anoStr, mesStr] = valor.split('-');
  const ano = parseInt(anoStr, 10);
  const mes = parseInt(mesStr, 10);
  if (isNaN(ano) || isNaN(mes) || ano < 2000 || ano > 2030 || mes < 1 || mes > 12) {
    return null;
  }
  return `${ano}-${mes.toString().padStart(2, '0')}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Despesas');
  const [mesSelecionado, setMesSelecionado] = useState(getMesAtual());

  useEffect(() => {
    const checkAuth = async () => {
      // ✅ Corrigido: destructuring correto
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleMesChange = (e) => {
    const mesValido = validarMes(e.target.value);
    if (mesValido) setMesSelecionado(mesValido);
  };

  const abasComMes = ['Despesas', 'Rendas', 'Resumo'];

  return (
    <div>
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="p-4 md:p-6">
        {abasComMes.includes(activeTab) && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mês:</label>
            <input
              type="month"
              value={mesSelecionado}
              onChange={handleMesChange}
              className="border rounded px-3 py-2 w-full sm:w-auto"
            />
          </div>
        )}

        {activeTab === 'Despesas' && <DespesasTable mesAno={mesSelecionado} />}
        {activeTab === 'Rendas' && <RendasTable mesAno={mesSelecionado} />}
        {activeTab === 'Colaboradores' && <ColaboradoresTable />}
        {activeTab === 'Resumo' && <ResumoMensal mesAno={mesSelecionado} />}
      </main>
    </div>
  );
}