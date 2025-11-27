// src/components/ResumoMensal.jsx
import { useState } from 'react';
import { api } from '../services/api';

export default function ResumoMensal() {
  const [mes, setMes] = useState('');
  const [resumo, setResumo] = useState(null);
  const [divisaoStatus, setDivisaoStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCarregar = async () => {
    if (!mes) {
      setError('Selecione um mês.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const resumoData = await api(`resumo/${mes}`);
      const divisaoData = await api(`divisao/${mes}`);
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

  const handleMarcarComoPago = async () => {
    try {
      const data = await api(`divisao/${mes}/marcar-pago`, { method: 'POST', body: JSON.stringify({}) });
      setDivisaoStatus(data);
    } catch (err) {
      alert('Erro ao marcar como pago: ' + err.message);
    }
  };

  const handleDesmarcarComoPago = async () => {
    try {
      const data = await api(`divisao/${mes}/desmarcar-pago`, { method: 'POST' });
      setDivisaoStatus(data);
    } catch (err) {
      alert('Erro ao desmarcar como pago: ' + err.message);
    }
  };

  if (loading) return <p>Carregando resumo...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mês/Ano</label>
          <input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          />
        </div>
        <button
          onClick={handleCarregar}
          disabled={loading}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Carregar Resumo'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
          {error}
        </div>
      )}

      {resumo && (
        <div className="space-y-6">
          {/* Totais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">R$ {Number(resumo.total_despesas || 0).toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total de Rendas</p>
              <p className="text-2xl font-bold text-green-600">R$ {Number(resumo.total_renda || 0).toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${resumo.saldo_total >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${resumo.saldo_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {Number(resumo.saldo_total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Divisão por colaborador */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Divisão do mês:</h3>
            <div className="space-y-4">
              {resumo.colaboradores.map((c) => (
                <div key={c.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{c.nome}</h4>
                      <p className="text-sm text-gray-600">Renda: R$ {c.renda.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Deve pagar: R$ {c.deve_pagar.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Pagou: R$ {c.pagou.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${c.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Saldo: R$ {c.saldo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                    <span className={`font-medium ${c.status === 'positivo' ? 'text-green-600' : 'text-red-600'}`}>
                      {c.status === 'positivo' ? 'Pendente' : 'Pendente'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800">Marcar como paga</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}