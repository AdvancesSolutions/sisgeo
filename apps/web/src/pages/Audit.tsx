const mock = [
  { id: '1', userId: 'u1', action: 'CREATE', entity: 'Employee', entityId: 'e1', createdAt: '2025-01-27 10:00' },
  { id: '2', userId: 'u1', action: 'UPDATE', entity: 'Task', entityId: 't1', createdAt: '2025-01-27 09:30' },
];

export function Audit() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Auditoria de ações</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Data</th>
              <th className="px-4 py-3 font-medium text-slate-700">Usuário</th>
              <th className="px-4 py-3 font-medium text-slate-700">Ação</th>
              <th className="px-4 py-3 font-medium text-slate-700">Entidade</th>
              <th className="px-4 py-3 font-medium text-slate-700">ID</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.createdAt}</td>
                <td className="px-4 py-3">{r.userId}</td>
                <td className="px-4 py-3">{r.action}</td>
                <td className="px-4 py-3">{r.entity}</td>
                <td className="px-4 py-3">{r.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
