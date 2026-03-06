/**
 * Hook: Sincronização e status de rede
 * Offline First - enfileira quando offline, sincroniza quando online
 */
import { useState, useEffect, useCallback } from "react";
import * as Network from "expo-network";
import { offlineQueue } from "../services/offlineQueue";
import { syncService } from "../services/syncService";

export function useNetworkSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshStatus = useCallback(async () => {
    const online = await syncService.isOnline();
    setIsOnline(online);
    const count = await offlineQueue.count();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const { synced } = await syncService.syncNow();
      await refreshStatus();
      return synced;
    } finally {
      setSyncing(false);
    }
  }, [refreshStatus]);

  const enqueue = useCallback(
    async (type: Parameters<typeof offlineQueue.enqueue>[0], payload: Record<string, unknown>) => {
      await offlineQueue.enqueue(type, payload);
      await refreshStatus();
    },
    [refreshStatus]
  );

  useEffect(() => {
    refreshStatus();
    const sub = Network.addNetworkStateListener(() => refreshStatus());
    const interval = setInterval(refreshStatus, 5000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [refreshStatus]);

  return { isOnline, pendingCount, syncing, syncNow, enqueue, refreshStatus };
}
