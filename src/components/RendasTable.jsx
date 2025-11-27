// src/components/RendasTable.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import RendaForm from './RendaForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function RendasTable({ mesAno }) {
  const [rendas, setRendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRendas = async () => {
      // 🔴 Garanta que mesAno está definido ANTES de chamar a API
      if (!mesAno || mesAno === '') {
        setRendas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // ✅ Use exatamente o mesmo parâmetro que o backend espera
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
  }, [mesAno]); // ⚠️ Dependência correta

  if (loading) {
    return <p className="text-center py-4 text-gray-600">Carregando rendas...</p>;
  }

  return (
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
                <td className="px-4 py-3">{r.mes_ano}</td>
                <td className="px-4 py-3 text-right text-green-600">
                  R$ {Number(r.valor || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">✏️</button>
                  <button className="text-red-600 hover:text-red-800">🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}