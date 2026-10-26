import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/task_state.dart';

final taskListProvider = StateNotifierProvider<TaskListNotifier, List<MobileTask>>((ref) {
  return TaskListNotifier([
    MobileTask(
      id: 'm-1',
      title: 'Selesaikan Desain Arsitektur FoCient Monorepo',
      durationMinutes: 90,
      priority: TaskPriorityEnum.top3,
      status: TaskStatusEnum.inProgress,
    ),
    MobileTask(
      id: 'm-2',
      title: 'Review Kontrak DTO & Migrasi Database Relasional',
      durationMinutes: 60,
      priority: TaskPriorityEnum.top3,
      status: TaskStatusEnum.todo,
    ),
    MobileTask(
      id: 'm-3',
      title: 'Sinkronisasi Token Visual Inter 100% Multi-Platform',
      durationMinutes: 45,
      priority: TaskPriorityEnum.top3,
      status: TaskStatusEnum.todo,
    ),
    MobileTask(
      id: 'm-4',
      title: 'Pemeriksaan Buffer Rest & Pacing Balance',
      durationMinutes: 30,
      priority: TaskPriorityEnum.normal,
      status: TaskStatusEnum.todo,
    ),
  ]);
});

class TaskListNotifier extends StateNotifier<List<MobileTask>> {
  TaskListNotifier(super.state);

  void toggleTask(String id) {
    state = [
      for (final task in state)
        if (task.id == id)
          task.copyWith(
            status: task.status == TaskStatusEnum.completed
                ? TaskStatusEnum.todo
                : TaskStatusEnum.completed,
          )
        else
          task
    ];
  }

  void addTask(MobileTask task) {
    state = [...state, task];
  }

  void reorderTasks(int oldIndex, int newIndex) {
    final list = [...state];
    final item = list.removeAt(oldIndex);
    list.insert(newIndex > oldIndex ? newIndex - 1 : newIndex, item);
    state = list;
  }
}

final top3TasksProvider = Provider<List<MobileTask>>((ref) {
  final tasks = ref.watch(taskListProvider);
  return tasks
      .where((t) => t.priority == TaskPriorityEnum.top3 && !t.isCompleted)
      .take(3)
      .toList();
});

final dailyCapacityProvider = Provider<Map<String, dynamic>>((ref) {
  final tasks = ref.watch(taskListProvider);
  final allocated = tasks
      .where((t) => !t.isCompleted)
      .fold<int>(0, (sum, t) => sum + t.durationMinutes);
  const capacity = 480;
  final percentage = ((allocated / capacity) * 100).round();

  String status = 'LIGHT';
  if (percentage >= 90) {
    status = 'OVERLOAD';
  } else if (percentage >= 75) {
    status = 'NEAR_CAPACITY';
  } else if (percentage >= 50) {
    status = 'OPTIMAL';
  }

  return {
    'allocatedMinutes': allocated,
    'capacityMinutes': capacity,
    'percentage': percentage,
    'status': status,
  };
});
