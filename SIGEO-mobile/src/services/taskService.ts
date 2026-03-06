/**
 * Serviço de Tarefas - API unificada
 * Sincronização de status: painel Web atualiza em tempo real
 * Fila: alterações offline enviadas quando houver conexão
 */
import { api } from "./api";
import { apiTarefaToTask, taskToApiStatus } from "./apiMapper";
import type { ApiTarefa } from "../types/api";
import type { Task } from "../types/models";

export interface TaskFinishPayload {
  notes: string;
  checklist: boolean[];
  photoBefore: string;
  photoAfter: string;
  signatureData?: string;
  lat?: number;
  lng?: number;
}

export const taskService = {
  async list(): Promise<Task[]> {
    return api.get<Task[]>("/tasks");
  },

  async getById(id: string): Promise<Task> {
    const raw = await api.get<ApiTarefa>(`/tasks/${id}`);
    return apiTarefaToTask(raw);
  },

  async getByQrCode(qrData: string): Promise<Task | null> {
    try {
      const data = await api.get<{ tarefa: unknown }>("/tasks/by-qr", { code: qrData });
      return data?.tarefa as Task;
    } catch {
      return null;
    }
  },

  /**
   * Atualiza status - Web mostra "Atualizado via mobile há X minutos"
   */
  async updateStatus(taskId: string, status: Task["status"]): Promise<Task> {
    const payload = {
      tarefa_id: taskId,
      novo_status: taskToApiStatus(status),
      atualizado_via_mobile_em: new Date().toISOString(),
    };
    return api.patch<Task>(`/tasks/${taskId}/status`, payload);
  },

  async finish(taskId: string, payload: TaskFinishPayload): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/finish`, {
      ...payload,
      atualizado_via_mobile_em: new Date().toISOString(),
    });
  },
};
