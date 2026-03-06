// ============================================================
// SIGEO - Mock Data Store
// Sistema Integrado de Gestão Operacional
// ============================================================

import { Task, Employee, Material, TimeClockRecord, ValidationItem } from "@/types/models";
import type { AppRole } from "@/types/roles";

export const mockTasks: Task[] = [
  { id: "OS-001", title: "Limpeza geral", type: "Limpeza", location: "Unidade Centro", area: "Sala 102", assignee: "Maria Silva", status: "completed", priority: "Média", scheduledAt: "08:00", sla: "2h", description: "Limpeza completa da sala incluindo piso, mesas e janelas." },
  { id: "OS-002", title: "Manutenção ar-condicionado", type: "Manutenção", location: "Unidade Centro", area: "Sala 205", assignee: "João Santos", status: "in_progress", priority: "Alta", scheduledAt: "09:30", sla: "4h", description: "Manutenção preventiva do sistema de ar-condicionado central." },
  { id: "OS-003", title: "Inspeção extintores", type: "Inspeção", location: "Unidade Sul", area: "Corredor B", assignee: "Carlos Oliveira", status: "validating", priority: "Alta", scheduledAt: "10:00", sla: "1h", description: "Verificação de pressão, lacre e validade de todos os extintores." },
  { id: "OS-004", title: "Limpeza banheiros", type: "Limpeza", location: "Unidade Norte", area: "Banheiro 3° andar", assignee: "Ana Costa", status: "pending", priority: "Média", scheduledAt: "11:00", sla: "1h30" },
  { id: "OS-005", title: "Reparo elétrico", type: "Manutenção", location: "Unidade Leste", area: "Recepção", assignee: "Pedro Lima", status: "rejected", priority: "Alta", scheduledAt: "13:00", sla: "3h", description: "Troca de disjuntor e verificação de fiação." },
  { id: "OS-006", title: "Jardinagem", type: "Manutenção", location: "Unidade Centro", area: "Área externa", assignee: "Roberto Alves", status: "pending", priority: "Baixa", scheduledAt: "14:00", sla: "4h" },
  { id: "OS-007", title: "Limpeza pós-evento", type: "Limpeza", location: "Unidade Sul", area: "Auditório", assignee: "Maria Silva", status: "in_progress", priority: "Alta", scheduledAt: "15:00", sla: "2h" },
];

export const mockEmployees: Employee[] = [
  { id: "EMP-001", name: "Maria Silva", role: "Operadora", unit: "Unidade Centro", phone: "(11) 99999-1234", email: "maria@ops.com", status: "Ativo", tasksToday: 5, completedToday: 3, avatar: "MS" },
  { id: "EMP-002", name: "João Santos", role: "Técnico", unit: "Unidade Centro", phone: "(11) 99999-5678", email: "joao@ops.com", status: "Em campo", tasksToday: 3, completedToday: 1, avatar: "JS" },
  { id: "EMP-003", name: "Carlos Oliveira", role: "Inspetor", unit: "Unidade Sul", phone: "(11) 99999-9012", email: "carlos@ops.com", status: "Em campo", tasksToday: 4, completedToday: 2, avatar: "CO" },
  { id: "EMP-004", name: "Ana Costa", role: "Operadora", unit: "Unidade Norte", phone: "(11) 99999-3456", email: "ana@ops.com", status: "Ativo", tasksToday: 6, completedToday: 4, avatar: "AC" },
  { id: "EMP-005", name: "Pedro Lima", role: "Técnico", unit: "Unidade Leste", phone: "(11) 99999-7890", email: "pedro@ops.com", status: "Inativo", tasksToday: 0, completedToday: 0, avatar: "PL" },
  { id: "EMP-006", name: "Roberto Alves", role: "Operador", unit: "Unidade Centro", phone: "(11) 99999-2345", email: "roberto@ops.com", status: "Ativo", tasksToday: 3, completedToday: 2, avatar: "RA" },
];

export const mockMaterials: Material[] = [
  { id: "MAT-001", name: "Desinfetante 5L", category: "Limpeza", unit: "Unidade Centro", stock: 8, min: 10, lastMovement: "Saída", lastDate: "03/03", consumption: 12 },
  { id: "MAT-002", name: "Pano multiuso (pacote)", category: "Limpeza", unit: "Unidade Centro", stock: 45, min: 20, lastMovement: "Entrada", lastDate: "02/03", consumption: 30 },
  { id: "MAT-003", name: "Lubrificante WD-40", category: "Manutenção", unit: "Unidade Sul", stock: 3, min: 5, lastMovement: "Saída", lastDate: "03/03", consumption: 4 },
  { id: "MAT-004", name: "Lâmpada LED tubular", category: "Manutenção", unit: "Unidade Norte", stock: 22, min: 10, lastMovement: "Entrada", lastDate: "01/03", consumption: 8 },
  { id: "MAT-005", name: "Saco de lixo 100L", category: "Limpeza", unit: "Unidade Leste", stock: 5, min: 15, lastMovement: "Saída", lastDate: "03/03", consumption: 20 },
  { id: "MAT-006", name: "Lacre de segurança", category: "Inspeção", unit: "Unidade Sul", stock: 50, min: 30, lastMovement: "Saída", lastDate: "03/03", consumption: 10 },
];

export const mockTimeClockRecords: TimeClockRecord[] = [
  { id: "TC-001", employee: "Maria Silva", unit: "Unidade Centro", checkIn: "07:58", checkOut: "17:02", gpsIn: true, gpsOut: true, status: "ok", hours: "9h04" },
  { id: "TC-002", employee: "João Santos", unit: "Unidade Centro", checkIn: "08:15", checkOut: "-", gpsIn: true, gpsOut: false, status: "late", hours: "Em campo" },
  { id: "TC-003", employee: "Carlos Oliveira", unit: "Unidade Sul", checkIn: "08:01", checkOut: "16:55", gpsIn: true, gpsOut: true, status: "ok", hours: "8h54" },
  { id: "TC-004", employee: "Ana Costa", unit: "Unidade Norte", checkIn: "08:32", checkOut: "-", gpsIn: false, gpsOut: false, status: "gps_issue", hours: "Em campo" },
  { id: "TC-005", employee: "Pedro Lima", unit: "Unidade Leste", checkIn: "-", checkOut: "-", gpsIn: false, gpsOut: false, status: "absent", hours: "-" },
  { id: "TC-006", employee: "Roberto Alves", unit: "Unidade Centro", checkIn: "07:45", checkOut: "16:50", gpsIn: true, gpsOut: true, status: "ok", hours: "9h05" },
];

export const mockValidations: ValidationItem[] = [
  {
    id: "OS-003", title: "Inspeção extintores", location: "Unidade Sul · Corredor B", assignee: "Carlos Oliveira", submittedAt: "10:42",
    photoBefore: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
    photoAfter: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&h=200&fit=crop",
    gpsValid: true, checklist: ["Verificar pressão", "Verificar lacre", "Verificar validade"], checklistDone: [true, true, true],
    materials: [{ name: "Lacre de segurança", qty: 2 }], notes: "Todos os extintores do corredor B verificados e em conformidade.",
  },
  {
    id: "OS-008", title: "Limpeza profunda - Cozinha", location: "Unidade Centro · Cozinha 2° andar", assignee: "Maria Silva", submittedAt: "11:15",
    photoBefore: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    photoAfter: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=300&h=200&fit=crop",
    gpsValid: true, checklist: ["Limpar bancadas", "Desinfetar pias", "Limpar piso", "Organizar utensílios"], checklistDone: [true, true, true, false],
    materials: [{ name: "Desinfetante", qty: 1 }, { name: "Pano multiuso", qty: 3 }], notes: "Utensílios não foram organizados pois estavam em uso.",
  },
  {
    id: "OS-009", title: "Manutenção porta automática", location: "Unidade Norte · Entrada principal", assignee: "Pedro Lima", submittedAt: "12:30",
    photoBefore: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop",
    photoAfter: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
    gpsValid: false, checklist: ["Verificar sensor", "Lubrificar trilhos", "Testar abertura/fechamento"], checklistDone: [true, true, true],
    materials: [{ name: "Lubrificante WD-40", qty: 1 }], notes: "Porta funcionando normalmente após lubrificação.",
  },
];

// ============================================================
// Data Scoping — filters data by user role & unit
// ============================================================

interface UserScope {
  role: AppRole;
  unit?: string;
  name?: string;
}

export const scopedData = {
  tasks: (user: UserScope) => {
    if (user.role === "super_admin") return mockTasks;
    if (user.role === "manager") return mockTasks.filter((t) => t.location === user.unit);
    // technician sees only their own tasks
    return mockTasks.filter((t) => t.assignee === user.name);
  },
  employees: (user: UserScope) => {
    if (user.role === "super_admin") return mockEmployees;
    if (user.role === "manager") return mockEmployees.filter((e) => e.unit === user.unit);
    return mockEmployees.filter((e) => e.name === user.name);
  },
  materials: (user: UserScope) => {
    if (user.role === "super_admin") return mockMaterials;
    return mockMaterials.filter((m) => m.unit === user.unit);
  },
  timeclock: (user: UserScope) => {
    if (user.role === "super_admin") return mockTimeClockRecords;
    if (user.role === "manager") return mockTimeClockRecords.filter((t) => t.unit === user.unit);
    return mockTimeClockRecords.filter((t) => t.employee === user.name);
  },
};

// Service layer stubs
export const services = {
  tasks: {
    list: async () => mockTasks,
    create: async (task: Partial<Task>) => {
      const newTask = { ...task, id: `OS-${String(mockTasks.length + 1).padStart(3, "0")}` } as Task;
      mockTasks.push(newTask);
      return newTask;
    },
    update: async (id: string, data: Partial<Task>) => {
      const idx = mockTasks.findIndex((t) => t.id === id);
      if (idx >= 0) mockTasks[idx] = { ...mockTasks[idx], ...data };
      return mockTasks[idx];
    },
  },
  employees: {
    list: async () => mockEmployees,
    create: async (emp: Partial<Employee>) => {
      const newEmp = { ...emp, id: `EMP-${String(mockEmployees.length + 1).padStart(3, "0")}` } as Employee;
      mockEmployees.push(newEmp);
      return newEmp;
    },
  },
  materials: {
    list: async () => mockMaterials,
    create: async (mat: Partial<Material>) => {
      const newMat = { ...mat, id: `MAT-${String(mockMaterials.length + 1).padStart(3, "0")}` } as Material;
      mockMaterials.push(newMat);
      return newMat;
    },
  },
};
