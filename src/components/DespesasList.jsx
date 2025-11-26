// src/components/DespesasList.jsx
import React, { useEffect, useState } from 'react';
import MobileExpenseCard from './MobileExpenseCard';

const DespesasList = ({ mesAno }) => {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        setLoading(true);
        // Substitua pela sua URL real
        const response = await fetch(`/api/despesas?mes=${mesAno}`);
        if (!response.ok) throw new Error('Falha ao carregar despesas');
        const data = await response.json();
        setDespesas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as despesas.');
      } finally {
        setLoading(false);
      }
    };

    if (mesAno) {
      fetchDespesas();
    }
  }, [mesAno]);

  // Skeleton para estado de carregamento
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  if (loading) {
    return (
      <div>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  if (despesas.length === 0) {
    return (
      <div className="text-gray-500 py-6 text-center">
        Nenhuma despesa registrada neste mês.
      </div>
    );
  }

  return (
    <div>
      {despesas.map((despesa) => (
        <MobileExpenseCard key={despesa.id} item={despesa} type="despesa" />
      ))}
    </div>
  );
};

export default DespesasList;