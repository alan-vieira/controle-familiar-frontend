import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ColaboradorForm from './ColaboradorForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function ColaboradoresTable() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api('colaboradores');
        setColaboradores(data);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (colaborador) => {
    setEditing(colaborador);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`https://controle-familiar.onrender.com/api/colaboradores/${showDeleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setColaboradores(colaboradores.filter(c => c.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api('colaboradores');
    setColaboradores(data);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) return <p>Carregando colaboradores...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ backgroundColor: '#1e61d8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Novo Colaborador
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>NOME</th>
            <th style={{ padding: '12px', fontWeight: 'bold' }}>DIA FECHAMENTO</th>
            <th style={{ padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {colaboradores.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{c.nome}</td>
              <td style={{ padding: '12px' }}>{c.dia_fechamento}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: '#007bff' }} title="Editar">✏️</button>
                <button onClick={() => handleDeleteClick(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} title="Excluir">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <ColaboradorForm colaborador={editing} onClose={() => setShowForm(false)} onSuccess={handleSuccess} />}
      {showDeleteConfirm && <ConfirmDeleteModal onConfirm={handleDeleteConfirm} onCancel={() => setShowDeleteConfirm(null)} />}
    </div>
  );
}