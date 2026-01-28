import { useState } from 'react';

const mock = [
  { id: '1', locationId: '1', name: 'Área 1 - Centro' },
  { id: '2', locationId: '1', name: 'Área 2 - Centro' },
  { id: '3', locationId: '2', name: 'Área 1 - Norte' },
];

export function Areas() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">Áreas</h1>
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
          <h2 className="font-medium text-slate-700 mb-3">Nova área</h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select className="px-3 py-2 border rounded-lg">
              <option>Selecione o local</option>
            </select>
            <input placeholder="Nome da área" className="px-3 py-2 border rounded-lg" />
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
              <th className="px-4 py-3 font-medium text-slate-700">Local</th>
              <th className="px-4 py-3 font-medium text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.locationId}</td>
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
