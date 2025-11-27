// src/components/ColaboradoresTable.jsx
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
        setColaboradores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (colab) => {
    setEditing(colab);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api(`colaboradores/${showDeleteConfirm}`, { method: 'DELETE' });
      setColaboradores(colaboradores.filter(c => c.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api('colaboradores');
    setColaboradores(Array.isArray(data) ? data : []);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando colaboradores...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + Novo Colaborador
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold">NOME</th>
              <th className="px-4 py-3 font-semibold">DIA FECHAMENTO</th>
              <th className="px-4 py-3 font-semibold text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {colaboradores.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{c.nome}</td>
                <td className="px-4 py-3">{c.dia_fechamento}</td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800">✏️</button>
                  <button onClick={() => handleDeleteClick(c.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {colaboradores.length > 0 ? (
          colaboradores.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-lg">{c.nome}</p>
              <p className="text-gray-600">Fechamento: dia {c.dia_fechamento}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button onClick={() => handleEdit(c)} className="text-blue-600 text-sm">✏️ Editar</button>
                <button onClick={() => handleDeleteClick(c.id)} className="text-red-600 text-sm">🗑️ Excluir</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhum colaborador cadastrado.</p>
        )}
      </div>

      {showForm && (
        <ColaboradorForm
          colaborador={editing}
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