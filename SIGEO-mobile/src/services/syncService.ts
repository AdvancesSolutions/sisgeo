/**
 * Sincronização - Push para servidor quando online
 * Processa a fila offline e envia ao backend
 */
import * as Network from "expo-network";
import { api } from "./api";
import { taskToApiStatus } from "./apiMapper";
import { taskService } from "./taskService";
import { offlineQueue, type QueuedAction } from "./offlineQueue";
import type { TaskStatus } from "../types/models";

async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected === true && state.isInternetReachable !== false;
}

async function processCheckin(payload: Record<string, unknown>): Promise<boolean> {
  await api.post("/timeclock/checkin", {
    lat: payload.lat,
    lng: payload.lng,
    timestamp: payload.timestamp,
  });
  return true;
}

async function processTaskUpdate(payload: Record<string, unknown>): Promise<boolean> {
  const taskId = payload.taskId as string;
  const status = payload.status as TaskStatus;
  const updatedAt = (payload.atualizado_via_mobile_em as string) || new Date().toISOString();
  await api.patch(`/tasks/${taskId}/status`, {
    tarefa_id: taskId,
    novo_status: taskToApiStatus(status),
    atualizado_via_mobile_em: updatedAt,
  });
  return true;
}

async function processTaskFinish(payload: Record<string, unknown>): Promise<boolean> {
  await taskService.finish(payload.taskId as string, {
    notes: (payload.notes as string) || "",
    checklist: (payload.checklist as boolean[]) || [],
    photoBefore: (payload.photoBefore as string) || "",
    photoAfter: (payload.photoAfter as string) || "",
  });
  return true;
}

async function processAction(action: QueuedAction): Promise<boolean> {
  switch (action.type) {
    case "checkin":
      return processCheckin(action.payload);
    case "task_update":
      return processTaskUpdate(action.payload);
    case "task_finish":
      return processTaskFinish(action.payload);
    case "photo_upload":
      // TODO: upload de foto para /evidence/upload
      return true;
    default:
      return false;
  }
}

export const syncService = {
  async syncNow(): Promise<{ synced: number; failed: number }> {
    if (!(await isOnline())) return { synced: 0, failed: 0 };

    const queue = await offlineQueue.getAll();
    let synced = 0;
    let failed = 0;
    const toRemove: string[] = [];

    for (const action of queue) {
      try {
        const ok = await processAction(action);
        if (ok) {
          toRemove.push(action.id);
          synced++;
        } else failed++;
      } catch {
        failed++;
      }
    }

    await offlineQueue.removeAll(toRemove);
    return { synced, failed };
  },

  isOnline,
};
