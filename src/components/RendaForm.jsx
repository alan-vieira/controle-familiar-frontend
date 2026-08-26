import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// ===== TECLADO NUMÉRICO CUSTOMIZADO (ESTILO APP BANCÁRIO) =====
function NumericKeypad({ value, onChange, onBlur, onSubmit, disabled }) {
  const [displayValue, setDisplayValue] = useState(value || '');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const inputRef = useRef(null);
  const prevValueRef = useRef(value);

  // Formata valor para exibição pt-BR (ex: "1600" → "16,00", "16.00" → "16,00")
  // Se já está formatado BR ("16,00" ou "1.234,56"), retorna como está
  const formatarParaExibicao = (valor) => {
    if (!valor && valor !== 0) return '';
    const str = String(valor);
    // Se termina com vírgula + 2 dígitos (ex: "16,00", "1.234,56"), já é formato BR
    if (/,\d{2}$/.test(str)) {
      return str;
    }
    const numero = parseFloat(str.replace(',', '.'));
    if (isNaN(numero)) return '';
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Sincroniza displayValue com value prop APENAS se o valor prop mudou externamente
  // (não sobrescreve se o usuário está digitando)
  useEffect(() => {
    // SÓ sincroniza se NÃO estiver digitando
    if (isUserTyping) return;
    
    const formatted = formatarParaExibicao(value);
    if (value !== prevValueRef.current) {
      const prevFormatted = formatarParaExibicao(prevValueRef.current);
      if (displayValue === prevFormatted || displayValue === '') {
        setDisplayValue(formatted);
      }
      prevValueRef.current = value;
    }
  }, [value, displayValue, isUserTyping]);

  const handleKey = (key) => {
    if (disabled) return;
    
    setIsUserTyping(true); // Marca que está digitando
    
    let newValue = displayValue;
    
    if (key === 'backspace') {
      newValue = displayValue.slice(0, -1);
    } else if (key === 'clear') {
      // Qwen fix: Limpar zera para '0,00' em vez de vazio
      newValue = '0,00';
    } else if (key === ',' || key === '.') {
      if (!displayValue.includes(',') && !displayValue.includes('.')) {
        newValue = displayValue + ',';
      }
    } else if (key === 'enter') {
      // Passa o valor formatado para evitar race condition
      onBlur?.(displayValue);
      onSubmit?.(displayValue);
      setIsUserTyping(false);
      return;
    } else if (/^\d$/.test(key)) {
      const parts = displayValue.split(',');
      if (parts.length === 2 && parts[1].length >= 2) {
        return;
      }
      // Se displayValue é '0,00', substitui pelo dígito
      if (displayValue === '0,00') {
        newValue = key;
      } else {
        newValue = displayValue + key;
      }
    }
    
    setDisplayValue(newValue);
    onChange?.(newValue);
    
    // Reseta flag após um delay
    setTimeout(() => setIsUserTyping(false), 300);
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
            onClick={() => { onBlur?.(displayValue); onSubmit?.(displayValue); }}
            disabled={disabled || !displayValue || displayValue === '0,00'}
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

  // Helper: converte string do backend (ex: "1234.56") para formato BR (ex: "1.234,56")
  const formatValorBR = (valor) => {
    if (!valor && valor !== 0) return '';
    const num = parseFloat(valor);
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper: converte formato BR (ex: "1.234,56") para número
  const parseValorBR = (valorBR) => {
    if (!valorBR) return 0;
    return parseFloat(valorBR.replace(/\./g, '').replace(',', '.'));
  };

  // Qwen fix: reset keypadValue quando renda muda (abre edição)
  useEffect(() => {
    if (renda) {
      setFormData({
        colaborador_id: renda.colaborador_id?.toString() || '',
        mes_ano: renda.mes_ano || '',
        // API retorna valor como string "1234.56" → converte para "1.234,56"
        valor: formatValorBR(renda.valor)
      });
      // Reseta keypadValue para valor formatado (ex: "16,00")
      setKeypadValue(formatValorBR(renda.valor));
    } else {
      setFormData({ colaborador_id: '', mes_ano: '', valor: '' });
      setKeypadValue('');
    }
  }, [renda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openKeypad = (fieldName, currentValue) => {
    setKeypadField(fieldName);
    // Passa valor formatado BR direto para o keypad
    const rawValue = formData[fieldName] || '';
    setKeypadValue(rawValue);
    setShowKeypad(true);
  };

  const handleKeypadChange = (value) => {
    if (keypadField) {
      // value vem do keypad no formato BR (ex: "26,00" ou "0,00")
      // Atualiza AMBOS: formData (para o formulário) E keypadValue (para o keypad não sobrescrever)
      setFormData(prev => ({ ...prev, [keypadField]: value }));
      setKeypadValue(value); // Mantém sincronizado para evitar overwrite do useEffect
    }
  };

  // Aceita o valor passado pelo keypad (formato BR "26,00") ou usa keypadValue state como fallback
  const handleKeypadBlur = (passedValue) => {
    if (keypadField) {
      // O keypad passa o valor formatado (ex: "26,00") via onBlur(displayValue)
      // Se não veio valor, usa o keypadValue state (formato BR "16,00")
      const valueToUse = passedValue || keypadValue;
      
      if (valueToUse && valueToUse !== '0,00') {
        // Converte "26,00" → 26.00 → formata "26,00"
        const num = parseFloat(valueToUse.replace(',', '.'));
        if (!isNaN(num)) {
          setFormData(prev => ({ ...prev, [keypadField]: num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
        }
      } else if (valueToUse === '0,00') {
        // Usuário limpou o campo - deixa vazio
        setFormData(prev => ({ ...prev, [keypadField]: '' }));
      }
    }
    setShowKeypad(false);
    setKeypadField(null);
  };

  const handleKeypadSubmit = (passedValue) => {
    if (keypadField) {
      handleKeypadBlur(passedValue); // Reutiliza a mesma lógica de blur
    }
    setShowKeypad(false);
    setKeypadField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // formData.valor está no formato BR "1.234,56" → converte para número
      const valorNumerico = parseValorBR(formData.valor);

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