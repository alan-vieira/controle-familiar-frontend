// src/utils/dateUtils.js

// Formata "2025-11-28" → "28/11/2025" (sem fuso horário)
export function formatDateToBR(dateString) {
  if (!dateString) return '';
  
  // Aceita "2025-11-28" ou "2025-11-28T..."
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!isoMatch) return '';

  const [, year, month, day] = isoMatch;
  // Constrói a data no formato brasileiro diretamente
  return `${day}/${month}/${year}`;
}

// Formata "2025-11" → "11/2025"
export function formatMonthYearToBR(monthYear) {
  if (!monthYear || typeof monthYear !== 'string') return '';
  const [year, month] = monthYear.split('-');
  if (!year || !month) return monthYear;
  return `${month}/${year}`;
}