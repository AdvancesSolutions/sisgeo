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
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
      <div className="text-slate-600 font-medium">SIGEO</div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <User className="w-4 h-4 text-slate-400" />
          {user?.name ?? '-'}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            user?.role === 'ADMIN' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {user?.role ?? '-'}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
