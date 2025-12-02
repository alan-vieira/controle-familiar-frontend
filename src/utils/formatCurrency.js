// src/utils/formatCurrency.js
export const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};