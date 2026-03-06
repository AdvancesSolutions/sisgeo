import api from "./api";
import type { Task, TaskStatus, Priority } from "@/types/models";

export interface CreateTaskPayload {
  title: string;
  type: string;
  location: string;
  area?: string;
  assignee: string;
  priority: Priority;
  scheduledAt: string;
  sla: string;
  description?: string;
}

export const taskService = {
  list: async (filters?: Record<string, string>): Promise<Task[]> => {
    const { data } = await api.get("/tasks", { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await api.post("/tasks", payload);
    return data;
  },

  assign: async (taskId: string, technicianId: string): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${taskId}/assign`, { technicianId });
    return data;
  },

  updateStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    return data;
  },

  approve: async (taskId: string): Promise<Task> => {
    const { data } = await api.post(`/tasks/${taskId}/approve`);
    return data;
  },

  reject: async (taskId: string, reason: string): Promise<Task> => {
    const { data } = await api.post(`/tasks/${taskId}/reject`, { reason });
    return data;
  },
};
