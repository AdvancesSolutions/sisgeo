export function TimeClock() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Ponto (geolocalização)</h1>
      <p className="text-slate-600 mb-4">
        MVP: registrar check-in/out via API. Estrutura pronta para app futuro.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Check-in
        </button>
        <button
          type="button"
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Check-out
        </button>
      </div>
    </div>
  );
}
