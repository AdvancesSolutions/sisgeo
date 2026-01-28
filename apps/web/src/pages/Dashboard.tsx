export function Dashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Funcionários', value: '—', icon: '👤' },
          { label: 'Locais', value: '—', icon: '📍' },
          { label: 'Tarefas ativas', value: '—', icon: '📋' },
          { label: 'Materiais', value: '—', icon: '📦' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">{label}</span>
              <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
