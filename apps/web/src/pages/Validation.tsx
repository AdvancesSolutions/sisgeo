const mock = [
  { id: '1', taskId: '1', type: 'BEFORE', url: '#', status: 'IN_REVIEW' },
  { id: '2', taskId: '1', type: 'AFTER', url: '#', status: 'IN_REVIEW' },
];

export function Validation() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Validação (foto antes/depois)</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Tarefa</th>
              <th className="px-4 py-3 font-medium text-slate-700">Tipo</th>
              <th className="px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 font-medium text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.taskId}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-green-600 hover:underline mr-2">Aprovar</button>
                  <button type="button" className="text-red-600 hover:underline">Reprovar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
