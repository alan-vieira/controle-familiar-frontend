// src/components/MobileExpenseCard.jsx
import React from 'react';

const MobileExpenseCard = ({ item, type = 'despesa' }) => {
  const isExpense = type === 'despesa';
  const valueColor = isExpense ? 'text-red-600' : 'text-green-600';
  const valuePrefix = isExpense ? '- R$ ' : '+ R$ ';

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500 font-medium">{item.data}</div>
          <div className="font-semibold mt-1 text-gray-900">{item.descricao || '—'}</div>
          {item.categoria && (
            <div className="text-sm text-blue-600 mt-1">{item.categoria}</div>
          )}
          {item.colaborador && (
            <div className="text-sm text-gray-600 mt-1">por {item.colaborador}</div>
          )}
        </div>
        <div className={`text-lg font-bold ${valueColor} whitespace-nowrap`}>
          {valuePrefix}
          {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default MobileExpenseCard;