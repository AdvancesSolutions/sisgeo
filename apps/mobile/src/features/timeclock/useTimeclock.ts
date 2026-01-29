import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TimeClock } from '@sigeo/shared';
import apiClient from '../../services/apiClient';
import { useAddToOfflineQueue } from '../offline/useOfflineQueue';
import { isNetworkError } from '../../utils/offlineQueue';

interface TimeClockCheckBody {
  employeeId: string;
  lat?: number;
  lng?: number;
}

export function useTimeClockHistory(employeeId: string | null, limit = 20) {
  return useQuery({
    queryKey: ['timeclock', employeeId, limit],
    queryFn: async (): Promise<TimeClock[]> => {
      const { data } = await apiClient.get<TimeClock[]>(
        `/time-clock/employee/${employeeId}`,
        { params: { limit } }
      );
      return Array.isArray(data) ? data : (data as { data?: TimeClock[] })?.data ?? [];
    },
    enabled: !!employeeId,
  });
}

export function useCheckIn(employeeId: string | null) {
  const qc = useQueryClient();
  const addToQueue = useAddToOfflineQueue();
  return useMutation({
    mutationFn: async (coords: { lat: number; lng: number }) => {
      const body: TimeClockCheckBody = {
        employeeId: employeeId!,
        lat: coords.lat,
        lng: coords.lng,
      };
      const { data } = await apiClient.post<TimeClock>('/time-clock/checkin', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeclock'] });
    },
    onError: (err, coords) => {
      if (employeeId && isNetworkError(err)) {
        addToQueue('checkin', { employeeId, lat: coords.lat, lng: coords.lng });
      }
    },
  });
}

export function useCheckOut(employeeId: string | null) {
  const qc = useQueryClient();
  const addToQueue = useAddToOfflineQueue();
  return useMutation({
    mutationFn: async (coords: { lat: number; lng: number }) => {
      const body: TimeClockCheckBody = {
        employeeId: employeeId!,
        lat: coords.lat,
        lng: coords.lng,
      };
      const { data } = await apiClient.post<TimeClock>('/time-clock/checkout', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeclock'] });
    },
    onError: (err, coords) => {
      if (employeeId && isNetworkError(err)) {
        addToQueue('checkout', { employeeId, lat: coords.lat, lng: coords.lng });
      }
    },
  });
}
