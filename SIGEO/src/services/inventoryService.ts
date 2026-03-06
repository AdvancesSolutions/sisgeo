import api from "./api";
import type { Material, MovementType, StockMovement } from "@/types/models";

export const inventoryService = {
  list: async (): Promise<Material[]> => {
    const { data } = await api.get("/inventory");
    return data;
  },

  updateStock: async (
    materialId: string,
    type: MovementType,
    quantity: number,
    reason: string
  ): Promise<StockMovement> => {
    const { data } = await api.post(`/inventory/${materialId}/movement`, {
      type,
      quantity,
      reason,
    });
    return data;
  },

  getMovements: async (materialId?: string): Promise<StockMovement[]> => {
    const url = materialId
      ? `/inventory/${materialId}/movements`
      : "/inventory/movements";
    const { data } = await api.get(url);
    return data;
  },
};
