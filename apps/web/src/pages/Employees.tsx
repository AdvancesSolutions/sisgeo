import { useState } from 'react';

const mock = [
  { id: '1', name: 'Maria Silva', cpf: '111.222.333-44', role: 'Operadora', status: 'ACTIVE', unitId: 'u1' },
  { id: '2', name: 'João Santos', cpf: '555.666.777-88', role: 'Supervisor', status: 'ACTIVE', unitId: 'u1' },
];

export function Employees() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">Funcionários</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
        >
          {showForm ? 'Cancelar' : 'Novo'}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <h2 className="font-medium text-slate-700 mb-3">Novo funcionário</h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Nome" className="px-3 py-2 border rounded-lg" />
            <input placeholder="CPF" className="px-3 py-2 border rounded-lg" />
            <input placeholder="Função" className="px-3 py-2 border rounded-lg" />
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
              <th className="px-4 py-3 font-medium text-slate-700">Nome</th>
              <th className="px-4 py-3 font-medium text-slate-700">CPF</th>
              <th className="px-4 py-3 font-medium text-slate-700">Função</th>
              <th className="px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 font-medium text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.cpf}</td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3">
                  <span className={r.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-500'}>{r.status}</span>
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
