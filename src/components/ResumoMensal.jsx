import { useState, useEffect } from 'react';
import api from '../services/api';
import DivisaoPorColaborador from './DivisaoPorColaborador';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);

export default function ResumoMensal({ mesAno }) {
  const [resumo, setResumo] = useState(null);
  const [divisaoStatus, setDivisaoStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      if (!mesAno) {
        setResumo(null);
        setDivisaoStatus(null);
        setError('');
        return;
      }
      setLoading(true);
      setError('');
      try {
        // ✅ CORREÇÃO: Ler response.data em vez do objeto de resposta inteiro
        const resumoResponse = await api(`resumo/${mesAno}`);
        const divisaoResponse = await api(`divisao/${mesAno}`);
        
        setResumo(resumoResponse.data);
        setDivisaoStatus(divisaoResponse.data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar resumo');
        setResumo(null);
        setDivisaoStatus(null);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [mesAno]);

  const handleMarcarComoPago = async () => {
    if (!mesAno) return;
    try {
      // ✅ CORREÇÃO: Axios usa 'data', não 'body'. E ler response.data
      const response = await api(`divisao/${mesAno}/marcar-pago`, {
        method: 'POST',
        data: {}, 
      });
      setDivisaoStatus(response.data);
    } catch (err) {
      alert('Erro ao marcar como pago: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDesmarcarComoPago = async () => {
    if (!mesAno) return;
    try {
      // ✅ CORREÇÃO: Ler response.data
      const response = await api(`divisao/${mesAno}/desmarcar-pago`, { method: 'POST' });
      setDivisaoStatus(response.data);
    } catch (err) {
      alert('Erro ao desmarcar como pago: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTogglePago = () =>
    divisaoStatus?.paga ? handleDesmarcarComoPago() : handleMarcarComoPago();

  if (loading) return <div className="text-center py-8">Carregando resumo...</div>;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Erro ao carregar resumo</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!resumo) {
    return <div className="text-center py-8 text-gray-500">Selecione um mês para ver o resumo</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Financeiro - {resumo.mes}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-600">Total de Rendas</p>
            <p className="text-2xl font-bold text-blue-900">{formatBRL(resumo.total_renda)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-red-600">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-900">{formatBRL(resumo.total_despesas)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-green-600">Saldo</p>
            <p className="text-2xl font-bold text-green-900">{formatBRL(resumo.saldo_total)}</p>
          </div>
        </div>
      </div>

      {/* Divisão por Colaborador (em cards) */}
      <DivisaoPorColaborador
        colaboradores={resumo.colaboradores}
        divisao={divisaoStatus}
        onTogglePago={handleTogglePago}
      />
    </div>
  );
}