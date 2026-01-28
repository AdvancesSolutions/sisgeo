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
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{user?.name ?? '-'}</span>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          {user?.role ?? '-'}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700 hover:underline"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
