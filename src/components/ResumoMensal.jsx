// src/components/ResumoMensal.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ResumoMensal() {
  // Define o mês atual como valor inicial (ex: "2025-11")
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 7); // Formato "YYYY-MM"
  });

  const [resumo, setResumo] = useState(null);
  const [divisaoStatus, setDivisaoStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega automaticamente quando `mes` muda
  useEffect(() => {
    if (!mes) {
      setResumo(null);
      setDivisaoStatus(null);
      setError('Selecione um mês.');
      return;
    }

    const carregarDados = async () => {
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

    carregarDados();
  }, [mes]); // ← Dispara sempre que o mês muda

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

  if (loading) return <p className="text-center py-4 text-gray-600">Carregando resumo...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mês/Ano</label>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          />
        </div>
        {/* ❌ Botão "Carregar Resumo" removido */}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {resumo && (
        <div className="space-y-6">
          <div className="flex items-center flex-wrap gap-2">
            <strong className="text-gray-800">Divisão do mês:</strong>
            {divisaoStatus?.paga ? (
              <>
                <span className="text-green-600 font-bold">✅ Paga</span>
                <button
                  onClick={handleDesmarcarComoPago}
                  className="ml-2 text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100"
                >
                  Desmarcar como paga
                </button>
              </>
            ) : (
              <>
                <span className="text-red-600 font-bold">⚠️ Pendente</span>
                <button
                  onClick={handleMarcarComoPago}
                  className="ml-2 text-sm bg-green-600 text-white rounded px-2 py-1 hover:bg-green-700"
                >
                  Marcar como paga
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumo.colaboradores.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-lg">{c.nome}</h4>
                <p><strong>Renda:</strong> R$ {c.renda.toFixed(2)}</p>
                <p><strong>Deve pagar:</strong> R$ {c.deve_pagar.toFixed(2)}</p>
                <p><strong>Pagou:</strong> R$ {c.pagou.toFixed(2)}</p>
                <p className={`font-bold ${c.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <strong>Saldo:</strong> R$ {c.saldo.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}