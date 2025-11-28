// src/components/RendaForm.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function RendaForm({ renda, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    mes_ano: '',
    valor: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingColabs, setLoadingColabs] = useState(true);

  // Carregar lista de colaboradores
  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        const data = await api('colaboradores');
        setColaboradores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
        alert('Erro ao carregar lista de colaboradores.');
      } finally {
        setLoadingColabs(false);
      }
    };
    loadColaboradores();
  }, []);

  // Preencher formulário no modo edição
  useEffect(() => {
    if (renda) {
      setFormData({
        colaborador_id: renda.colaborador_id?.toString() || '',
        mes_ano: renda.mes_ano || '',
        valor: renda.valor?.toString() || ''
      });
    } else {
      setFormData({
        colaborador_id: '',
        mes_ano: '',
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
        colaborador_id: parseInt(formData.colaborador_id, 10),
        mes_ano: formData.mes_ano,
        valor: parseFloat(formData.valor)
      };

      if (renda) {
        // Atualização: só envia valor (conforme backend)
        await api(`rendas/${renda.id}`, {
          method: 'PUT',
          body: JSON.stringify({ valor: payload.valor })
        });
      } else {
        // Criação: envia todos os campos
        await api('rendas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      onSuccess();
    } catch (err) {
      alert('Erro ao salvar renda: ' + (err.message || 'tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingColabs) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
          Carregando colaboradores...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {renda ? 'Editar Renda' : 'Nova Renda'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Colaborador */}
          <div>
            <label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select
              name="colaborador_id"
              value={formData.colaborador_id}
              onChange={handleChange}
              required
              disabled={!!renda} // Não permite trocar colaborador ao editar
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecione</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Mês/Ano */}
          <div>
            <label className="block text-sm font-medium mb-1">Mês/Ano *</label>
            <input
              type="month"
              name="mes_ano"
              value={formData.mes_ano}
              onChange={handleChange}
              required
              disabled={!!renda} // Não permite trocar mês ao editar
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
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

          {/* Botões */}
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