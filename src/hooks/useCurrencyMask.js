// src/hooks/useCurrencyMask.js
import { useState, useCallback } from 'react';

const useCurrencyMask = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);

  const formatToBRL = useCallback((rawValue) => {
    if (!rawValue) return '';
    // Remove tudo que não é número
    const onlyNumbers = rawValue.toString().replace(/\D/g, '');
    // Divide por 100 para colocar as casas decimais
    const valueInCents = parseInt(onlyNumbers, 10) || 0;
    const formatted = (valueInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
    return formatted;
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Extrair apenas números da entrada
    const onlyNumbers = raw.replace(/\D/g, '');
    setValue(onlyNumbers);
  };

  const getFormattedValue = () => formatToBRL(value);
  const getNumericValue = () => (parseInt(value, 10) || 0) / 100;

  return {
    value, // valor bruto (ex: "12500" = R$ 125,00)
    displayValue: formatToBRL(value),
    handleChange,
    getNumericValue,
    getFormattedValue,
  };
};

export default useCurrencyMask;