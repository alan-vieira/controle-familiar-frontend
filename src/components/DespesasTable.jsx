import { useState, useEffect } from 'react';
import { api } from '../services/api';
import DespesaForm from './DespesaForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const CATEGORIA_LABELS = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  restaurante_lanche: 'Rest./Lanche',
  casa_utilidades: 'Casa/Util.',
  saude: 'Saúde',
  transporte: 'Transporte',
  lazer_outros: 'Lazer/Outros'
};

export default function DespesasTable({ mesAno }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`despesas?mes_vigente=${mesAno}`);
        setDespesas(data);
      } catch (err) {
        console.error('Erro ao carregar despesas:', err);
      } finally {
        setLoading(false);
      }
    };
    if (mesAno) load();
  }, [mesAno]);

  const handleEdit = (despesa) => {
    setEditing(despesa);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`https://controle-familiar.onrender.com/api/despesas/${showDeleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setDespesas(despesas.filter(d => d.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api(`despesas?mes_vigente=${mesAno}`);
    setDespesas(data);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) return <p>Carregando despesas...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ backgroundColor: '#1e61d8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Nova Despesa
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>DATA</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>DESCRIÇÃO</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>CAT.</th>
            <th style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>VALOR</th>
            <th style={{ padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {despesas.map((d) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{d.data_compra}</td>
              <td style={{ padding: '12px' }}>{d.descricao}</td>
              <td style={{ padding: '12px' }}>{CATEGORIA_LABELS[d.categoria] || d.categoria}</td>
              <td style={{ padding: '12px', textAlign: 'right', color: 'red' }}>R$ {d.valor?.toFixed(2)}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#007bff' }} title="Editar">✏️</button>
                <button onClick={() => handleDeleteClick(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} title="Excluir">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <DespesaForm despesa={editing} onClose={() => setShowForm(false)} onSuccess={handleSuccess} />}
      {showDeleteConfirm && <ConfirmDeleteModal onConfirm={handleDeleteConfirm} onCancel={() => setShowDeleteConfirm(null)} />}
    </div>
  );
}