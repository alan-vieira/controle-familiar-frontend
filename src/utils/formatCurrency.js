// src/utils/formatCurrency.js
export const formatCurrency = (value) => {
  // Tenta converter valor para número
  let numValue = value;

  if (typeof value === 'string') {
    // Remove possíveis "R$", espaços, e trata vírgula → ponto
    const cleaned = value
      .replace(/\./g, '')     // remove separadores de milhar (.)
      .replace(',', '.')      // vírgula → ponto decimal
      .replace(/[^0-9.-]/g, ''); // deixa só números, ponto e sinal

    numValue = parseFloat(cleaned);
  }

  if (typeof numValue !== 'number' || isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};