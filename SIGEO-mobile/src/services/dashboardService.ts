/**
 * Dashboard SIGEO - Endpoint unificado
 * Retorna: usuario + estatisticas_dia + tarefas
 */
import { api } from "./api";
import { apiTarefaToTask } from "./apiMapper";
import type { ApiDashboardResponse } from "../types/api";
import type { Task } from "../types/models";

export interface DashboardData {
  usuario: ApiDashboardResponse["usuario"];
  estatisticas: ApiDashboardResponse["estatisticas_dia"];
  tarefas: Task[];
}

export const dashboardService = {
  /**
   * Busca dados do dashboard (usuario, estatísticas, tarefas)
   * Mesma estrutura consumida pelo Web para consistência visual
   */
  async get(): Promise<DashboardData> {
    const data = await api.get<ApiDashboardResponse>("/dashboard");
    return {
      usuario: data.usuario,
      estatisticas: data.estatisticas_dia,
      tarefas: data.tarefas.map(apiTarefaToTask),
    };
  },
};
