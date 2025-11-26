// src/components/ColaboradoresList.jsx
import React, { useEffect, useState } from 'react';

const ColaboradoresList = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/colaboradores');
        if (!response.ok) throw new Error('Falha ao carregar colaboradores');
        const data = await response.json();
        setColaboradores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar a lista de colaboradores.');
      } finally {
        setLoading(false);
      }
    };

    fetchColaboradores();
  }, []);

  // Skeleton para colaboradores
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

  if (colaboradores.length === 0) {
    return (
      <div className="text-gray-500 py-6 text-center">
        Nenhum colaborador cadastrado.
      </div>
    );
  }

  return (
    <div>
      {colaboradores.map((colab) => (
        <div
          key={colab.id || colab.nome}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
        >
          <div className="font-semibold text-gray-900">{colab.nome}</div>
          {colab.dia_fechamento && (
            <div className="text-sm text-gray-600 mt-1">
              Fechamento: dia {colab.dia_fechamento}
            </div>
          )}
          {/* Ações futuras (ex: editar/excluir) podem ir aqui */}
        </div>
      ))}
    </div>
  );
};

export default ColaboradoresList;