import { toast } from "@/hooks/use-toast";

export interface QueuedAction {
  id: string;
  type: "checkin" | "task_update" | "photo_upload" | "task_finish";
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = "sigeo_offline_queue";
const MAX_RETRIES = 5;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const offlineQueue = {
  /** Get all pending actions */
  getQueue: (): QueuedAction[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Add an action to the offline queue */
  enqueue: (type: QueuedAction["type"], payload: Record<string, unknown>): QueuedAction => {
    const action: QueuedAction = {
      id: generateId(),
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };
    const queue = offlineQueue.getQueue();
    queue.push(action);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return action;
  },

  /** Remove a successfully synced action */
  dequeue: (id: string) => {
    const queue = offlineQueue.getQueue().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  /** Clear entire queue */
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Get pending count */
  pendingCount: (): number => {
    return offlineQueue.getQueue().length;
  },

  /** Process the queue — attempt to sync each action with the backend */
  sync: async (): Promise<{ synced: number; failed: number }> => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    if (!navigator.onLine) {
      toast({ title: "Sem conexão", description: `${queue.length} ações aguardando sincronização.`, variant: "destructive" });
      return { synced: 0, failed: queue.length };
    }

    let synced = 0;
    let failed = 0;

    for (const action of queue) {
      try {
        const { default: api } = await import("@/services/api");
        const endpoint = getEndpoint(action);
        const method = getMethod(action);

        if (method === "POST") {
          await api.post(endpoint, action.payload);
        } else if (method === "PATCH") {
          await api.patch(endpoint, action.payload);
        }

        offlineQueue.dequeue(action.id);
        synced++;
      } catch {
        // Increment retry count
        action.retries++;
        if (action.retries >= MAX_RETRIES) {
          offlineQueue.dequeue(action.id);
          failed++;
          console.warn(`[Offline] Ação ${action.id} descartada após ${MAX_RETRIES} tentativas`);
        } else {
          // Update retry count in storage
          const updated = offlineQueue.getQueue().map((a) =>
            a.id === action.id ? { ...a, retries: action.retries } : a
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          failed++;
        }
      }
    }

    if (synced > 0) {
      toast({ title: "Sincronização concluída", description: `${synced} ação(ões) enviada(s) para o servidor.` });
    }
    if (failed > 0) {
      toast({ title: "Falha parcial", description: `${failed} ação(ões) não puderam ser sincronizadas.`, variant: "destructive" });
    }

    return { synced, failed };
  },
};

function getEndpoint(action: QueuedAction): string {
  switch (action.type) {
    case "checkin":
      return "/timeclock/checkin";
    case "task_update":
      return `/tasks/${action.payload.taskId}/status`;
    case "task_finish":
      return `/tasks/${action.payload.taskId}/approve`;
    case "photo_upload":
      return `/tasks/${action.payload.taskId}/photos`;
    default:
      return "/sync";
  }
}

function getMethod(action: QueuedAction): "POST" | "PATCH" {
  switch (action.type) {
    case "task_update":
      return "PATCH";
    default:
      return "POST";
  }
}
