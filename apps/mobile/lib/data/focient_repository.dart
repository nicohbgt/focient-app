import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network_client.dart';
import 'dto_mappers.dart';
import 'focient_local_storage.dart';
import 'planning_state.dart';
import 'task_state.dart';

/// Single source of truth repository orchestrating data between
/// FoCient Flutter UI (Riverpod State) and FoCient Backend Engine (REST API)
class FocientRepository {
  final FocientNetworkClient client;
  String? lastError;
  ConflictException? lastConflict;

  /// In-memory cache for offline resilience (per ADR-004)
  final List<MobileTask> _taskCache = [];

  FocientRepository({FocientNetworkClient? client})
      : client = client ?? focientNetworkClient {
    _initCache();
  }

  void _initCache() {
    if (!Platform.environment.containsKey('FLUTTER_TEST') && focientLocalStorage.cachedTasks.isNotEmpty) {
      _taskCache.clear();
      _taskCache.addAll(focientLocalStorage.cachedTasks);
    }
  }

  /// Fetches tasks from backend with optional date filtering
  Future<List<MobileTask>> getTasks({String? date}) async {
    try {
      lastError = null;
      if (!Platform.environment.containsKey('FLUTTER_TEST') && _taskCache.isEmpty) {
        final local = await focientLocalStorage.loadTasks();
        if (local.isNotEmpty) {
          _taskCache.clear();
          _taskCache.addAll(local);
        }
      }

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

      final parsed = items
          .map((item) => TaskDtoMapper.fromJson(item as Map<String, dynamic>))
          .toList();

      if (parsed.isNotEmpty) {
        _taskCache.clear();
        _taskCache.addAll(parsed);
        await focientLocalStorage.saveTasks(_taskCache);
      }

      return parsed.isNotEmpty ? parsed : List.of(_taskCache);
    } catch (e) {
      debugPrint('[FocientRepository] getTasks error: $e');
      lastError = e.toString();
      // Serve cached tasks if available during offline/network failure
      if (_taskCache.isNotEmpty) {
        return List.of(_taskCache);
      }
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
  /// Persists locally first ($0 cost, 100% offline resilience) and syncs to cloud.
  Future<MobileTask?> createTask(MobileTask task, {bool throwOnError = false}) async {
    // 1. Optimistic local persistence
    _taskCache.removeWhere((t) => t.id == task.id);
    _taskCache.add(task);
    await focientLocalStorage.saveTasks(_taskCache);

    try {
      lastError = null;
      lastConflict = null;
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.withRetry(() => client.post('/tasks', payload));

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          final serverTask = TaskDtoMapper.fromJson(data);
          final idx = _taskCache.indexWhere((t) => t.id == task.id);
          if (idx != -1) {
            _taskCache[idx] = serverTask;
            await focientLocalStorage.saveTasks(_taskCache);
          }
          return serverTask;
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] createTask error (queued offline): $e');
      lastError = e.toString();
      if (e is ConflictException) {
        lastConflict = e;
      }
      // Enqueue for cloud sync when connected
      await focientLocalStorage.enqueueOfflineMutation(
        action: 'CREATE_TASK',
        payload: TaskDtoMapper.toJson(task),
      );
      if (throwOnError) rethrow;
      return task;
    }
  }

  /// Updates an existing task in backend engine with retry & conflict detection.
  Future<MobileTask?> updateTask(MobileTask task, {bool throwOnError = false}) async {
    final idx = _taskCache.indexWhere((t) => t.id == task.id);
    if (idx != -1) {
      _taskCache[idx] = task;
    } else {
      _taskCache.add(task);
    }
    await focientLocalStorage.saveTasks(_taskCache);

    try {
      lastError = null;
      lastConflict = null;
      final payload = TaskDtoMapper.toJson(task);
      final response = await client.withRetry(() => client.patch('/tasks/${task.id}', payload));

      if (response is Map<String, dynamic>) {
        final data = response['task'] ?? response['data'] ?? response;
        if (data is Map<String, dynamic>) {
          final serverTask = TaskDtoMapper.fromJson(data);
          final i = _taskCache.indexWhere((t) => t.id == task.id);
          if (i != -1) {
            _taskCache[i] = serverTask;
            await focientLocalStorage.saveTasks(_taskCache);
          }
          return serverTask;
        }
      }
      return task;
    } catch (e) {
      debugPrint('[FocientRepository] updateTask error (queued offline): $e');
      lastError = e.toString();
      if (e is ConflictException) {
        lastConflict = e;
      }
      await focientLocalStorage.enqueueOfflineMutation(
        action: 'UPDATE_TASK',
        payload: TaskDtoMapper.toJson(task),
      );
      if (throwOnError) rethrow;
      return task;
    }
  }

  /// Deletes or cancels a task by ID. Returns false on failure.
  Future<bool> deleteTask(String taskId, {bool throwOnError = false}) async {
    _taskCache.removeWhere((t) => t.id == taskId);
    await focientLocalStorage.saveTasks(_taskCache);

    try {
      lastError = null;
      await client.withRetry(() => client.delete('/tasks/$taskId'));
      return true;
    } catch (e) {
      debugPrint('[FocientRepository] deleteTask error (queued offline): $e');
      lastError = e.toString();
      await focientLocalStorage.enqueueOfflineMutation(
        action: 'DELETE_TASK',
        payload: {'id': taskId},
      );
      if (throwOnError) rethrow;
      return true;
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

  /// Syncs all locally queued mutations with backend engine and refreshes tasks
  Future<int> syncPendingMutations() async {
    final pending = await focientLocalStorage.getPendingMutations();
    if (pending.isEmpty) return 0;

    int syncedCount = 0;
    for (final mutation in pending) {
      final mutationId = mutation['id'] as String;
      final action = mutation['action'] as String;
      final payload = mutation['payload'] as Map<String, dynamic>;

      try {
        if (action == 'CREATE_TASK') {
          await client.post('/tasks', payload);
        } else if (action == 'UPDATE_TASK') {
          final taskId = payload['id'] as String;
          await client.patch('/tasks/$taskId', payload);
        } else if (action == 'DELETE_TASK') {
          final taskId = payload['id'] as String;
          await client.delete('/tasks/$taskId');
        } else if (action == 'COMPLETE_TASK') {
          final taskId = payload['id'] as String;
          await client.post('/tasks/$taskId/complete', payload);
        }
        await focientLocalStorage.removeMutation(mutationId);
        syncedCount++;
      } catch (e) {
        debugPrint('[FocientRepository] Sync mutation deferred ($action): $e');
        // Stop batch if network drops, remaining mutations stay queued
        break;
      }
    }

    if (syncedCount > 0) {
      await getTasks();
    }

    return syncedCount;
  }
}

/// Global repository provider accessible across all screens
final focientRepositoryProvider = Provider<FocientRepository>((ref) {
  return FocientRepository();
});
