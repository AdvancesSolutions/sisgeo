import { useState, useEffect, useCallback } from "react";
import { offlineQueue } from "@/services/offlineQueue";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(offlineQueue.pendingCount());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncNow();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh pending count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(offlineQueue.pendingCount());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const enqueue = useCallback((type: Parameters<typeof offlineQueue.enqueue>[0], payload: Record<string, unknown>) => {
    offlineQueue.enqueue(type, payload);
    setPendingCount(offlineQueue.pendingCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);
    await offlineQueue.sync();
    setPendingCount(offlineQueue.pendingCount());
    setSyncing(false);
  }, [syncing]);

  return { isOnline, pendingCount, syncing, enqueue, syncNow };
}
