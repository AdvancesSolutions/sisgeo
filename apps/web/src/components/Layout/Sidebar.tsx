import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/employees', label: 'Funcionários', icon: '👤' },
  { to: '/locations', label: 'Locais', icon: '📍' },
  { to: '/areas', label: 'Áreas', icon: '🗂️' },
  { to: '/tasks', label: 'Tarefas', icon: '📋' },
  { to: '/validation', label: 'Validação', icon: '✅' },
  { to: '/materials', label: 'Materiais', icon: '📦' },
  { to: '/timeclock', label: 'Ponto', icon: '🕐' },
  { to: '/audit', label: 'Auditoria', icon: '📜' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <h1 className="font-bold text-lg text-white">SIGEO</h1>
        <p className="text-xs text-slate-400">Gestão Operacional</p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
