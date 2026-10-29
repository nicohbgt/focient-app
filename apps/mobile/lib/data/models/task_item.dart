import '../task_state.dart';

/// TaskItem data model aligned with FoCient contracts and dynamic state lifecycle.
class TaskItem {
  final String id;
  final String title;
  final int durationMinutes;
  final bool isDeepFocus;
  final bool isCompleted;

  TaskItem({
    required this.id,
    required this.title,
    required this.durationMinutes,
    this.isDeepFocus = false,
    this.isCompleted = false,
  });

  TaskItem copyWith({
    String? id,
    String? title,
    int? durationMinutes,
    bool? isDeepFocus,
    bool? isCompleted,
  }) {
    return TaskItem(
      id: id ?? this.id,
      title: title ?? this.title,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      isDeepFocus: isDeepFocus ?? this.isDeepFocus,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  factory TaskItem.fromJson(Map<String, dynamic> json) {
    return TaskItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      durationMinutes: json['durationMinutes'] as int? ?? 20,
      isDeepFocus: json['isDeepFocus'] as bool? ??
          (json['priority'] == 'TOP_3' || json['energyLevel'] == 'HIGH'),
      isCompleted: json['isCompleted'] as bool? ??
          (json['status'] == 'COMPLETED'),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'durationMinutes': durationMinutes,
      'isDeepFocus': isDeepFocus,
      'isCompleted': isCompleted,
    };
  }

  /// Converts a [MobileTask] into a clean [TaskItem].
  factory TaskItem.fromMobileTask(MobileTask task) {
    final bool deepFocus = task.focusType.toLowerCase().contains('deep') ||
        task.energyLevel == EnergyLevelEnum.high ||
        task.priority == TaskPriorityEnum.top3;
    return TaskItem(
      id: task.id,
      title: task.title,
      durationMinutes: task.durationMinutes,
      isDeepFocus: deepFocus,
      isCompleted: task.isCompleted,
    );
  }

  /// Converts this [TaskItem] to a [MobileTask] representation.
  MobileTask toMobileTask({
    String categoryName = 'Strategic',
    String dateDisplay = 'October, 3rd',
  }) {
    return MobileTask(
      id: id,
      title: title,
      durationMinutes: durationMinutes,
      priority: isDeepFocus ? TaskPriorityEnum.top3 : TaskPriorityEnum.normal,
      energyLevel: isDeepFocus ? EnergyLevelEnum.high : EnergyLevelEnum.medium,
      status: isCompleted ? TaskStatusEnum.completed : TaskStatusEnum.todo,
      categoryName: categoryName,
      dateDisplay: dateDisplay,
      focusType: isDeepFocus ? 'Deep Focus' : 'Task',
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TaskItem &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          durationMinutes == other.durationMinutes &&
          isDeepFocus == other.isDeepFocus &&
          isCompleted == other.isCompleted;

  @override
  int get hashCode =>
      id.hashCode ^
      title.hashCode ^
      durationMinutes.hashCode ^
      isDeepFocus.hashCode ^
      isCompleted.hashCode;

  @override
  String toString() {
    return 'TaskItem(id: $id, title: $title, durationMinutes: $durationMinutes, isDeepFocus: $isDeepFocus, isCompleted: $isCompleted)';
  }
}
