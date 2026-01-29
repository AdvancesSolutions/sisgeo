import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import apiClient from '../../services/apiClient';
import {
  getPendingActions,
  removePendingAction,
  type PendingAction,
  type PendingActionType,
} from '../../utils/offlineQueue';

const QUERY_KEY = ['offlineQueue'];

export function useOfflinePendingCount() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getPendingActions,
    select: (actions) => actions.length,
  });
}

async function runAction(action: PendingAction): Promise<boolean> {
  try {
    if (action.type === 'checkin') {
      const p = action.payload as { employeeId: string; lat: number; lng: number };
      await apiClient.post('/time-clock/checkin', p);
    } else if (action.type === 'checkout') {
      const p = action.payload as { employeeId: string; lat: number; lng: number };
      await apiClient.post('/time-clock/checkout', p);
    } else if (action.type === 'updateTask') {
      const p = action.payload as { id: string; status: string };
      await apiClient.patch(`/tasks/${p.id}`, { status: p.status });
    } else {
      return false;
    }
    await removePendingAction(action.id);
    return true;
  } catch {
    return false;
  }
}

export function useFlushOfflineQueue() {
  const queryClient = useQueryClient();

  const flush = useCallback(async (): Promise<{ synced: number; failed: number }> => {
    const actions = await getPendingActions();
    let synced = 0;
    let failed = 0;
    for (const action of actions) {
      const ok = await runAction(action);
      if (ok) synced++;
      else failed++;
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['timeclock'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    return { synced, failed };
  }, [queryClient]);

  return flush;
}

export function useAddToOfflineQueue() {
  const queryClient = useQueryClient();

  const addToQueue = useCallback(
    async (type: PendingActionType, payload: unknown) => {
      const { addPendingAction } = await import('../../utils/offlineQueue');
      await addPendingAction(type, payload);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    [queryClient]
  );

  return addToQueue;
}
