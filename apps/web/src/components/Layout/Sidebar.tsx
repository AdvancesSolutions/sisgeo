import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Layers,
  ClipboardList,
  CheckSquare,
  Package,
  Clock,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Funcionários', icon: Users },
  { to: '/locations', label: 'Locais', icon: MapPin },
  { to: '/areas', label: 'Áreas', icon: Layers },
  { to: '/tasks', label: 'Tarefas', icon: ClipboardList },
  { to: '/validation', label: 'Validação', icon: CheckSquare },
  { to: '/materials', label: 'Materiais', icon: Package },
  { to: '/timeclock', label: 'Ponto', icon: Clock },
  { to: '/reports', label: 'Relatórios', icon: FileText },
  { to: '/audit', label: 'Auditoria', icon: ShieldCheck },
];

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Minhas tarefas', icon: ClipboardList },
  { to: '/timeclock', label: 'Ponto', icon: Clock },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'ADMIN' ? adminLinks : employeeLinks;

  return (
    <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="font-bold text-lg text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          SIGEO
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Gestão Operacional</p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
