import { Task } from "../types/models";

export const mockTasks: Task[] = [
  { id: "OS-001", title: "Limpeza geral", type: "Limpeza", location: "Unidade Centro", area: "Sala 102", assignee: "Maria Silva", status: "completed", priority: "Média", scheduledAt: "08:00", sla: "2h", description: "Limpeza completa da sala incluindo piso, mesas e janelas." },
  { id: "OS-002", title: "Manutenção ar-condicionado", type: "Manutenção", location: "Unidade Centro", area: "Sala 205", assignee: "João Santos", status: "in_progress", priority: "Alta", scheduledAt: "09:30", sla: "4h", description: "Manutenção preventiva do sistema de ar-condicionado central.", checklist: ["Verificar filtros", "Limpar serpentina", "Testar funcionamento"] },
  { id: "OS-003", title: "Inspeção extintores", type: "Inspeção", location: "Unidade Sul", area: "Corredor B", assignee: "Carlos Oliveira", status: "validating", priority: "Alta", scheduledAt: "10:00", sla: "1h", description: "Verificação de pressão, lacre e validade de todos os extintores." },
  { id: "OS-004", title: "Limpeza banheiros", type: "Limpeza", location: "Unidade Norte", area: "Banheiro 3° andar", assignee: "Ana Costa", status: "pending", priority: "Média", scheduledAt: "11:00", sla: "1h30" },
  { id: "OS-005", title: "Reparo elétrico", type: "Manutenção", location: "Unidade Leste", area: "Recepção", assignee: "Pedro Lima", status: "rejected", priority: "Alta", scheduledAt: "13:00", sla: "3h", description: "Troca de disjuntor e verificação de fiação." },
  { id: "OS-006", title: "Jardinagem", type: "Manutenção", location: "Unidade Centro", area: "Área externa", assignee: "Roberto Alves", status: "pending", priority: "Baixa", scheduledAt: "14:00", sla: "4h" },
  { id: "OS-007", title: "Limpeza pós-evento", type: "Limpeza", location: "Unidade Sul", area: "Auditório", assignee: "Maria Silva", status: "in_progress", priority: "Alta", scheduledAt: "15:00", sla: "2h", checklist: ["Limpar bancadas", "Desinfetar pias", "Limpar piso"] },
];

export const tasksForTechnician = mockTasks.filter(
  (t) => t.assignee === "João Santos" || t.assignee === "Maria Silva"
).slice(0, 6);

// Tarefas para a tela principal (ordem do design: 1/3 concluído)
export const homeScreenTasks: Task[] = [
  { id: "OS-001", title: "Limpeza geral", type: "Limpeza", location: "Unidade Centro", area: "Sala 102", assignee: "Maria Silva", status: "completed", priority: "Média", scheduledAt: "08:00", sla: "2h", description: "Limpeza completa da sala incluindo piso, mesas e janelas." },
  { id: "OS-002", title: "Manutenção ar-condicionado", type: "Manutenção", location: "Unidade Centro", area: "Sala 205", assignee: "João Santos", status: "in_progress", priority: "Alta", scheduledAt: "09:30", sla: "4h", description: "Manutenção preventiva.", checklist: ["Verificar filtros", "Limpar serpentina", "Testar funcionamento"] },
  { id: "OS-007", title: "Limpeza pós-evento", type: "Limpeza", location: "Unidade Sul", area: "Auditório", assignee: "Maria Silva", status: "in_progress", priority: "Alta", scheduledAt: "15:00", sla: "2h", checklist: ["Limpar bancadas", "Desinfetar pias", "Limpar piso"] },
];
