// src/components/ResumoMensal.jsx
import { useState } from 'react';
import { api } from '../services/api';

export default function ResumoMensal() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mesAno, setMesAno] = useState(new Date().toISOString().slice(0, 7));

  const handleCarregar = async () => {
    setLoading(true);
    try {
      const data = await api(`resumo?mes_vigente=${mesAno}`);
      setResumo(data);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
      alert('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  };

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

      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600">R$ {Number(resumo.total_despesas || 0).toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total de Rendas</p>
            <p className="text-2xl font-bold text-green-600">R$ {Number(resumo.total_rendas || 0).toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${resumo.saldo >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-600">Saldo do Mês</p>
            <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Number(resumo.saldo || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}