import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// ===== TECLADO NUMÉRICO CUSTOMIZADO (ESTILO APP BANCÁRIO) =====
function NumericKeypad({ value, onChange, onBlur, onSubmit, disabled }) {
  const [displayValue, setDisplayValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value || '');
    }
  }, [value]);

  const handleKey = (key) => {
    if (disabled) return;
    
    let newValue = displayValue;
    
    if (key === 'backspace') {
      newValue = displayValue.slice(0, -1);
    } else if (key === 'clear') {
      newValue = '';
    } else if (key === ',' || key === '.') {
      if (!displayValue.includes(',') && !displayValue.includes('.')) {
        newValue = displayValue + ',';
      }
    } else if (key === 'enter') {
      onBlur?.();
      onSubmit?.();
      return;
    } else if (/^\d$/.test(key)) {
      const parts = displayValue.split(',');
      if (parts.length === 2 && parts[1].length >= 2) {
        return;
      }
      newValue = displayValue + key;
    }
    
    setDisplayValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="numeric-keypad" 
      onClick={(e) => e.stopPropagation()}
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '16px 16px 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
      }}
    >
      <div style={{
        textAlign: 'right',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '2rem',
        fontFamily: 'monospace',
        fontWeight: '600',
        color: '#1f2937',
        minHeight: '48px',
        wordBreak: 'break-all'
      }}>
        {displayValue || '0,00'}
        <input
          ref={inputRef}
          type="hidden"
          value={displayValue}
          onChange={(e) => setDisplayValue(e.target.value)}
          onBlur={onBlur}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleKey(num)}
            disabled={disabled}
            style={{
              padding: '16px',
              fontSize: '1.5rem',
              fontWeight: '600',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#1f2937',
              activeBackgroundColor: '#f3f4f6'
            }}
          >
            {num}
          </button>
        ))}
        
        <button
          key="clear"
          onClick={() => handleKey('clear')}
          disabled={disabled}
          style={{
            padding: '16px',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}
        >
          Limpar
        </button>
        
        <button
          key="0"
          onClick={() => handleKey('0')}
          disabled={disabled}
          style={{
            padding: '16px',
            fontSize: '1.5rem',
            fontWeight: '600',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            color: '#1f2937'
          }}
        >
          0
        </button>
        
        <button
          key=","
          onClick={() => handleKey(',')}
          disabled={disabled}
          style={{
            padding: '16px',
            fontSize: '1.5rem',
            fontWeight: '600',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            color: '#1f2937'
          }}
        >
          ,
        </button>

        <div style={{ 
          gridColumn: 'span 3', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px',
          marginTop: '8px'
        }}>
          <button
            key="backspace"
            onClick={() => handleKey('backspace')}
            disabled={disabled}
            style={{
              padding: '16px',
              fontSize: '1.25rem',
              fontWeight: '600',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="10" y2="15"></line>
              <line x1="10" y1="9" x2="18" y2="15"></line>
            </svg>
            <span>Apagar</span>
          </button>
          
          <button
            key="enter"
            onClick={() => { onBlur?.(); onSubmit?.(); }}
            disabled={disabled || !displayValue}
            style={{
              padding: '16px',
              fontSize: '1rem',
              fontWeight: '700',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RendaForm({ renda, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    mes_ano: '',
    valor: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingColabs, setLoadingColabs] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadValue, setKeypadValue] = useState('');
  const [keypadField, setKeypadField] = useState(null);

  useEffect(() => {
    const loadColaboradores = async () => {
      try {
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
        valor: renda.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || ''
      });
    } else {
      setFormData({ colaborador_id: '', mes_ano: '', valor: '' });
    }
  }, [renda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openKeypad = (fieldName, currentValue) => {
    setKeypadField(fieldName);
    setKeypadValue(formData[fieldName] || '');
    setShowKeypad(true);
  };

  const handleKeypadChange = (value) => {
    if (keypadField) {
      setFormData(prev => ({ ...prev, [keypadField]: value }));
    }
  };

  const handleKeypadBlur = () => {
    if (keypadField) {
      const value = formData[keypadField];
      if (value) {
        const normalized = value.replace('.', '').replace(',', '.');
        const num = parseFloat(normalized);
        if (!isNaN(num)) {
          setFormData(prev => ({ ...prev, [keypadField]: num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
        }
      }
    }
    setShowKeypad(false);
    setKeypadField(null);
  };

  const handleKeypadSubmit = () => {
    if (keypadField) {
      // Atualiza o formData com o valor do keypad antes de fechar
      setFormData(prev => ({ ...prev, [keypadField]: keypadValue }));
      onBlur?.();
    }
    setShowKeypad(false);
    setKeypadField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const valorNumerico = parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'));

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
    <>
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
              <button
                type="button"
                onClick={() => openKeypad('valor', formData.valor)}
                className="w-full border rounded px-3 py-2 text-right text-lg font-mono bg-gray-50"
                style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.25rem' }}
              >
                {formData.valor || '0,00'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Toque para digitar o valor</p>
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

      {showKeypad && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowKeypad(false)}>
          <div className="bg-gray-900/50 fixed inset-0" onClick={() => setShowKeypad(false)} />
          <NumericKeypad
            value={keypadValue}
            onChange={handleKeypadChange}
            onBlur={handleKeypadBlur}
            onSubmit={handleKeypadSubmit}
          />
        </div>
      )}
    </>
  );
}