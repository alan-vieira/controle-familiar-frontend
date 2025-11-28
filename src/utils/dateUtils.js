// src/utils/dateUtils.js
export function formatDateToBR(dateString) {
  if (!dateString) return '';
  
  // Aceita "2025-11-28" ou "2025-11-28T00:00:00"
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // janeiro = 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}