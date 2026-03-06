/**
 * Mapeamento entre formato da API e modelo interno
 * Consistência visual: mesmos IDs e nomes em Desktop e Mobile
 */
import type { ApiTarefa } from "../types/api";
import type { Task, TaskStatus, Priority } from "../types/models";

const STATUS_API_TO_INTERNAL: Record<string, TaskStatus> = {
  Pendente: "pending",
  "Em Execução": "in_progress",
  Validando: "validating",
  Concluída: "completed",
  Reprovada: "rejected",
};

const PRIORITY_API_TO_INTERNAL: Record<string, Priority> = {
  Normal: "Média",
  Média: "Média",
  Alta: "Alta",
  Baixa: "Baixa",
};

export function apiTarefaToTask(api: ApiTarefa): Task {
  return {
    id: api.id,
    title: api.titulo,
    type: "",
    location: api.local,
    area: api.area || "",
    assignee: "",
    status: STATUS_API_TO_INTERNAL[api.status] ?? "pending",
    priority: (PRIORITY_API_TO_INTERNAL[api.prioridade] ?? "Média") as Priority,
    scheduledAt: api.horario,
    sla: "",
    description: api.descricao,
    checklist: api.checklist,
    statusColor: api.cor_status,
  };
}

export function taskToApiStatus(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: "Pendente",
    in_progress: "Em Execução",
    validating: "Validando",
    completed: "Concluída",
    rejected: "Reprovada",
  };
  return map[status] ?? "Pendente";
}
