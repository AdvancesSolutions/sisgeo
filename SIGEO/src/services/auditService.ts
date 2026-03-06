import api from "./api";

export interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  detail: string;
  type: "info" | "success" | "warning" | "danger";
}

export const auditService = {
  list: async (filters?: Record<string, string>): Promise<AuditLog[]> => {
    const { data } = await api.get("/audit/logs", { params: filters });
    return data;
  },

  export: async (format: "csv" | "pdf" = "csv"): Promise<Blob> => {
    const { data } = await api.get("/audit/export", {
      params: { format },
      responseType: "blob",
    });
    return data;
  },
};
