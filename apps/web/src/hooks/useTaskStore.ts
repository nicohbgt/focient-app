import { useState, useCallback } from 'react';
import type { TaskResponseDto, TaskStatus } from '@focient/contracts';

/**
 * FoCient Task State Store
 *
 * Manages the task list, completed status transitions,
 * and Top-3 focus task isolation.
 */
export function useTaskStore(initialTasks: TaskResponseDto[] = []) {
  const [tasks, setTasks] = useState<TaskResponseDto[]>(initialTasks);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const toggleTaskComplete = useCallback((taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: completed ? ('COMPLETED' as TaskStatus) : ('TODO' as TaskStatus),
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  }, []);

  const addTask = useCallback((task: TaskResponseDto) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const top3Tasks = tasks
    .filter((t) => t.status !== 'COMPLETED' && t.priority === 'TOP_3')
    .slice(0, 3);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return {
    tasks,
    filteredTasks,
    top3Tasks,
    filter,
    setFilter,
    toggleTaskComplete,
    addTask,
    removeTask,
    setTasks,
  };
}
