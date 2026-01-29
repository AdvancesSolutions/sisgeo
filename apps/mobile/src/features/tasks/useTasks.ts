import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus } from '@sigeo/shared';
import apiClient from '../../services/apiClient';
import { useAddToOfflineQueue } from '../offline/useOfflineQueue';
import { isNetworkError } from '../../utils/offlineQueue';
interface TasksResponse {
  data: Task[];
  total: number;
  totalPages: number;
}

export function useTasksList(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['tasks', page, limit],
    queryFn: async (): Promise<TasksResponse> => {
      const { data } = await apiClient.get<TasksResponse>('/tasks', {
        params: { page, limit },
      });
      return data;
    },
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async (): Promise<Task> => {
      const { data } = await apiClient.get<Task>(`/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  const addToQueue = useAddToOfflineQueue();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await apiClient.patch<Task>(`/tasks/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task'] });
    },
    onError: (err, { id, status }) => {
      if (isNetworkError(err)) {
        addToQueue('updateTask', { id, status });
      }
    },
  });
}
