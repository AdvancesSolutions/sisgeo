import { BarChart3, FileText, Clock, CheckSquare } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Relatórios</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produtividade', icon: BarChart3, desc: 'Tarefas por período' },
          { label: 'Ponto', icon: Clock, desc: 'Horas por funcionário' },
          { label: 'Validações', icon: CheckSquare, desc: 'Aprovados vs recusados' },
          { label: 'Exportar PDF', icon: FileText, desc: 'Relatórios em PDF' },
        ].map(({ label, icon: Icon, desc }) => (
          <div
            key={label}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p>Relatórios detalhados em desenvolvimento.</p>
        <p className="text-sm mt-1">KPIs e exportação PDF em próxima versão.</p>
      </div>
    </div>
  );
}
