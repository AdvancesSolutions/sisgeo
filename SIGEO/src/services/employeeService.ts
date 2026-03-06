import api from "./api";
import type { Employee } from "@/types/models";

export const employeeService = {
  list: async (filters?: Record<string, string>): Promise<Employee[]> => {
    const { data } = await api.get("/employees", { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Employee> => {
    const { data } = await api.get(`/employees/${id}`);
    return data;
  },

  create: async (payload: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.post("/employees", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.put(`/employees/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};
