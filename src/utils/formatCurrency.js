// src/utils/formatCurrency.js
export const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};