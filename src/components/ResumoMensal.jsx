import { useState, useEffect } from 'react';
import { api } from '../services/api';

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
        // ✅ CORRIGIDO: path parameter em vez de query string
        const resumoData = await api(`resumo/${mesAno}`);
        const divisaoData = await api(`divisao/${mesAno}`);
        setResumo(resumoData);
        setDivisaoStatus(divisaoData);
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
      // ✅ CORRIGIDO: path parameter
      const data = await api(`divisao/${mesAno}/marcar-pago`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      setDivisaoStatus(data);
    } catch (err) {
      alert('Erro ao marcar como pago: ' + err.message);
    }
  };

  const handleDesmarcarComoPago = async () => {
    if (!mesAno) return;
    try {
      // ✅ CORRIGIDO: path parameter
      const data = await api(`divisao/${mesAno}/desmarcar-pago`, {
        method: 'POST'
      });
      setDivisaoStatus(data);
    } catch (err) {
      alert('Erro ao desmarcar como pago: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando resumo...</div>;
  }

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
            <p className="text-2xl font-bold text-blue-900">
              R$ {resumo.total_renda.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-red-600">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-900">
              R$ {resumo.total_despesas.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-green-600">Saldo</p>
            <p className="text-2xl font-bold text-green-900">
              R$ {resumo.saldo_total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Divisão por Colaborador */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Divisão por Colaborador</h3>
          {divisaoStatus && (
            <button
              onClick={divisaoStatus.paga ? handleDesmarcarComoPago : handleMarcarComoPago}
              className={`px-4 py-2 rounded text-white font-medium ${
                divisaoStatus.paga
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {divisaoStatus.paga ? 'Desmarcar como Pago' : 'Marcar como Pago'}
            </button>
          )}
        </div>

        {divisaoStatus && divisaoStatus.paga && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-green-800 font-medium">
              ✅ Divisão marcada como paga
              {divisaoStatus.data_acerto && ` em ${new Date(divisaoStatus.data_acerto).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Colaborador</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Renda</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">%</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Deve Pagar</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Pagou</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resumo.colaboradores.map((colab) => (
                <tr key={colab.id} className={colab.status === 'negativo' ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 text-sm">{colab.nome}</td>
                  <td className="px-4 py-3 text-sm text-right">R$ {colab.renda.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right">{colab.percentual.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-right">R$ {colab.deve_pagar.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right">R$ {colab.pagou.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    colab.status === 'positivo' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {colab.saldo.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}