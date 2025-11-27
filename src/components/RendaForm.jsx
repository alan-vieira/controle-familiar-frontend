// src/components/RendaForm.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function RendaForm({ renda, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    data_recebimento: '',
    descricao: '',
    valor: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (renda) {
      setFormData({
        data_recebimento: renda.data_recebimento,
        descricao: renda.descricao,
        valor: renda.valor
      });
    } else {
      setFormData({
        data_recebimento: '',
        descricao: '',
        valor: ''
      });
    }
  }, [renda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        valor: parseFloat(formData.valor)
      };
      if (renda) {
        await api(`rendas/${renda.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('rendas', { method: 'POST', body: JSON.stringify(payload) });
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar renda: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {renda ? 'Editar Renda' : 'Nova Renda'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data do Recebimento</label>
            <input
              type="date"
              name="data_recebimento"
              value={formData.data_recebimento}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              required
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}