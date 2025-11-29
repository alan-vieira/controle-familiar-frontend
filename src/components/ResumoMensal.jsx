// src/components/ResumoMensal.jsx
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
  }, [mesAno]); // ← Recarrega sempre que o mês mudar (vindo do pai)

  const handleMarcarComoPago = async () => {
    if (!mesAno) return;
    try {
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
      const data = await api(`divisao/${mesAno}/desmarcar-pago`, {
        method: 'POST'
      });
      setDivisaoStatus(data);
    } catch (err) {
      alert('Erro ao desmarcar como pago: ' + err.message);
    }
  };

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando resumo...</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      {resumo ? (
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
            {resumo.colaboradores?.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-lg">{c.nome}</h4>
                <p><strong>Renda:</strong> R$ {Number(c.renda).toFixed(2)}</p>
                <p><strong>Deve pagar:</strong> R$ {Number(c.deve_pagar).toFixed(2)}</p>
                <p><strong>Pagou:</strong> R$ {Number(c.pagou).toFixed(2)}</p>
                <p className={`font-bold ${c.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <strong>Saldo:</strong> R$ {Number(c.saldo).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : !error && mesAno ? (
        <p className="text-center text-gray-500">Nenhum dado encontrado para {mesAno}.</p>
      ) : null}
    </div>
  );
}