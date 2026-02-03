import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  MapPin,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { useAuth } from '@/contexts/AuthContext';

interface TaskPhoto {
  id: string;
  taskId: string;
  type: string;
  url: string;
  key: string;
  createdAt: string;
}

interface Task {
  id: string;
  areaId: string;
  employeeId: string | null;
  scheduledDate: string;
  status: string;
  title: string | null;
  description: string | null;
  rejectedComment: string | null;
  rejectedAt: string | null;
  photos?: TaskPhoto[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em execução',
  IN_REVIEW: 'Em validação',
  DONE: 'Concluída',
  REJECTED: 'Rejeitada',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get<Task>(`/tasks/${id}`)
      .then(({ data }) => setTask(data))
      .catch(() => setError('Tarefa não encontrada'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/tasks/${id}/approve`);
      setShowApproveModal(false);
      setTask((t) => (t ? { ...t, status: 'DONE' } : null));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Falha ao aprovar'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectComment.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/tasks/${id}/reject`, {
        comment: rejectComment.trim(),
        reason: rejectReason || undefined,
      });
      setShowRejectModal(false);
      setRejectComment('');
      setRejectReason('');
      setTask(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Falha ao recusar'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }
  if (error || !task) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="mt-2 text-sm underline"
        >
          Voltar para tarefas
        </button>
      </div>
    );
  }

  const photosBefore = task.photos?.filter((p) => p.type === 'BEFORE') ?? [];
  const photosAfter = task.photos?.filter((p) => p.type === 'AFTER') ?? [];
  const canValidate = user?.role === 'ADMIN' && task.status === 'IN_REVIEW';
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace(/^http:\/\//i, 'https://');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-xl font-bold text-slate-800 flex-1">
          {task.title || 'Tarefa sem título'}
        </h1>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${STATUS_BADGE_CLASS[task.status] ?? 'bg-slate-100 text-slate-700'}`}
        >
          {STATUS_LABEL[task.status] ?? task.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Data agendada: {new Date(task.scheduledDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4" />
            <span>Funcionário: {task.employeeId ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>Área: {task.areaId}</span>
          </div>
          {task.description && (
            <p className="text-slate-600 text-sm pt-2 border-t border-slate-100">
              {task.description}
            </p>
          )}
          {task.rejectedComment && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
              <strong>Recusa anterior:</strong> {task.rejectedComment}
              {task.rejectedAt && (
                <div className="text-amber-600 mt-1">
                  {new Date(task.rejectedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Fotos do serviço
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Antes</p>
              {photosBefore.length ? (
                <div className="space-y-2">
                  {photosBefore.map((p) => (
                    <a
                      key={p.id}
                      href={p.url.startsWith('http') ? p.url : `${baseUrl}${p.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded border border-slate-200 overflow-hidden"
                    >
                      <img
                        src={p.url.startsWith('http') ? p.url : `${baseUrl}${p.url}`}
                        alt="Antes"
                        className="w-full h-32 object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="h-32 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                  Nenhuma foto
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Depois</p>
              {photosAfter.length ? (
                <div className="space-y-2">
                  {photosAfter.map((p) => (
                    <a
                      key={p.id}
                      href={p.url.startsWith('http') ? p.url : `${baseUrl}${p.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded border border-slate-200 overflow-hidden"
                    >
                      <img
                        src={p.url.startsWith('http') ? p.url : `${baseUrl}${p.url}`}
                        alt="Depois"
                        className="w-full h-32 object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="h-32 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                  Nenhuma foto
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {canValidate && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowApproveModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </button>
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            <XCircle className="w-4 h-4" />
            Recusar
          </button>
        </div>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-slate-800 mb-2">Aprovar serviço?</h3>
            <p className="text-slate-600 text-sm mb-4">
              O status da tarefa será alterado para <strong>Concluída (DONE)</strong>.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white disabled:opacity-50"
              >
                {actionLoading ? 'Aprovando…' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-slate-800 mb-2">Recusar serviço</h3>
            <p className="text-slate-600 text-sm mb-3">
              A tarefa voltará para <strong>Em execução</strong>. O comentário é obrigatório.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Motivo da recusa (obrigatório)"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2 min-h-[80px]"
              rows={3}
            />
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Categoria (opcional)"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowRejectModal(false); setRejectComment(''); setRejectReason(''); }}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !rejectComment.trim()}
                className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
              >
                {actionLoading ? 'Recusando…' : 'Recusar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
