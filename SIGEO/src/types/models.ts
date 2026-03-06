// ============================================================
// SIGEO - Shared Types
// ============================================================

export type TaskStatus = "pending" | "in_progress" | "validating" | "completed" | "rejected";
export type Priority = "Alta" | "Média" | "Baixa";
export type EmployeeStatus = "Ativo" | "Em campo" | "Inativo";
export type TimeClockStatus = "ok" | "late" | "gps_issue" | "absent";
export type MovementType = "Entrada" | "Saída";
export type UserRole = "admin" | "supervisor" | "operator" | "inspector";

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
  createdAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  unit: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  tasksToday: number;
  completedToday: number;
  avatar: string;
  cpf?: string;
  hireDate?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  min: number;
  lastMovement: MovementType;
  lastDate: string;
  consumption: number;
}

export interface TimeClockRecord {
  id: string;
  employee: string;
  unit: string;
  checkIn: string;
  checkOut: string;
  gpsIn: boolean;
  gpsOut: boolean;
  status: TimeClockStatus;
  hours: string;
}

export interface ValidationItem {
  id: string;
  title: string;
  location: string;
  assignee: string;
  submittedAt: string;
  photoBefore: string;
  photoAfter: string;
  gpsValid: boolean;
  checklist: string[];
  checklistDone: boolean[];
  materials: { name: string; qty: number }[];
  notes: string;
}

export interface StockMovement {
  materialId: string;
  materialName: string;
  type: MovementType;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  user: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  areas: number;
  activeEmployees: number;
  geofenceRadius: number;
  lat?: number;
  lng?: number;
}
