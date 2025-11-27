// src/components/ColaboradorForm.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ColaboradorForm({ colaborador, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    dia_fechamento: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        dia_fechamento: colaborador.dia_fechamento
      });
    } else {
      setFormData({
        nome: '',
        dia_fechamento: 10
      });
    }
  }, [colaborador]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'dia_fechamento' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (colaborador) {
        await api(`colaboradores/${colaborador.id}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await api('colaboradores', { method: 'POST', body: JSON.stringify(formData) });
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar colaborador: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dia de Fechamento (1–31)</label>
            <input
              type="number"
              name="dia_fechamento"
              min="1"
              max="31"
              value={formData.dia_fechamento}
              onChange={handleChange}
              required
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}