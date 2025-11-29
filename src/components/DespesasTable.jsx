// src/components/DespesasTable.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatDateToBR } from '../utils/dateUtils';
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

const TIPO_PG_LABELS = {
  pix: 'PIX',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro'
};

export default function DespesasTable({ mesAno }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!mesAno) return;
      try {
        const data = await api(`despesas?mes_vigente=${mesAno}`);
        setDespesas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar despesas:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
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
      await api(`despesas/${showDeleteConfirm}`, { method: 'DELETE' });
      setDespesas(despesas.filter(d => d.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSuccess = async () => {
    const data = await api(`despesas?mes_vigente=${mesAno}`);
    setDespesas(Array.isArray(data) ? data : []);
    setShowForm(false);
    setEditing(null);
  };

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando despesas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + Nova Despesa
        </button>
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block overflow-x-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold">DATA</th>
              <th className="px-4 py-3 font-semibold">DESCRIÇÃO</th>
              <th className="px-4 py-3 font-semibold">CAT.</th>
              <th className="px-4 py-3 font-semibold">TIPO PG</th> {/* ← Nova coluna */}
              <th className="px-4 py-3 font-semibold text-right">VALOR</th>
              <th className="px-4 py-3 font-semibold text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {despesas.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{formatDateToBR(d.data_compra)}</td>
                <td className="px-4 py-3">{d.descricao}</td>
                <td className="px-4 py-3">{CATEGORIA_LABELS[d.categoria] || d.categoria}</td>
                <td className="px-4 py-3">{TIPO_PG_LABELS[d.tipo_pg] || '—'}</td> {/* ← Novo dado */}
                <td className="px-4 py-3 text-right text-red-600">R$ {Number(d.valor || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800" title="Editar">✏️</button>
                  <button onClick={() => handleDeleteClick(d.id)} className="text-red-600 hover:text-red-800" title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-4">
        {despesas.length > 0 ? (
          despesas.map((d) => (
            <div key={d.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-base">{d.descricao}</p>
                  <p className="text-sm text-gray-500">{formatDateToBR(d.data_compra)}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Categoria:</span> {CATEGORIA_LABELS[d.categoria] || d.categoria}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Tipo PG:</span> {TIPO_PG_LABELS[d.tipo_pg] || '—'}
                  </p>
                </div>
                <p className="text-red-600 font-bold">R$ {Number(d.valor || 0).toFixed(2)}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button onClick={() => handleEdit(d)} className="text-blue-600 text-sm">✏️ Editar</button>
                <button onClick={() => handleDeleteClick(d.id)} className="text-red-600 text-sm">🗑️ Excluir</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhuma despesa registrada.</p>
        )}
      </div>

      {showForm && (
        <DespesaForm
          despesa={editing}
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