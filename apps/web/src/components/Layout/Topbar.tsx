import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card shadow-sm"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="font-semibold text-foreground" style={{ color: 'var(--foreground)' }}>
        SIGEO
      </div>
      <div className="flex items-center gap-4">
        <span
          className="flex items-center gap-2 text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <User className="w-4 h-4" />
          {user?.name ?? '-'}
        </span>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary text-primary-foreground"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          {user?.role === 'ADMIN' ? 'Admin' : 'Usuário'}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
