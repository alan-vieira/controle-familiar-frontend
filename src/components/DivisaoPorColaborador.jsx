const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);

function ColaboradorCard({ colab }) {
  const { nome, renda, percentual, deve_pagar, pagou, saldo, status } = colab;
  const saldoPositivo = status === 'positivo' || (saldo ?? 0) >= 0;
  const pctPago = deve_pagar > 0 ? Math.min((pagou / deve_pagar) * 100, 100) : 100;

  const iniciais = (nome || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-blue-500 font-bold text-white">
          {iniciais}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{nome}</h3>
          <span className="text-xs text-gray-500">
            {(percentual ?? 0).toFixed(1)}% da renda familiar
          </span>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            saldoPositivo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {saldoPositivo ? 'Pagou a mais' : 'Ainda deve'}
        </span>
      </header>

      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Renda</dt>
          <dd className="font-semibold text-gray-900">{formatBRL(renda)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Deve pagar</dt>
          <dd className="font-semibold text-gray-900">{formatBRL(deve_pagar)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Pagou</dt>
          <dd className="font-semibold text-gray-900">{formatBRL(pagou)}</dd>
        </div>
      </dl>

      <div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={Number(pctPago.toFixed(0))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Percentual pago por ${nome}`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              pctPago === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${pctPago}%` }}
          />
        </div>
        <span className="mt-1 block text-xs text-gray-500">
          {pctPago.toFixed(0)}% do valor devido
        </span>
      </div>

      <footer
        className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 ${
          saldoPositivo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span className="text-sm font-medium">Saldo</span>
        <strong className="text-base font-bold">{formatBRL(saldo)}</strong>
      </footer>
    </article>
  );
}

export default function DivisaoPorColaborador({ colaboradores = [], divisao = null, onTogglePago }) {
  const paga = divisao?.paga ?? false;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold">Divisão por Colaborador</h3>
        {divisao && (
          <button
            onClick={onTogglePago}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              paga ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {paga ? 'Desmarcar como Pago' : 'Marcar como Pago'}
          </button>
        )}
      </div>

      {paga && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 font-medium">
            ✅ Divisão marcada como paga
            {divisao.data_acerto &&
              ` em ${new Date(divisao.data_acerto).toLocaleDateString('pt-BR')}`}
          </p>
        </div>
      )}

      {/* ✅ MENSAGENS CONTEXTUAIS RESTAURADAS */}
      {colaboradores.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="font-medium">⚠️ Nenhum colaborador com renda registrada</p>
          <p className="text-sm mt-1">
            Adicione rendas na guia <strong>Rend</strong> para calcular a divisão automaticamente.
          </p>
        </div>
      ) : colaboradores.length === 1 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-4">
          <p className="font-medium">
            ℹ️ Apenas <strong>{colaboradores[0].nome}</strong> possui renda registrada neste mês
          </p>
          <p className="text-sm mt-1">
            A divisão será calculada com base na renda de {colaboradores[0].nome}.
          </p>
        </div>
      ) : null}

      {colaboradores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {colaboradores.map((c) => (
            <ColaboradorCard key={c.id ?? c.nome} colab={c} />
          ))}
        </div>
      )}
    </div>
  );
}
