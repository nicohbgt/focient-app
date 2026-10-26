import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { TaskResponseDto, CreateTaskDto, UpdateTaskDto, API_ROUTES } from '@focient/contracts';

export const TASKS_QUERY_KEY = ['tasks'];
export const TOP3_QUERY_KEY = ['tasks', 'top-3'];

export function useTasksQuery() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => apiClient<TaskResponseDto[]>(API_ROUTES.TASKS.BASE),
  });
}

export function useTop3TasksQuery() {
  return useQuery({
    queryKey: TOP3_QUERY_KEY,
    queryFn: () => apiClient<TaskResponseDto[]>(API_ROUTES.TASKS.TOP_3),
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) =>
      apiClient<TaskResponseDto>(API_ROUTES.TASKS.BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TOP3_QUERY_KEY });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      apiClient<TaskResponseDto>(API_ROUTES.TASKS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TOP3_QUERY_KEY });
    },
  });
}
