import { useState, useEffect } from 'react';
import { api } from '../services/api';

const TIPOS_PG = ['credito', 'debito', 'pix', 'dinheiro', 'outros'];
const CATEGORIAS = [
  'moradia', 'alimentacao', 'restaurante_lanche',
  'casa_utilidades', 'saude', 'transporte', 'lazer_outros'
];

export default function DespesaForm({ despesa, onClose, onSuccess }) {
  const [data, setData] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipoPg, setTipoPg] = useState('credito');
  const [categoria, setCategoria] = useState('');
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
    if (despesa) {
      setData(despesa.data_compra.split('T')[0]);
      setColaboradorId(despesa.colaborador_id);
      setDescricao(despesa.descricao);
      setValor(despesa.valor);
      setTipoPg(despesa.tipo_pg);
      setCategoria(despesa.categoria);
    }
  }, [despesa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        data_compra: `${data}T00:00:00`,
        descricao,
        valor: parseFloat(valor),
        tipo_pg: tipoPg,
        colaborador_id: parseInt(colaboradorId),
        categoria
      };

      let res;
      if (despesa) {
        res = await fetch(`https://controle-familiar.onrender.com/api/despesas/${despesa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('https://controle-familiar.onrender.com/api/despesas', {
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
          <h3>{despesa ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px' }}>×</button>
        </div>
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Colaborador</label>
            <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Valor (R$)</label>
            <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Tipo de Pagamento</label>
            <select value={tipoPg} onChange={(e) => setTipoPg(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              {TIPOS_PG.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Selecione...</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#1e61d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}