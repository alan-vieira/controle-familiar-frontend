import { useState, useEffect } from 'react';
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
    <div>
      <h3>Resumo Mensal</h3>
      <div style={{ marginBottom: '16px' }}>
        <label>Mês: </label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} style={{ padding: '6px', marginLeft: '8px' }} />
        <button onClick={handleCarregar} disabled={loading} style={{ marginLeft: '16px', padding: '6px 12px', backgroundColor: '#1e61d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Carregando...' : 'Carregar Resumo'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resumo && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Divisão do mês:</strong>
            {divisaoStatus?.paga ? (
              <>
                <span style={{ color: 'green', fontWeight: 'bold' }}> ✅ Paga</span>
                <button onClick={handleDesmarcarComoPago} style={{ marginLeft: '16px', padding: '4px 8px', background: 'none', border: '1px solid #ccc', cursor: 'pointer' }}>Desmarcar como paga</button>
              </>
            ) : (
              <>
                <span style={{ color: 'red', fontWeight: 'bold' }}> ⚠️ Pendente</span>
                <button onClick={handleMarcarComoPago} style={{ marginLeft: '16px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Marcar como paga</button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {resumo.colaboradores.map((c) => (
              <div key={c.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', width: 'calc(50% - 10px)', minWidth: '300px', backgroundColor: '#f9f9f9' }}>
                <h4>{c.nome}</h4>
                <p><strong>Renda:</strong> R$ {c.renda.toFixed(2)}</p>
                <p><strong>Deve pagar:</strong> R$ {c.deve_pagar.toFixed(2)}</p>
                <p><strong>Pagou:</strong> R$ {c.pagou.toFixed(2)}</p>
                <p style={{ fontWeight: 'bold', color: c.saldo >= 0 ? 'green' : 'red' }}><strong>Saldo:</strong> R$ {c.saldo.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}