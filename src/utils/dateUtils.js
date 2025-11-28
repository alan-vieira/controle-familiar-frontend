// src/utils/dateUtils.js

// Formata data completa: "2025-11-28" → "28/11/2025"
export function formatDateToBR(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Formata mês/ano: "2025-11" → "11/2025"
export function formatMonthYearToBR(monthYear) {
  if (!monthYear || typeof monthYear !== 'string') return '';
  const [year, month] = monthYear.split('-');
  if (!year || !month) return monthYear;
  return `${month}/${year}`;
}