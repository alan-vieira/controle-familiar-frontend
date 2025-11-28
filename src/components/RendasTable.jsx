// src/components/RendasTable.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatMonthYearToBR } from '../utils/dateUtils';
import RendaForm from './RendaForm';
import ConfirmDeleteModal from './ConfirmDeleteModal'; // opcional, se quiser excluir

export default function RendasTable({ mesAno }) {
  const [rendas, setRendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // opcional

  useEffect(() => {
    const loadRendas = async () => {
      if (!mesAno || mesAno === '') {
        setRendas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api(`rendas?mes=${mesAno}`);
        setRendas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar rendas:', err);
        setRendas([]);
      } finally {
        setLoading(false);
      }
    };

    loadRendas();
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
      alert('Erro ao excluir renda: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    // Recarrega as rendas do mês atual
    if (mesAno) {
      try {
        const data = await api(`rendas?mes=${mesAno}`);
        setRendas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao recarregar rendas:', err);
      }
    }
    setShowForm(false);
    setEditing(null);
  };

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando rendas...</p>;
  }

  return (
    <div className="space-y-6">
      {/* ✅ BOTÃO ADICIONADO AQUI — IGUAL AO DE COLABORADORES */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + Nova Renda
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded border">
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
            {rendas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                  Nenhuma renda registrada.
                </td>
              </tr>
            ) : (
              rendas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.nome}</td>
                  <td className="px-4 py-3">{formatMonthYearToBR(r.mes_ano)}</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    R$ {Number(r.valor || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(r.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {rendas.length > 0 ? (
          rendas.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold">{r.nome}</p>
              <p className="text-gray-600">Mês: {formatMonthYearToBR(r.mes_ano)}</p>
              <p className="text-green-600 font-medium">R$ {Number(r.valor).toFixed(2)}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(r)}
                  className="text-blue-600 text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(r.id)}
                  className="text-red-600 text-sm"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhuma renda registrada.</p>
        )}
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <RendaForm
          renda={editing}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Modal de confirmação de exclusão (opcional, mas recomendado) */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}