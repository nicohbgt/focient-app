import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { TaskResponseDto, CreateTaskDto, UpdateTaskDto, API_ROUTES } from '@focient/contracts';

export const TASKS_QUERY_KEY = ['tasks'];
export const TOP3_QUERY_KEY = ['tasks', 'top-3'];
export const LOCAL_STORAGE_WEB_TASKS = 'focient_web_tasks';

function getStoredTasks(): TaskResponseDto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_WEB_TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredTasks(tasks: TaskResponseDto[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_WEB_TASKS, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors in restricted test environments
  }
}

export function useTasksQuery() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      try {
        const remote = await apiClient<TaskResponseDto[]>(API_ROUTES.TASKS.BASE);
        if (Array.isArray(remote) && remote.length > 0) {
          setStoredTasks(remote);
          return remote;
        }
        const cached = getStoredTasks();
        return cached.length > 0 ? cached : remote || [];
      } catch (err) {
        const cached = getStoredTasks();
        if (cached.length > 0) return cached;
        throw err;
      }
    },
    initialData: typeof window !== 'undefined' ? getStoredTasks() : undefined,
  });
}

export function useTop3TasksQuery() {
  return useQuery({
    queryKey: TOP3_QUERY_KEY,
    queryFn: () => apiClient<TaskResponseDto[]>(API_ROUTES.TASKS.TOP_3),
  });
}

interface CreateMutationContext {
  previousTasks: TaskResponseDto[];
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation<TaskResponseDto, CreateTaskDto, CreateMutationContext>({
    mutationFn: (data: CreateTaskDto) =>
      apiClient<TaskResponseDto>(API_ROUTES.TASKS.BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onMutate: async (newTask: CreateTaskDto): Promise<CreateMutationContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks =
        queryClient.getQueryData<TaskResponseDto[]>(TASKS_QUERY_KEY) || getStoredTasks();

      const optimisticTask: TaskResponseDto = {
        id: `task-${Date.now()}`,
        userId: 'current-user',
        title: newTask.title,
        durationMinutes: newTask.durationMinutes ?? 25,
        priority: newTask.priority ?? 'NORMAL',
        energyLevel: newTask.energyLevel ?? 'MEDIUM',
        status: 'TODO',
        categoryId: newTask.categoryId ?? 'cat-default',
        scheduledStart: newTask.scheduledStart ?? new Date().toISOString(),
        targetDate: newTask.targetDate ?? new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [optimisticTask, ...previousTasks];
      queryClient.setQueryData<TaskResponseDto[]>(TASKS_QUERY_KEY, updated);
      setStoredTasks(updated);

      return { previousTasks };
    },
    onError: (_err: unknown, _newTask: CreateTaskDto, context: CreateMutationContext | undefined) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
        setStoredTasks(context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TOP3_QUERY_KEY });
    },
  });
}

interface UpdateMutationContext {
  previousTasks: TaskResponseDto[];
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation<TaskResponseDto, { id: string; data: UpdateTaskDto }, UpdateMutationContext>({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      apiClient<TaskResponseDto>(API_ROUTES.TASKS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, data }: { id: string; data: UpdateTaskDto }): Promise<UpdateMutationContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks =
        queryClient.getQueryData<TaskResponseDto[]>(TASKS_QUERY_KEY) || getStoredTasks();

      const updated = previousTasks.map((t: TaskResponseDto) =>
        t.id === id ? { ...t, ...data } : t
      );
      queryClient.setQueryData<TaskResponseDto[]>(TASKS_QUERY_KEY, updated);
      setStoredTasks(updated);

      return { previousTasks };
    },
    onError: (_err: unknown, _vars: { id: string; data: UpdateTaskDto }, context: UpdateMutationContext | undefined) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
        setStoredTasks(context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TOP3_QUERY_KEY });
    },
  });
}
