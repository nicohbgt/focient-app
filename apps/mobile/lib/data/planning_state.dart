import 'package:flutter/material.dart';

/// Category Budget Model for Task Categories row
class CategoryBudgetItem {
  final String name;
  final int allocatedMinutes;
  final int? maxMinutes;

  const CategoryBudgetItem({
    required this.name,
    required this.allocatedMinutes,
    this.maxMinutes,
  });

  String get formattedAllocation {
    if (allocatedMinutes == 0 && maxMinutes == null) {
      return 'Total: 0h';
    }
    if (maxMinutes == null) {
      final hours = (allocatedMinutes / 60).toStringAsFixed(allocatedMinutes % 60 == 0 ? 0 : 1);
      return 'Total: ${hours}h';
    }

    final allocStr = _formatMinutes(allocatedMinutes);
    final maxStr = _formatMinutes(maxMinutes!);
    return '$allocStr / max $maxStr';
  }

  static String _formatMinutes(int minutes) {
    if (minutes >= 60) {
      final hours = minutes ~/ 60;
      final remainder = minutes % 60;
      if (remainder == 0) return '${hours}h';
      return '${hours}h ${remainder}m';
    }
    return '${minutes}min';
  }

  CategoryBudgetItem copyWith({
    String? name,
    int? allocatedMinutes,
    int? maxMinutes,
  }) {
    return CategoryBudgetItem(
      name: name ?? this.name,
      allocatedMinutes: allocatedMinutes ?? this.allocatedMinutes,
      maxMinutes: maxMinutes ?? this.maxMinutes,
    );
  }
}

/// Day Workload Model for Weekly Workload Distribution Chart
class DailyWorkloadItem {
  final String dayKey; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  final String fullDayName;
  final int percentage;

  const DailyWorkloadItem({
    required this.dayKey,
    required this.fullDayName,
    required this.percentage,
  });

  Color get barColor {
    if (percentage > 80) {
      // Overloaded / Heavy
      return const Color(0xFFD97706);
    } else if (percentage >= 70) {
      // High Productive / Green
      return const Color(0xFF059669);
    } else if (percentage >= 55) {
      // Focus / Optimal Blue
      return const Color(0xFF0284C7);
    } else {
      // Light / Recover Green
      return const Color(0xFF059669);
    }
  }

  DailyWorkloadItem copyWith({
    String? dayKey,
    String? fullDayName,
    int? percentage,
  }) {
    return DailyWorkloadItem(
      dayKey: dayKey ?? this.dayKey,
      fullDayName: fullDayName ?? this.fullDayName,
      percentage: percentage ?? this.percentage,
    );
  }
}

/// Summary metrics below weekly distribution chart
class PlanningMetrics {
  final double activeHoursAllocated;
  final int bufferMinutesAllocated;
  final int onScheduledTaskCount;

  const PlanningMetrics({
    required this.activeHoursAllocated,
    required this.bufferMinutesAllocated,
    required this.onScheduledTaskCount,
  });

  PlanningMetrics copyWith({
    double? activeHoursAllocated,
    int? bufferMinutesAllocated,
    int? onScheduledTaskCount,
  }) {
    return PlanningMetrics(
      activeHoursAllocated: activeHoursAllocated ?? this.activeHoursAllocated,
      bufferMinutesAllocated: bufferMinutesAllocated ?? this.bufferMinutesAllocated,
      onScheduledTaskCount: onScheduledTaskCount ?? this.onScheduledTaskCount,
    );
  }
}

/// Proposal item for Smart Rebalancer
class RebalanceTaskProposal {
  final String id;
  final String title;
  final String previousSchedule;
  final String newSchedule;
  final int taskDurationMinutes;
  final int restDurationMinutes;
  final String categoryName;
  final Color categoryColor;

  const RebalanceTaskProposal({
    required this.id,
    required this.title,
    required this.previousSchedule,
    required this.newSchedule,
    required this.taskDurationMinutes,
    required this.restDurationMinutes,
    required this.categoryName,
    required this.categoryColor,
  });
}

/// Backlog task model (Not yet scheduled)
class BacklogTaskItem {
  final String id;
  final String title;
  final bool isScheduled;
  final String? scheduledTime;
  final String categoryName;
  final Color categoryColor;

  const BacklogTaskItem({
    required this.id,
    required this.title,
    this.isScheduled = false,
    this.scheduledTime,
    required this.categoryName,
    required this.categoryColor,
  });

  BacklogTaskItem copyWith({
    String? id,
    String? title,
    bool? isScheduled,
    String? scheduledTime,
    String? categoryName,
    Color? categoryColor,
  }) {
    return BacklogTaskItem(
      id: id ?? this.id,
      title: title ?? this.title,
      isScheduled: isScheduled ?? this.isScheduled,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      categoryName: categoryName ?? this.categoryName,
      categoryColor: categoryColor ?? this.categoryColor,
    );
  }
}

/// Comprehensive Planning Screen State
class PlanningState {
  final List<CategoryBudgetItem> categories;
  final List<DailyWorkloadItem> weeklyDistribution;
  final PlanningMetrics metrics;
  final List<RebalanceTaskProposal> rebalanceSuggestions;
  final bool isRebalanced;
  final bool isScheduleKept;
  final List<BacklogTaskItem> backlogTasks;
  final bool showDetailedRebalancer;

  const PlanningState({
    required this.categories,
    required this.weeklyDistribution,
    required this.metrics,
    required this.rebalanceSuggestions,
    this.isRebalanced = false,
    this.isScheduleKept = false,
    required this.backlogTasks,
    this.showDetailedRebalancer = false,
  });

  bool get isEmptyState =>
      categories.isEmpty &&
      weeklyDistribution.every((d) => d.percentage == 0) &&
      backlogTasks.isEmpty;

  PlanningState copyWith({
    List<CategoryBudgetItem>? categories,
    List<DailyWorkloadItem>? weeklyDistribution,
    PlanningMetrics? metrics,
    List<RebalanceTaskProposal>? rebalanceSuggestions,
    bool? isRebalanced,
    bool? isScheduleKept,
    List<BacklogTaskItem>? backlogTasks,
    bool? showDetailedRebalancer,
  }) {
    return PlanningState(
      categories: categories ?? this.categories,
      weeklyDistribution: weeklyDistribution ?? this.weeklyDistribution,
      metrics: metrics ?? this.metrics,
      rebalanceSuggestions: rebalanceSuggestions ?? this.rebalanceSuggestions,
      isRebalanced: isRebalanced ?? this.isRebalanced,
      isScheduleKept: isScheduleKept ?? this.isScheduleKept,
      backlogTasks: backlogTasks ?? this.backlogTasks,
      showDetailedRebalancer: showDetailedRebalancer ?? this.showDetailedRebalancer,
    );
  }

  /// Factory for sample populated state matching the Figma mockups
  factory PlanningState.populatedSample() {
    return const PlanningState(
      categories: [
        CategoryBudgetItem(
          name: 'All Task',
          allocatedMinutes: 600, // 10h
          maxMinutes: null,
        ),
        CategoryBudgetItem(
          name: 'Project',
          allocatedMinutes: 120, // 2h
          maxMinutes: 360, // max 6h
        ),
        CategoryBudgetItem(
          name: 'Personal',
          allocatedMinutes: 30, // 30min
          maxMinutes: 120, // max 2h
        ),
        CategoryBudgetItem(
          name: 'Relationship',
          allocatedMinutes: 30, // 30min
          maxMinutes: 90, // max 1.5h
        ),
      ],
      weeklyDistribution: [
        DailyWorkloadItem(dayKey: 'Mon', fullDayName: 'Monday', percentage: 60),
        DailyWorkloadItem(dayKey: 'Tue', fullDayName: 'Tuesday', percentage: 80),
        DailyWorkloadItem(dayKey: 'Wed', fullDayName: 'Wednesday', percentage: 85),
        DailyWorkloadItem(dayKey: 'Thu', fullDayName: 'Thursday', percentage: 56),
        DailyWorkloadItem(dayKey: 'Fri', fullDayName: 'Friday', percentage: 62),
        DailyWorkloadItem(dayKey: 'Sat', fullDayName: 'Saturday', percentage: 88),
        DailyWorkloadItem(dayKey: 'Sun', fullDayName: 'Sunday', percentage: 41),
      ],
      metrics: PlanningMetrics(
        activeHoursAllocated: 5.5,
        bufferMinutesAllocated: 45,
        onScheduledTaskCount: 54,
      ),
      rebalanceSuggestions: [
        RebalanceTaskProposal(
          id: 'reb-1',
          title: 'Implement Typography Token',
          previousSchedule: 'Wednesday, 12:00',
          newSchedule: 'Thursday, 10:30',
          taskDurationMinutes: 45,
          restDurationMinutes: 10,
          categoryName: 'Project',
          categoryColor: Color(0xFF7C3AED),
        ),
        RebalanceTaskProposal(
          id: 'reb-2',
          title: 'Implement Color Palette Token',
          previousSchedule: 'Wednesday, 12:50',
          newSchedule: 'Thursday, 11:20',
          taskDurationMinutes: 45,
          restDurationMinutes: 10,
          categoryName: 'Project',
          categoryColor: Color(0xFF7C3AED),
        ),
      ],
      isRebalanced: false,
      isScheduleKept: false,
      backlogTasks: [
        BacklogTaskItem(
          id: 'bklg-1',
          title: 'Draw and Visualize the Architecture',
          isScheduled: false,
          categoryName: 'Project',
          categoryColor: Color(0xFF7C3AED),
        ),
        BacklogTaskItem(
          id: 'bklg-2',
          title: 'Make the DFD and ERD',
          isScheduled: false,
          categoryName: 'Project',
          categoryColor: Color(0xFF7C3AED),
        ),
      ],
      showDetailedRebalancer: false,
    );
  }

  /// Factory for pure empty state
  factory PlanningState.empty() {
    return const PlanningState(
      categories: [
        CategoryBudgetItem(
          name: 'All Task',
          allocatedMinutes: 0,
          maxMinutes: null,
        ),
        CategoryBudgetItem(
          name: 'Project',
          allocatedMinutes: 0,
          maxMinutes: 360,
        ),
        CategoryBudgetItem(
          name: 'Personal',
          allocatedMinutes: 0,
          maxMinutes: 120,
        ),
        CategoryBudgetItem(
          name: 'Relationship',
          allocatedMinutes: 0,
          maxMinutes: 90,
        ),
      ],
      weeklyDistribution: [
        DailyWorkloadItem(dayKey: 'Mon', fullDayName: 'Monday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Tue', fullDayName: 'Tuesday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Wed', fullDayName: 'Wednesday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Thu', fullDayName: 'Thursday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Fri', fullDayName: 'Friday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Sat', fullDayName: 'Saturday', percentage: 0),
        DailyWorkloadItem(dayKey: 'Sun', fullDayName: 'Sunday', percentage: 0),
      ],
      metrics: PlanningMetrics(
        activeHoursAllocated: 0.0,
        bufferMinutesAllocated: 0,
        onScheduledTaskCount: 0,
      ),
      rebalanceSuggestions: [],
      isRebalanced: false,
      isScheduleKept: false,
      backlogTasks: [],
      showDetailedRebalancer: false,
    );
  }
}
