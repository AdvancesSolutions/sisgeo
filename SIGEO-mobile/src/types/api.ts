/**
 * Estrutura de resposta da API SIGEO
 * Consistência: mesmos IDs (OS-001) e nomes de unidades no Desktop e Mobile
 */

export interface ApiUsuario {
  id: string;
  nome: string;
  iniciais: string;
  cargo: string;
}

export interface ApiEstatisticasDia {
  total_tarefas: number;
  concluidas: number;
  percentual_progresso: number;
}

export interface ApiTarefa {
  id: string;
  titulo: string;
  status: string; // "Concluída" | "Em Execução" | "Pendente" | "Validando" | "Reprovada"
  local: string;
  horario: string;
  prioridade: string; // "Normal" | "Alta" | "Baixa"
  cor_status: string;
  area?: string;
  descricao?: string;
  checklist?: string[];
  atualizado_via_mobile_em?: string; // ISO timestamp: "Atualizado via mobile há X minutos"
}

export interface ApiDashboardResponse {
  usuario: ApiUsuario;
  estatisticas_dia: ApiEstatisticasDia;
  tarefas: ApiTarefa[];
}

export interface ApiStatusUpdatePayload {
  tarefa_id: string;
  novo_status: string;
  atualizado_via_mobile_em: string; // ISO timestamp
}
