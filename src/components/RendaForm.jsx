import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function RendaForm({ renda, onClose, onSuccess }) {
  const [colaboradorId, setColaboradorId] = useState('');
  const [mesAno, setMesAno] = useState('');
  const [valor, setValor] = useState('');
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api('colaboradores');
        setColaboradores(data);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (renda) {
      setColaboradorId(renda.colaborador_id);
      setMesAno(renda.mes_ano);
      setValor(renda.valor);
    }
  }, [renda]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        colaborador_id: parseInt(colaboradorId),
        mes_ano,
        valor: parseFloat(valor)
      };

      let res;
      if (renda) {
        res = await fetch(`https://controle-familiar.onrender.com/api/rendas/${renda.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('https://controle-familiar.onrender.com/api/rendas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao salvar');
      }

      onSuccess();
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>{renda ? 'Editar Renda' : 'Nova Renda'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px' }}>×</button>
        </div>
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Colaborador</label>
            <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Mês/Ano</label>
            <input type="month" value={mesAno} onChange={(e) => setMesAno(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Valor (R$)</label>
            <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}