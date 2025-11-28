// src/components/DespesaForm.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const CATEGORIAS = [
  'moradia',
  'alimentacao',
  'restaurante_lanche',
  'casa_utilidades',
  'saude',
  'transporte',
  'lazer_outros'
];

const CATEGORIA_LABELS = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  restaurante_lanche: 'Rest./Lanche',
  casa_utilidades: 'Casa/Util.',
  saude: 'Saúde',
  transporte: 'Transporte',
  lazer_outros: 'Lazer/Outros'
};

// 🔹 Novo: Tipos de pagamento (ajuste conforme seu backend)
const TIPOS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' }
];

export default function DespesaForm({ despesa, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    data_compra: '',
    descricao: '',
    categoria: 'alimentacao',
    tipo_pg: 'dinheiro', // 🔹 valor padrão
    colaborador_id: '',
    valor: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingColabs, setLoadingColabs] = useState(true);

  // 🔹 Carregar lista de colaboradores
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
    if (despesa) {
      setFormData({
        data_compra: despesa.data_compra || '',
        descricao: despesa.descricao || '',
        categoria: despesa.categoria || 'alimentacao',
        tipo_pg: despesa.tipo_pg || 'dinheiro',
        colaborador_id: despesa.colaborador_id?.toString() || '',
        valor: despesa.valor?.toString() || ''
      });
    } else {
      setFormData({
        data_compra: '',
        descricao: '',
        categoria: 'alimentacao',
        tipo_pg: 'dinheiro',
        colaborador_id: '',
        valor: ''
      });
    }
  }, [despesa]);

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
        colaborador_id: parseInt(formData.colaborador_id, 10),
        valor: parseFloat(formData.valor)
      };

      if (despesa) {
        await api(`despesas/${despesa.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await api('despesas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      onSuccess();
    } catch (err) {
      alert('Erro ao salvar despesa: ' + (err.message || 'tente novamente'));
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
          {despesa ? 'Editar Despesa' : 'Nova Despesa'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data da Compra */}
          <div>
            <label className="block text-sm font-medium mb-1">Data da Compra *</label>
            <input
              type="date"
              name="data_compra"
              value={formData.data_compra}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoria *</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{CATEGORIA_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* 🔹 Tipo de Pagamento */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Pagamento *</label>
            <select
              name="tipo_pg"
              value={formData.tipo_pg}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              {TIPOS_PAGAMENTO.map(tp => (
                <option key={tp.value} value={tp.value}>{tp.label}</option>
              ))}
            </select>
          </div>

          {/* 🔹 Colaborador */}
          <div>
            <label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select
              name="colaborador_id"
              value={formData.colaborador_id}
              onChange={handleChange}
              required
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}