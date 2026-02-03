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
    <aside
      id="sidebar"
      className="w-60 shrink-0 flex flex-col min-h-screen border-r border-[var(--sidebar-border)] transition-colors"
      style={{
        backgroundColor: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-[var(--sidebar-border)]">
        <h1 className="font-semibold text-lg tracking-tight flex items-center gap-2" style={{ color: 'var(--sidebar-primary)' }}>
          <LayoutDashboard className="w-6 h-6 shrink-0" />
          SIGEO
        </h1>
        <p className="text-xs mt-1 opacity-70">Gestão Operacional</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                      : 'text-[var(--sidebar-foreground)]/90 hover:bg-[var(--sidebar-accent)]/80 hover:text-[var(--sidebar-foreground)]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="capitalize">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
