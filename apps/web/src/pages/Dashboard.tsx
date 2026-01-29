import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({ tasks: 0, inReview: 0, employees: 0 });

  useEffect(() => {
    Promise.all([
      api.get<{ total: number }>('/tasks', { params: { limit: 1 } }).then((r) => r.data?.total ?? 0),
      api.get<unknown[]>('/tasks/validation/queue').then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
      api.get<{ total: number }>('/employees', { params: { limit: 1 } }).then((r) => r.data?.total ?? 0),
    ])
      .then(([tasks, inReview, employees]) => {
        setKpis({
          tasks: Number(tasks) || 0,
          inReview: Number(inReview) || 0,
          employees: Number(employees) || 0,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Tarefas', value: kpis.tasks, icon: ClipboardList, to: '/tasks' },
    { label: 'Em validação', value: kpis.inReview, icon: CheckSquare, to: '/validation' },
    { label: 'Funcionários', value: kpis.employees, icon: Users, to: '/employees' },
    { label: 'Materiais', value: '—', icon: Package, to: '/materials' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-slate-700" />
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      </div>
      <p className="text-slate-600 text-sm">Olá, {user?.name ?? 'Usuário'}. Resumo do sistema.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors block"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">{label}</span>
              <Icon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            <span className="text-xs text-sky-600 flex items-center gap-0.5 mt-2">
              Ver <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
      {user?.role === 'ADMIN' && kpis.inReview > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-amber-800 font-medium">
            {kpis.inReview} tarefa(s) aguardando validação
          </span>
          <Link
            to="/validation"
            className="text-amber-700 text-sm font-medium hover:underline flex items-center gap-1"
          >
            Validar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
