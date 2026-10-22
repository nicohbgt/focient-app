import 'package:flutter/foundation.dart';

enum TaskStatusEnum { todo, inProgress, completed }
enum TaskPriorityEnum { top3, normal, low }

class MobileTask {
  final String id;
  final String title;
  final String? notes;
  final int durationMinutes;
  final TaskPriorityEnum priority;
  final TaskStatusEnum status;
  final DateTime? scheduledStart;

  MobileTask({
    required this.id,
    required this.title,
    this.notes,
    required this.durationMinutes,
    this.priority = TaskPriorityEnum.normal,
    this.status = TaskStatusEnum.todo,
    this.scheduledStart,
  });

  bool get isCompleted => status == TaskStatusEnum.completed;

  MobileTask copyWith({
    String? title,
    String? notes,
    int? durationMinutes,
    TaskPriorityEnum? priority,
    TaskStatusEnum? status,
    DateTime? scheduledStart,
  }) {
    return MobileTask(
      id: id,
      title: title ?? this.title,
      notes: notes ?? this.notes,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      scheduledStart: scheduledStart ?? this.scheduledStart,
    );
  }
}

/// FoCient Mobile Task & Capacity State Manager
class TaskState extends ChangeNotifier {
  final List<MobileTask> _tasks = [];
  int _dailyCapacityMinutes = 480;

  List<MobileTask> get tasks => List.unmodifiable(_tasks);

  List<MobileTask> get top3Tasks =>
      _tasks.where((t) => !t.isCompleted && t.priority == TaskPriorityEnum.top3).take(3).toList();

  int get allocatedMinutes =>
      _tasks.where((t) => !t.isCompleted).fold(0, (sum, t) => sum + t.durationMinutes);

  int get dailyCapacityMinutes => _dailyCapacityMinutes;

  int get capacityPercentage =>
      ((allocatedMinutes / _dailyCapacityMinutes.clamp(1, 1440)) * 100).round();

  bool get isOverloaded => capacityPercentage > 90;

  void addTask(MobileTask task) {
    _tasks.add(task);
    notifyListeners();
  }

  void toggleTaskComplete(String taskId, bool isCompleted) {
    final index = _tasks.indexWhere((t) => t.id === taskId);
    if (index != -1) {
      _tasks[index] = _tasks[index].copyWith(
        status: isCompleted ? TaskStatusEnum.completed : TaskStatusEnum.todo,
      );
      notifyListeners();
    }
  }

  void setDailyCapacity(int minutes) {
    _dailyCapacityMinutes = minutes;
    notifyListeners();
  }
}
