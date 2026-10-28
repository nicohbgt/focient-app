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
  String? lastError;
  ConflictException? lastConflict;

  FocientRepository({FocientNetworkClient? client})
      : client = client ?? focientNetworkClient;

  /// Fetches tasks from backend with optional date filtering
  Future<List<MobileTask>> getTasks({String? date}) async {
    try {
      lastError = null;
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
      debugPrint('[FocientRepository] getTasks error: $e');
      lastError = e.toString();
      return [];
    }
  }

  /// Fetches a single task by its unique ID
  Future<MobileTask?> getTaskById(String taskId) async {
    try {
      lastError = null;
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
      lastError = e.toString();
      return null;
    }
  }

  /// Creates a new task in backend engine with retry & conflict detection.
  /// Returns the saved task if successful, or null on failure (does NOT falsely claim success).
  Future<MobileTask?> createTask(MobileTask task, {bool throwOnError = false}) async {
    try {
      lastError = null;
      lastConflict = null;
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.withRetry(() => client.post('/tasks', payload));

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          return TaskDtoMapper.fromJson(data);
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] createTask error: $e');
      lastError = e.toString();
      if (e is ConflictException) {
        lastConflict = e;
      }
      if (throwOnError) rethrow;
      return null;
    }
  }

  /// Updates an existing task in backend engine with retry & conflict detection.
  Future<MobileTask?> updateTask(MobileTask task, {bool throwOnError = false}) async {
    try {
      lastError = null;
      lastConflict = null;
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.withRetry(() => client.patch('/tasks/${task.id}', payload));

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          return TaskDtoMapper.fromJson(data);
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] updateTask error: $e');
      lastError = e.toString();
      if (e is ConflictException) {
        lastConflict = e;
      }
      if (throwOnError) rethrow;
      return null;
    }
  }

  /// Deletes or cancels a task by ID. Returns false on failure.
  Future<bool> deleteTask(String taskId, {bool throwOnError = false}) async {
    try {
      lastError = null;
      await client.withRetry(() => client.delete('/tasks/$taskId'));
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] deleteTask error: $e');
      lastError = e.toString();
      if (throwOnError) rethrow;
      return false;
    }
  }

  /// Server-backed task completion with reflection & activity logging
  Future<bool> completeTask(
    String taskId, {
    int? actualDuration,
    int? moodRating,
    String? reflectionNotes,
    bool throwOnError = false,
  }) async {
    try {
      lastError = null;
      await client.withRetry(() => client.post('/tasks/$taskId/complete', {
            if (actualDuration != null) 'actualDurationMinutes': actualDuration,
            if (moodRating != null) 'moodRating': moodRating,
            if (reflectionNotes != null) 'reflectionNotes': reflectionNotes,
          }));
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] completeTask error: $e');
      lastError = e.toString();
      if (throwOnError) rethrow;
      return false;
    }
  }

  /// Fetches today plan overview
  Future<Map<String, dynamic>?> getTodayPlan() async {
    try {
      lastError = null;
      final response = await client.get('/schedule/today-plan');
      if (response is Map<String, dynamic>) {
        return response;
      }
      return null;
    } catch (e) {
      debugPrint('[FocientRepository] getTodayPlan error: $e');
      lastError = e.toString();
      return null;
    }
  }

  /// Fetches weekly planning data for Today Plan screen
  Future<PlanningState?> getWeeklyPlanning() async {
    try {
      lastError = null;
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
      lastError = e.toString();
      return null;
    }
  }

  /// Applies guilt-free rebalancing with retry
  Future<bool> rebalanceSchedule({
    String sourceDay = 'Wednesday',
    String targetDay = 'Thursday',
    bool throwOnError = false,
  }) async {
    try {
      lastError = null;
      await client.withRetry(() => client.post('/schedule/rebalance', {
            'sourceDay': sourceDay,
            'targetDay': targetDay,
          }));
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] rebalanceSchedule error: $e');
      lastError = e.toString();
      if (throwOnError) rethrow;
      return false;
    }
  }

  /// Schedules a backlog task into a target time slot with retry
  Future<bool> scheduleBacklogTask({
    required String taskId,
    required String targetTime,
    bool throwOnError = false,
  }) async {
    try {
      lastError = null;
      await client.withRetry(() => client.post('/schedule/backlog/schedule', {
            'taskId': taskId,
            'targetTime': targetTime,
          }));
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] scheduleBacklogTask error: $e');
      lastError = e.toString();
      if (throwOnError) rethrow;
      return false;
    }
  }

  /// Fetches weekly insights summary from /insights/weekly-summary
  Future<Map<String, dynamic>?> getWeeklyInsights() async {
    try {
      lastError = null;
      final res = await client.get('/insights/weekly-summary');
      if (res is Map<String, dynamic>) return res;
      return null;
    } catch (e) {
      debugPrint('[FocientRepository] getWeeklyInsights error: $e');
      lastError = e.toString();
      return null;
    }
  }
}

/// Global repository provider accessible across all screens
final focientRepositoryProvider = Provider<FocientRepository>((ref) {
  return FocientRepository();
});
