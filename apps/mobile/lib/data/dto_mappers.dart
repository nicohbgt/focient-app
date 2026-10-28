import 'package:flutter/material.dart';
import 'task_state.dart';

class TaskDtoMapper {
  static final Map<String, Color> _defaultColors = {
    'Strategic': const Color(0xFF7C3AED),
    'Execution': const Color(0xFF0284C7),
    'Meeting': const Color(0xFFD97706),
    'Operation': const Color(0xFF0D9488),
    'Personal': const Color(0xFF059669),
  };

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

    EnergyLevelEnum energyLevel = EnergyLevelEnum.medium;
    if (json['energyLevel'] == 'HIGH') {
      energyLevel = EnergyLevelEnum.high;
    } else if (json['energyLevel'] == 'LOW') {
      energyLevel = EnergyLevelEnum.low;
    }

    final catName = json['categoryName'] as String? ??
        json['category'] as String? ??
        'Strategic';

    Color catColor = _defaultColors[catName] ?? const Color(0xFF7C3AED);
    if (json['categoryColor'] != null) {
      final hex = json['categoryColor'].toString().replaceAll('#', '');
      if (hex.length == 6) {
        catColor = Color(int.parse('FF$hex', radix: 16));
      }
    }

    return MobileTask(
      id: json['id'] as String? ?? 'task-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] as String? ?? '',
      notes: json['notes'] as String?,
      durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 30,
      priority: priority,
      energyLevel: energyLevel,
      status: status,
      scheduledStart: json['scheduledStart'] != null
          ? DateTime.tryParse(json['scheduledStart'] as String)
          : (json['startTime'] != null ? DateTime.tryParse(json['startTime'] as String) : null),
      categoryName: catName,
      categoryColor: catColor,
      restMinutes: (json['restMinutes'] as num?)?.toInt() ?? 10,
      dateDisplay: json['dateDisplay'] as String? ??
          (json['targetDate'] != null ? json['targetDate'].toString().split('T')[0] : 'October, 3rd 2026'),
      startHourDisplay: json['startHourDisplay'] as String? ?? '10:00',
      focusType: json['focusType'] as String? ??
          (energyLevel == EnergyLevelEnum.high ? 'Deep Focus' : energyLevel == EnergyLevelEnum.low ? 'Light' : 'Medium'),
      isBacklog: json['isBacklog'] as bool? ?? false,
      needRestAfter: json['needRestAfter'] as bool? ?? true,
    );
  }

  static Map<String, dynamic> toJson(MobileTask task) {
    return {
      'id': task.id,
      'title': task.title,
      'notes': task.notes,
      'durationMinutes': task.durationMinutes,
      'priority': task.priority == TaskPriorityEnum.top3
          ? 'TOP_3'
          : (task.priority == TaskPriorityEnum.low ? 'LOW' : 'REGULAR'),
      'energyLevel': task.energyLevel == EnergyLevelEnum.high
          ? 'HIGH'
          : (task.energyLevel == EnergyLevelEnum.low ? 'LOW' : 'MEDIUM'),
      'status': task.status == TaskStatusEnum.completed
          ? 'COMPLETED'
          : (task.status == TaskStatusEnum.inProgress ? 'IN_PROGRESS' : 'TODO'),
      'scheduledStart': task.scheduledStart?.toIso8601String(),
      'category': task.categoryName,
      'categoryName': task.categoryName,
      'categoryColor': '#${task.categoryColor.value.toRadixString(16).substring(2)}',
      'restMinutes': task.restMinutes,
      'dateDisplay': task.dateDisplay,
      'startHourDisplay': task.startHourDisplay,
      'focusType': task.focusType,
      'isBacklog': task.isBacklog,
      'needRestAfter': task.needRestAfter,
    };
  }
}
