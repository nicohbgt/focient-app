import 'package:flutter/material.dart';

class OnboardingTask {
  final String id;
  final String title;
  final String categoryName;
  final Color categoryColor;
  final int durationMinutes;
  final String focusType;
  final String dateDisplay;
  final String startHourDisplay;
  final bool isBacklog;
  final bool needsRestAfter;
  final int restMinutes;

  const OnboardingTask({
    required this.id,
    required this.title,
    required this.categoryName,
    required this.categoryColor,
    required this.durationMinutes,
    this.focusType = 'Deep Focus',
    this.dateDisplay = 'October, 10th',
    this.startHourDisplay = '10:00',
    this.isBacklog = false,
    this.needsRestAfter = true,
    this.restMinutes = 20,
  });

  String get formattedTimestamp => '$dateDisplay - $startHourDisplay';

  OnboardingTask copyWith({
    String? id,
    String? title,
    String? categoryName,
    Color? categoryColor,
    int? durationMinutes,
    String? focusType,
    String? dateDisplay,
    String? startHourDisplay,
    bool? isBacklog,
    bool? needsRestAfter,
    int? restMinutes,
  }) {
    return OnboardingTask(
      id: id ?? this.id,
      title: title ?? this.title,
      categoryName: categoryName ?? this.categoryName,
      categoryColor: categoryColor ?? this.categoryColor,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      focusType: focusType ?? this.focusType,
      dateDisplay: dateDisplay ?? this.dateDisplay,
      startHourDisplay: startHourDisplay ?? this.startHourDisplay,
      isBacklog: isBacklog ?? this.isBacklog,
      needsRestAfter: needsRestAfter ?? this.needsRestAfter,
      restMinutes: restMinutes ?? this.restMinutes,
    );
  }
}
