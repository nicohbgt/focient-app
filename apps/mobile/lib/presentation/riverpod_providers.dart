import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/planning_state.dart';
import '../data/task_state.dart';

/// Data-driven Task List Provider starting in a pure EMPTY STATE.
/// Tasks are dynamically populated during user onboarding or loaded via API/local cache.
final taskListProvider =
    StateNotifierProvider<TaskListNotifier, List<MobileTask>>((ref) {
  return TaskListNotifier([]);
});

class TaskListNotifier extends StateNotifier<List<MobileTask>> {
  TaskListNotifier([List<MobileTask>? initialTasks])
      : super(initialTasks ?? []);

  void setTasks(List<MobileTask> tasks) {
    state = List.unmodifiable(tasks);
  }

  void addTask(MobileTask task) {
    state = [...state, task];
  }

  void removeTask(String id) {
    state = state.where((t) => t.id != id).toList();
  }

  void clear() {
    state = const [];
  }

  void seedSampleTasks() {
    state = [
      MobileTask(
        id: 't-1',
        title: 'Create the Annual OKR',
        durationMinutes: 25,
        priority: TaskPriorityEnum.top3,
        energyLevel: EnergyLevelEnum.high,
        status: TaskStatusEnum.todo,
        categoryName: 'Strategic',
        categoryColor: const Color(0xFF7C3AED),
        restMinutes: 20,
        dateDisplay: 'October, 10th',
        startHourDisplay: '10:00',
        focusType: 'Deep Focus',
      ),
      MobileTask(
        id: 't-2',
        title: 'Design Architecture Monorepo',
        durationMinutes: 45,
        priority: TaskPriorityEnum.top3,
        energyLevel: EnergyLevelEnum.high,
        status: TaskStatusEnum.todo,
        categoryName: 'Execution',
        categoryColor: const Color(0xFF0284C7),
        restMinutes: 15,
        dateDisplay: 'October, 5th',
        startHourDisplay: '11:00',
        focusType: 'Deep Focus',
      ),
      MobileTask(
        id: 't-3',
        title: 'Finalize Security Audit',
        durationMinutes: 33,
        priority: TaskPriorityEnum.top3,
        energyLevel: EnergyLevelEnum.high,
        status: TaskStatusEnum.todo,
        categoryName: 'Execution',
        categoryColor: const Color(0xFF0284C7),
        restMinutes: 15,
        dateDisplay: 'October, 5th',
        startHourDisplay: '13:00',
        focusType: 'Deep Focus',
      ),
      MobileTask(
        id: 't-4',
        title: 'Meeting Client Sync',
        durationMinutes: 30,
        priority: TaskPriorityEnum.normal,
        energyLevel: EnergyLevelEnum.medium,
        status: TaskStatusEnum.todo,
        categoryName: 'Meeting',
        categoryColor: const Color(0xFFB45309),
        restMinutes: 10,
        dateDisplay: 'October, 5th',
        startHourDisplay: '14:00',
        focusType: 'Light',
      ),
      MobileTask(
        id: 't-5',
        title: 'Implement Color Palette Token',
        durationMinutes: 25,
        priority: TaskPriorityEnum.normal,
        energyLevel: EnergyLevelEnum.medium,
        status: TaskStatusEnum.todo,
        categoryName: 'Execution',
        categoryColor: const Color(0xFF0284C7),
        restMinutes: 10,
        dateDisplay: 'October, 5th',
        startHourDisplay: '14:30',
        focusType: 'Medium',
      ),
      MobileTask(
        id: 't-6',
        title: 'Review PRs & Code Cleanliness',
        durationMinutes: 25,
        priority: TaskPriorityEnum.normal,
        energyLevel: EnergyLevelEnum.medium,
        status: TaskStatusEnum.todo,
        categoryName: 'Execution',
        categoryColor: const Color(0xFF0284C7),
        restMinutes: 10,
        dateDisplay: 'October, 5th',
        startHourDisplay: '15:30',
        focusType: 'Medium',
      ),
      MobileTask(
        id: 't-7',
        title: 'Buffer Rest Check & Rhythm Sync',
        durationMinutes: 25,
        priority: TaskPriorityEnum.normal,
        energyLevel: EnergyLevelEnum.medium,
        status: TaskStatusEnum.todo,
        categoryName: 'Strategic',
        categoryColor: const Color(0xFF7C3AED),
        restMinutes: 10,
        dateDisplay: 'October, 5th',
        startHourDisplay: '16:00',
        focusType: 'Light',
      ),
      MobileTask(
        id: 't-8',
        title: 'Update API Contract DTOs',
        durationMinutes: 20,
        priority: TaskPriorityEnum.normal,
        energyLevel: EnergyLevelEnum.medium,
        status: TaskStatusEnum.todo,
        categoryName: 'Execution',
        categoryColor: const Color(0xFF0284C7),
        restMinutes: 10,
        dateDisplay: 'October, 5th',
        startHourDisplay: '16:30',
        focusType: 'Medium',
      ),
      MobileTask(
        id: 't-9',
        title: 'Message to best friend',
        durationMinutes: 15,
        priority: TaskPriorityEnum.low,
        energyLevel: EnergyLevelEnum.low,
        status: TaskStatusEnum.todo,
        categoryName: 'Personal',
        categoryColor: const Color(0xFFD97706),
        restMinutes: 5,
        dateDisplay: 'October, 5th',
        startHourDisplay: '14:30',
        focusType: 'Light',
      ),
      MobileTask(
        id: 't-10',
        title: 'Clean email inbox & triage',
        durationMinutes: 15,
        priority: TaskPriorityEnum.low,
        energyLevel: EnergyLevelEnum.low,
        status: TaskStatusEnum.todo,
        categoryName: 'Operation',
        categoryColor: const Color(0xFF0D9488),
        restMinutes: 5,
        dateDisplay: 'October, 5th',
        startHourDisplay: '17:00',
        focusType: 'Light',
      ),
      MobileTask(
        id: 't-11',
        title: 'Weekly Reflection & Journal',
        durationMinutes: 15,
        priority: TaskPriorityEnum.low,
        energyLevel: EnergyLevelEnum.low,
        status: TaskStatusEnum.todo,
        categoryName: 'Strategic',
        categoryColor: const Color(0xFF7C3AED),
        restMinutes: 5,
        dateDisplay: 'October, 5th',
        startHourDisplay: '17:20',
        focusType: 'Light',
      ),
      MobileTask(
        id: 't-12',
        title: 'Check Documentation Updates',
        durationMinutes: 15,
        priority: TaskPriorityEnum.low,
        energyLevel: EnergyLevelEnum.low,
        status: TaskStatusEnum.todo,
        categoryName: 'Operation',
        categoryColor: const Color(0xFF0D9488),
        restMinutes: 5,
        dateDisplay: 'October, 5th',
        startHourDisplay: '17:40',
        focusType: 'Light',
      ),
    ];
  }

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
  final percentage = capacity > 0 ? ((allocated / capacity) * 100).round() : 0;

  String status = 'EMPTY';
  if (allocated == 0) {
    status = 'EMPTY';
  } else if (percentage >= 90) {
    status = 'OVERLOAD';
  } else if (percentage >= 75) {
    status = 'NEAR_CAPACITY';
  } else if (percentage >= 50) {
    status = 'OPTIMAL';
  } else {
    status = 'LIGHT';
  }

  return {
    'allocatedMinutes': allocated,
    'capacityMinutes': capacity,
    'percentage': percentage,
    'status': status,
  };
});

/// Data-driven Planning Provider managing "Your Planning" screen state.
/// Starts in empty state by default; supports seeding populated state for mockups.
final planningProvider =
    StateNotifierProvider<PlanningNotifier, PlanningState>((ref) {
  return PlanningNotifier(PlanningState.empty());
});

class PlanningNotifier extends StateNotifier<PlanningState> {
  PlanningNotifier([PlanningState? initialState])
      : super(initialState ?? PlanningState.empty());

  void setPlanningState(PlanningState newState) {
    state = newState;
  }

  void toggleRebalancerDetail() {
    state = state.copyWith(
      showDetailedRebalancer: !state.showDetailedRebalancer,
    );
  }

  void rescheduleOverloadedTasks() {
    if (state.isRebalanced) return;

    // Drop Wednesday from 85% to 65% (Optimal)
    // Rise Thursday from 56% to 75% (Emerald Green)
    final updatedDistribution = state.weeklyDistribution.map((d) {
      if (d.dayKey == 'Wed') {
        return d.copyWith(percentage: 65);
      } else if (d.dayKey == 'Thu') {
        return d.copyWith(percentage: 75);
      }
      return d;
    }).toList();

    state = state.copyWith(
      weeklyDistribution: updatedDistribution,
      isRebalanced: true,
      isScheduleKept: false,
    );
  }

  void keepCurrentSchedule() {
    state = state.copyWith(
      isScheduleKept: true,
      isRebalanced: false,
    );
  }

  void scheduleBacklogTask(String id, String targetTime) {
    final updated = state.backlogTasks.map((t) {
      if (t.id == id) {
        return t.copyWith(isScheduled: true, scheduledTime: targetTime);
      }
      return t;
    }).toList();

    state = state.copyWith(
      backlogTasks: updated,
      metrics: state.metrics.copyWith(
        onScheduledTaskCount: state.metrics.onScheduledTaskCount + 1,
      ),
    );
  }

  void addBacklogTask(BacklogTaskItem item) {
    state = state.copyWith(
      backlogTasks: [...state.backlogTasks, item],
    );
  }

  void seedSamplePlanning() {
    state = PlanningState.populatedSample();
  }

  void resetToEmpty() {
    state = PlanningState.empty();
  }
}

