import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RendaForm({ renda, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    mes_ano: '',
    valor: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingColabs, setLoadingColabs] = useState(true);

  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        // ✅ NOVA API: usa api.get()
        const response = await api.get('colaboradores');
        setColaboradores(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
        alert('Erro ao carregar lista de colaboradores.');
      } finally {
        setLoadingColabs(false);
      }
    };
    loadColaboradores();
  }, []);

  useEffect(() => {
    if (renda) {
      setFormData({
        colaborador_id: renda.colaborador_id?.toString() || '',
        mes_ano: renda.mes_ano || '',
        valor: renda.valor?.toString() || ''
      });
    } else {
      setFormData({ colaborador_id: '', mes_ano: '', valor: '' });
    }
  }, [renda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Máscara para campo valor (moeda brasileira)
    if (name === 'valor') {
      // Remove tudo que não é dígito
      const digits = value.replace(/\D/g, '');
      // Formata como moeda brasileira: 123456 -> 1.234,56
      let formatted = '';
      if (digits.length > 0) {
        const num = parseInt(digits, 10);
        formatted = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ CORRETO: Converte "22,00" para 22.00
      const valorNumerico = parseFloat(formData.valor.replace(',', '.'));
      
      const payload = {
        colaborador_id: parseInt(formData.colaborador_id, 10),
        mes_ano: formData.mes_ano,
        valor: isNaN(valorNumerico) ? 0 : valorNumerico
      };

      if (renda) {
        await api.put(`rendas/${renda.id}`, { valor: payload.valor });
      } else {
        await api.post('rendas', payload);
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
        <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">Carregando colaboradores...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{renda ? 'Editar Renda' : 'Nova Renda'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select name="colaborador_id" value={formData.colaborador_id} onChange={handleChange} required disabled={!!renda} className="w-full border rounded px-3 py-2">
              <option value="">Selecione</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>{colab.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mês/Ano *</label>
            <input type="month" name="mes_ano" value={formData.mes_ano} onChange={handleChange} required disabled={!!renda} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
            <input type="tel" name="valor" value={formData.valor} onChange={handleChange} required min="0" className="w-full border rounded px-3 py-2" placeholder="0,00" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}