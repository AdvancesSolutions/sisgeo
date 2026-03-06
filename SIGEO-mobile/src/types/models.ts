export type TaskStatus = "pending" | "in_progress" | "validating" | "completed" | "rejected";
export type Priority = "Alta" | "Média" | "Baixa";

export interface Task {
  id: string;
  title: string;
  type: string;
  location: string;
  area: string;
  assignee: string;
  status: TaskStatus;
  priority: Priority;
  scheduledAt: string;
  sla: string;
  description?: string;
  checklist?: string[];
  /** Cor do status vinda da API (ex: #4CAF50) - usada no badge quando presente */
  statusColor?: string;
}
