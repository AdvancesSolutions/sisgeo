import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bug, LogOut, RefreshCw, User } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { authStore } from '@/auth/authStore';
import type { User as UserType } from '@/contexts/AuthContext';

/** Decodifica payload do JWT sem validar (apenas para exibir exp/iat). */
function decodeJwtPayload(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const raw = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(raw) as { exp?: number; iat?: number };
  } catch {
    return null;
  }
}

export function AuthDebug() {
  const { user, logout, isAuthenticated, isVerifying } = useAuth();
  const [meResult, setMeResult] = useState<{ ok: boolean; data?: UserType; error?: string } | null>(null);
  const [simulating, setSimulating] = useState(false);

  const accessToken = authStore.getAccessToken();
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const expDate = payload?.exp ? new Date(payload.exp * 1000) : null;
  const isExpired = expDate ? expDate.getTime() < Date.now() : null;

  useEffect(() => {
    if (!authStore.isAuthenticated() || isVerifying) {
      setMeResult(null);
      return;
    }
    setMeResult(null);
    api
      .get<UserType>('/auth/me')
      .then(({ data }) => setMeResult({ ok: true, data }))
      .catch((err: unknown) =>
        setMeResult({
          ok: false,
          error: (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Erro ao chamar /auth/me',
        }),
      );
  }, [isVerifying, accessToken]);

  async function handleSimulateExpiry() {
    const refresh = authStore.getRefreshToken();
    if (!refresh) {
      setMeResult({ ok: false, error: 'Sem refreshToken para testar.' });
      return;
    }
    setSimulating(true);
    setMeResult(null);
    try {
      const { data } = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', { refreshToken: refresh });
      authStore.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? refresh,
      });
      const { data: meData } = await api.get<UserType>('/auth/me');
      setMeResult({ ok: true, data: meData });
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setMeResult({ ok: false, error: res?.data?.message ?? 'Refresh falhou.' });
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Bug className="w-6 h-6 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-800">Auth Debug (temporário)</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
        <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
        <p><strong>isVerifying:</strong> {String(isVerifying)}</p>
        <p><strong>Token existe:</strong> {accessToken ? 'Sim' : 'Não'}</p>
        {payload && (
          <>
            <p><strong>exp (token):</strong> {expDate?.toISOString() ?? '—'} {isExpired !== null && (isExpired ? '(expirado)' : '(válido)')}</p>
            <p><strong>iat:</strong> {payload.iat ? new Date(payload.iat * 1000).toISOString() : '—'}</p>
          </>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-slate-600" />
          <strong>GET /auth/me</strong>
        </div>
        {meResult === null && authStore.isAuthenticated() && <p className="text-slate-500">Carregando...</p>}
        {meResult?.ok && <pre className="text-sm bg-slate-50 p-2 rounded overflow-auto">{JSON.stringify(meResult.data, null, 2)}</pre>}
        {meResult && !meResult.ok && <p className="text-red-600">{meResult.error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSimulateExpiry}
          disabled={simulating || !authStore.getRefreshToken()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Testar refresh (renova tokens)
        </button>
        <button
          type="button"
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
          Voltar ao painel
        </Link>
      </div>

      <p className="text-slate-500 text-sm">Usuário em memória: {user ? `${user.name} (${user.role})` : '—'}</p>
    </div>
  );
}
