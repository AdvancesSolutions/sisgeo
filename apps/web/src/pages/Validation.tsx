import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';

interface TaskPhoto {
  id: string;
  type: string;
  url: string;
}

interface Task {
  id: string;
  title: string | null;
  status: string;
  employeeId: string | null;
  scheduledDate: string;
  areaId: string;
  photos?: TaskPhoto[];
}

export function Validation() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    api
      .get<Task[]>('/tasks/validation/queue')
      .then(({ data }) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setError('Falha ao carregar fila'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/tasks/${id}/approve`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Falha ao aprovar');
    }
  };

  const handleReject = async (id: string) => {
    const comment = window.prompt('Comentário obrigatório na recusa:');
    if (comment == null || !comment.trim()) return;
    try {
      await api.post(`/tasks/${id}/reject`, { comment: comment.trim() });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Falha ao recusar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-6 h-6 text-slate-700" />
        <h1 className="text-xl font-bold text-slate-800">Fila de validação</h1>
      </div>
      <p className="text-slate-600 text-sm">
        Tarefas aguardando aprovação (status IN_REVIEW). Aprove ou recuse com comentário.
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">Nenhuma tarefa em validação</p>
          <p className="text-slate-500 text-sm mt-1">Todas as tarefas foram validadas ou ainda não foram enviadas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">Tarefa</th>
                <th className="px-4 py-3 font-medium text-slate-700">Funcionário</th>
                <th className="px-4 py-3 font-medium text-slate-700">Data</th>
                <th className="px-4 py-3 font-medium text-slate-700">Fotos</th>
                <th className="px-4 py-3 font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const photos = (task as Task & { photos?: TaskPhoto[] }).photos ?? [];
                const before = photos.filter((p) => p.type === 'BEFORE').length;
                const after = photos.filter((p) => p.type === 'AFTER').length;
                return (
                  <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-sky-600 hover:underline font-medium"
                      >
                        {task.title || task.id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{task.employeeId ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(task.scheduledDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {before} antes / {after} depois
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(task.id)}
                          className="flex items-center gap-1 text-emerald-600 hover:underline text-xs"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(task.id)}
                          className="flex items-center gap-1 text-red-600 hover:underline text-xs"
                        >
                          <XCircle className="w-3 h-3" />
                          Recusar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}