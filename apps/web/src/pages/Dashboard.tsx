import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Olá, {user?.name ?? 'Usuário'}. Resumo do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-theme-2xl border p-5 shadow-sm transition-all hover:shadow"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {label}
              </span>
              <Icon className="w-5 h-5 opacity-60" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>
              {value}
            </p>
            <span
              className="text-xs font-medium flex items-center gap-1 mt-3"
              style={{ color: 'var(--primary)' }}
            >
              Ver <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      {user?.role === 'ADMIN' && kpis.inReview > 0 && (
        <div
          className="rounded-theme-xl border p-4 flex items-center justify-between"
          style={{
            backgroundColor: 'hsl(48 96% 53% / 0.12)',
            borderColor: 'hsl(45 93% 47% / 0.4)',
          }}
        >
          <span className="font-medium" style={{ color: 'hsl(38 92% 25%)' }}>
            {kpis.inReview} tarefa(s) aguardando validação
          </span>
          <Link
            to="/validation"
            className="text-sm font-medium hover:underline flex items-center gap-1"
            style={{ color: 'hsl(38 92% 35%)' }}
          >
            Validar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
