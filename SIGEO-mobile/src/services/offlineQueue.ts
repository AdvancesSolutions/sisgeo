/**
 * Offline First - Fila de ações pendentes
 * Armazena ações quando sem internet e sincroniza ao voltar online
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "sigeo_offline_queue";

export type QueuedActionType = "checkin" | "task_update" | "task_finish" | "photo_upload";

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  createdAt: string;
}

async function loadQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const offlineQueue = {
  async enqueue(type: QueuedActionType, payload: Record<string, unknown>): Promise<void> {
    const queue = await loadQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    });
    await saveQueue(queue);
  },

  async getAll(): Promise<QueuedAction[]> {
    return loadQueue();
  },

  async remove(id: string): Promise<void> {
    const queue = await loadQueue();
    await saveQueue(queue.filter((a) => a.id !== id));
  },

  async removeAll(ids: string[]): Promise<void> {
    const queue = await loadQueue();
    const set = new Set(ids);
    await saveQueue(queue.filter((a) => !set.has(a.id)));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  async count(): Promise<number> {
    return (await loadQueue()).length;
  },
};
