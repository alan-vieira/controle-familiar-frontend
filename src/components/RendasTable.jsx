import { useState, useEffect } from 'react';
import { api } from '../services/api';
import RendaForm from './RendaForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function RendasTable({ mesAno }) {
  const [rendas, setRendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`rendas?mes=${mesAno}`);
        setRendas(data);
      } catch (err) {
        console.error('Erro ao carregar rendas:', err);
      } finally {
        setLoading(false);
      }
    };
    if (mesAno) load();
  }, [mesAno]);

  const handleEdit = (renda) => {
    setEditing(renda);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`https://controle-familiar.onrender.com/api/rendas/${showDeleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setRendas(rendas.filter(r => r.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api(`rendas?mes=${mesAno}`);
    setRendas(data);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) return <p>Carregando rendas...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Registrar Renda
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>COLABORADOR</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>MÊS/ANO</th>
            <th style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>VALOR</th>
            <th style={{ padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {rendas.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{r.colaborador_nome}</td>
              <td style={{ padding: '12px' }}>{r.mes_ano}</td>
              <td style={{ padding: '12px', textAlign: 'right', color: 'green' }}>R$ {r.valor?.toFixed(2)}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#007bff' }} title="Editar">✏️</button>
                <button onClick={() => handleDeleteClick(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} title="Excluir">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <RendaForm renda={editing} onClose={() => setShowForm(false)} onSuccess={handleSuccess} />}
      {showDeleteConfirm && <ConfirmDeleteModal onConfirm={handleDeleteConfirm} onCancel={() => setShowDeleteConfirm(null)} />}
    </div>
  );
}