import { useState } from 'react';

const mock = [
  { id: '1', areaId: '1', employeeId: '1', scheduledDate: '2025-01-28', status: 'PENDING', title: 'Limpeza Área 1' },
  { id: '2', areaId: '2', employeeId: '2', scheduledDate: '2025-01-27', status: 'IN_PROGRESS', title: 'Manutenção' },
];

export function Tasks() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">Tarefas / Serviços</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
        >
          {showForm ? 'Cancelar' : 'Nova'}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <h2 className="font-medium text-slate-700 mb-3">Nova tarefa</h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select className="px-3 py-2 border rounded-lg"><option>Área</option></select>
            <select className="px-3 py-2 border rounded-lg"><option>Funcionário</option></select>
            <input type="date" className="px-3 py-2 border rounded-lg" />
            <input placeholder="Título" className="px-3 py-2 border rounded-lg" />
            <button type="submit" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
              Salvar
            </button>
          </form>
        </div>
      )}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Título</th>
              <th className="px-4 py-3 font-medium text-slate-700">Data</th>
              <th className="px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 font-medium text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3">{r.scheduledDate}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="text-slate-600 hover:underline mr-2">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
