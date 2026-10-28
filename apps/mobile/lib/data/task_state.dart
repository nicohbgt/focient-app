import 'package:flutter/material.dart';

enum TaskStatusEnum { todo, inProgress, completed }
enum TaskPriorityEnum { top3, normal, low }
enum EnergyLevelEnum { low, medium, high }
enum MotivationTypeEnum { identityDriven, achievementDriven, disciplineDriven, socialDriven }

class MobileTask {
  final String id;
  final String title;
  final String? notes;
  final int durationMinutes;
  final TaskPriorityEnum priority;
  final EnergyLevelEnum energyLevel;
  final TaskStatusEnum status;
  final DateTime? scheduledStart;
  final String categoryName;
  final Color categoryColor;
  final int restMinutes;
  final String dateDisplay;
  final String startHourDisplay;
  final String focusType;
  final bool isBacklog;
  final bool needRestAfter;

  MobileTask({
    required this.id,
    required this.title,
    this.notes,
    required this.durationMinutes,
    this.priority = TaskPriorityEnum.normal,
    this.energyLevel = EnergyLevelEnum.medium,
    this.status = TaskStatusEnum.todo,
    this.scheduledStart,
    this.categoryName = 'Strategic',
    this.categoryColor = const Color(0xFF7C3AED),
    this.restMinutes = 20,
    this.dateDisplay = 'October, 10th',
    this.startHourDisplay = '10:00',
    this.focusType = 'Deep Focus',
    this.isBacklog = false,
    this.needRestAfter = true,
  });

  bool get isCompleted => status == TaskStatusEnum.completed;

  MobileTask copyWith({
    String? title,
    String? notes,
    int? durationMinutes,
    TaskPriorityEnum? priority,
    EnergyLevelEnum? energyLevel,
    TaskStatusEnum? status,
    DateTime? scheduledStart,
    String? categoryName,
    Color? categoryColor,
    int? restMinutes,
    String? dateDisplay,
    String? startHourDisplay,
    String? focusType,
    bool? isBacklog,
    bool? needRestAfter,
  }) {
    return MobileTask(
      id: id,
      title: title ?? this.title,
      notes: notes ?? this.notes,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      priority: priority ?? this.priority,
      energyLevel: energyLevel ?? this.energyLevel,
      status: status ?? this.status,
      scheduledStart: scheduledStart ?? this.scheduledStart,
      categoryName: categoryName ?? this.categoryName,
      categoryColor: categoryColor ?? this.categoryColor,
      restMinutes: restMinutes ?? this.restMinutes,
      dateDisplay: dateDisplay ?? this.dateDisplay,
      startHourDisplay: startHourDisplay ?? this.startHourDisplay,
      focusType: focusType ?? this.focusType,
      isBacklog: isBacklog ?? this.isBacklog,
      needRestAfter: needRestAfter ?? this.needRestAfter,
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
    final index = _tasks.indexWhere((t) => t.id == taskId);
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
