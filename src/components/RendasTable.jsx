// src/components/RendasTable.jsx
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
      if (!mesAno) return;
      try {
        // 👈 Corrigido: usar 'mes_vigente' para consistência com o backend
        const data = await api(`rendas?mes_vigente=${mesAno}`);
        setRendas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar rendas:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
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
      await api(`rendas/${showDeleteConfirm}`, { method: 'DELETE' });
      setRendas(rendas.filter(r => r.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api(`rendas?mes_vigente=${mesAno}`);
    setRendas(Array.isArray(data) ? data : []);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando rendas...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Tabela única, sem botão "Registrar Renda" acima */}
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold">COLABORADOR</th>
              <th className="px-4 py-3 font-semibold">MÊS/ANO</th>
              <th className="px-4 py-3 font-semibold text-right">VALOR</th>
              <th className="px-4 py-3 font-semibold text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rendas.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{r.colaborador_nome}</td>
                <td className="px-4 py-3">{r.mes_ano}</td>
                <td className="px-4 py-3 text-right text-green-600">R$ {Number(r.valor || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800" title="Editar">✏️</button>
                  <button onClick={() => handleDeleteClick(r.id)} className="text-red-600 hover:text-red-800" title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RendaForm
          renda={editing}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}