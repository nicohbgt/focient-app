import 'task_state.dart';

class TaskDtoMapper {
  static MobileTask fromJson(Map<String, dynamic> json) {
    TaskPriorityEnum priority = TaskPriorityEnum.normal;
    if (json['priority'] == 'TOP_3') {
      priority = TaskPriorityEnum.top3;
    } else if (json['priority'] == 'LOW') {
      priority = TaskPriorityEnum.low;
    }

    TaskStatusEnum status = TaskStatusEnum.todo;
    if (json['status'] == 'IN_PROGRESS') {
      status = TaskStatusEnum.inProgress;
    } else if (json['status'] == 'COMPLETED') {
      status = TaskStatusEnum.completed;
    }

    return MobileTask(
      id: json['id'] as String,
      title: json['title'] as String,
      notes: json['notes'] as String?,
      durationMinutes: json['durationMinutes'] as int? ?? 30,
      priority: priority,
      status: status,
      scheduledStart: json['scheduledStart'] != null
          ? DateTime.tryParse(json['scheduledStart'] as String)
          : null,
    );
  }

  static Map<String, dynamic> toJson(MobileTask task) {
    return {
      'id': task.id,
      'title': task.title,
      'notes': task.notes,
      'durationMinutes': task.durationMinutes,
      'priority': task.priority == TaskPriorityEnum.top3 ? 'TOP_3' : 'NORMAL',
      'status': task.status == TaskStatusEnum.completed ? 'COMPLETED' : 'TODO',
      'scheduledStart': task.scheduledStart?.toIso8601String(),
    };
  }
}
