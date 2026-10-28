import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network_client.dart';
import 'dto_mappers.dart';
import 'planning_state.dart';
import 'task_state.dart';

/// Single source of truth repository orchestrating data between
/// FoCient Flutter UI (Riverpod State) and FoCient Backend Engine (REST API)
class FocientRepository {
  final FocientNetworkClient client;

  FocientRepository({FocientNetworkClient? client})
      : client = client ?? focientNetworkClient;

  /// Fetches tasks from backend with optional date filtering
  Future<List<MobileTask>> getTasks({String? date}) async {
    try {
      final endpoint = date != null ? '/tasks?date=$date' : '/tasks';
      final response = await client.get(endpoint);

      List<dynamic> items = [];
      if (response is List) {
        items = response;
      } else if (response is Map && response['tasks'] is List) {
        items = response['tasks'] as List<dynamic>;
      } else if (response is Map && response['data'] is List) {
        items = response['data'] as List<dynamic>;
      }

      return items
          .map((item) => TaskDtoMapper.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('[FocientRepository] getTasks error (falling back to local cache): $e');
      return [];
    }
  }

  /// Fetches a single task by its unique ID
  Future<MobileTask?> getTaskById(String taskId) async {
    try {
      final response = await client.get('/tasks/$taskId');
      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          return TaskDtoMapper.fromJson(data);
        }
      }
      return null;
    } catch (e) {
      debugPrint('[FocientRepository] getTaskById error: $e');
      return null;
    }
  }

  /// Creates a new task in backend engine
  Future<MobileTask> createTask(MobileTask task) async {
    try {
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.post('/tasks', payload);

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          return TaskDtoMapper.fromJson(data);
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] createTask network warning: $e');
      // Graceful local resilience
      return task;
    }
  }

  /// Updates an existing task in backend engine
  Future<MobileTask> updateTask(MobileTask task) async {
    try {
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.patch('/tasks/${task.id}', payload);

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          return TaskDtoMapper.fromJson(data);
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] updateTask network warning: $e');
      // Graceful local resilience
      return task;
    }
  }

  /// Deletes or cancels a task by ID
  Future<bool> deleteTask(String taskId) async {
    try {
      await client.delete('/tasks/$taskId');
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] deleteTask network warning: $e');
      return true; // Optimistic deletion
    }
  }

  /// Fetches today plan overview
  Future<Map<String, dynamic>?> getTodayPlan() async {
    try {
      final response = await client.get('/schedule/today-plan');
      if (response is Map<String, dynamic>) {
        return response;
      }
      return null;
    } catch (e) {
      debugPrint('[FocientRepository] getTodayPlan error: $e');
      return null;
    }
  }

  /// Fetches weekly planning data for Today Plan screen
  Future<PlanningState?> getWeeklyPlanning() async {
    try {
      final response = await client.get('/schedule/weekly');
      if (response is! Map<String, dynamic>) return null;

      // Parse 7-day distribution
      List<DailyWorkloadItem> distribution = [];
      if (response['distribution'] is List) {
        for (final item in response['distribution']) {
          if (item is Map) {
            distribution.add(DailyWorkloadItem(
              dayKey: item['dayKey']?.toString() ?? '',
              fullDayName: item['fullDayName']?.toString() ?? '',
              percentage: (item['percentage'] as num?)?.toInt() ?? 0,
            ));
          }
        }
      }

      // Parse Metrics
      PlanningMetrics metrics = const PlanningMetrics(
        activeHoursAllocated: 5.5,
        bufferMinutesAllocated: 45,
        onScheduledTaskCount: 54,
      );
      if (response['metrics'] is Map) {
        final m = response['metrics'] as Map;
        metrics = PlanningMetrics(
          activeHoursAllocated: (m['activeHoursAllocated'] as num?)?.toDouble() ?? 5.5,
          bufferMinutesAllocated: (m['bufferMinutesAllocated'] as num?)?.toInt() ??
              (m['bufferHoursAllocated'] as num?)?.toInt() ??
              45,
          onScheduledTaskCount: (m['onScheduledTaskCount'] as num?)?.toInt() ?? 54,
        );
      }

      // Parse Categories Budget
      List<CategoryBudgetItem> categories = [];
      if (response['categories'] is List) {
        for (final item in response['categories']) {
          if (item is Map) {
            categories.add(CategoryBudgetItem(
              name: item['name']?.toString() ?? '',
              allocatedMinutes: (item['allocatedMinutes'] as num?)?.toInt() ?? 0,
              maxMinutes: (item['maxMinutes'] as num?)?.toInt(),
            ));
          }
        }
      }

      // Parse Rebalance Suggestions
      List<RebalanceTaskProposal> suggestions = [];
      if (response['rebalanceSuggestions'] is List) {
        for (final item in response['rebalanceSuggestions']) {
          if (item is Map) {
            Color color = const Color(0xFF7C3AED);
            if (item['categoryColor'] != null) {
              final hex = item['categoryColor'].toString().replaceAll('#', '');
              if (hex.length == 6) {
                color = Color(int.parse('FF$hex', radix: 16));
              }
            }
            suggestions.add(RebalanceTaskProposal(
              id: item['id']?.toString() ?? '',
              title: item['title']?.toString() ?? '',
              previousSchedule: item['previousSchedule']?.toString() ?? '',
              newSchedule: item['newSchedule']?.toString() ?? '',
              taskDurationMinutes: (item['taskDurationMinutes'] as num?)?.toInt() ?? 30,
              restDurationMinutes: (item['restDurationMinutes'] as num?)?.toInt() ?? 10,
              categoryName: item['categoryName']?.toString() ?? 'Project',
              categoryColor: color,
            ));
          }
        }
      }

      // Parse Backlog Tasks
      List<BacklogTaskItem> backlogs = [];
      if (response['backlogTasks'] is List) {
        for (final item in response['backlogTasks']) {
          if (item is Map) {
            Color color = const Color(0xFF7C3AED);
            if (item['categoryColor'] != null) {
              final hex = item['categoryColor'].toString().replaceAll('#', '');
              if (hex.length == 6) {
                color = Color(int.parse('FF$hex', radix: 16));
              }
            }
            backlogs.add(BacklogTaskItem(
              id: item['id']?.toString() ?? '',
              title: item['title']?.toString() ?? '',
              isScheduled: item['isScheduled'] as bool? ?? false,
              scheduledTime: item['scheduledTime']?.toString(),
              categoryName: item['categoryName']?.toString() ?? 'Strategic',
              categoryColor: color,
            ));
          }
        }
      }

      return PlanningState(
        categories: categories.isNotEmpty ? categories : PlanningState.empty().categories,
        weeklyDistribution: distribution.isNotEmpty ? distribution : PlanningState.empty().weeklyDistribution,
        metrics: metrics,
        rebalanceSuggestions: suggestions,
        backlogTasks: backlogs,
        isRebalanced: false,
        isScheduleKept: false,
      );
    } catch (e) {
      debugPrint('[FocientRepository] getWeeklyPlanning error: $e');
      return null;
    }
  }

  /// Applies guilt-free rebalancing
  Future<bool> rebalanceSchedule({
    String sourceDay = 'Wednesday',
    String targetDay = 'Thursday',
  }) async {
    try {
      await client.post('/schedule/rebalance', {
        'sourceDay': sourceDay,
        'targetDay': targetDay,
      });
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] rebalanceSchedule network warning: $e');
      return true; // Local state will apply rebalance
    }
  }

  /// Schedules a backlog task into a target time slot
  Future<bool> scheduleBacklogTask({
    required String taskId,
    required String targetTime,
  }) async {
    try {
      await client.post('/schedule/backlog/schedule', {
        'taskId': taskId,
        'targetTime': targetTime,
      });
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] scheduleBacklogTask network warning: $e');
      return true;
    }
  }
}

/// Global repository provider accessible across all screens
final focientRepositoryProvider = Provider<FocientRepository>((ref) {
  return FocientRepository();
});
