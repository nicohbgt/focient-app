import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'onboarding_task.dart';
import 'workspace_category.dart';

/// Lifecycle state for onboarding data
enum OnboardingLifecycle {
  initial, // Empty state: no data configured
  editing, // User actively modifying state
  submitting, // Async API persistence in progress
  completed, // Onboarding fully synced
  error, // Validation or network error
}

/// Immutable Data-Driven State for the Complete Onboarding Journey
@immutable
class OnboardingState {
  final OnboardingLifecycle lifecycle;
  final int currentStep; // 1 to 5

  // Step 1: Workspace Identity
  final String username;
  final String? selectedOccupancy;
  final List<WorkspaceCategory> categories;

  // Step 2: Working Rhythm
  final String? selectedRhythm;
  final String? selectedStyle;

  // Step 3: Time Allocation
  final String? startHour24;
  final String? endHour24;
  final int restMinutesPerTask;

  // Step 4: Tasks Added
  final List<OnboardingTask> tasks;

  // Step 5: Plan & Review
  final bool notificationsEnabled;
  final String? errorMessage;

  const OnboardingState({
    this.lifecycle = OnboardingLifecycle.initial,
    this.currentStep = 1,
    this.username = '',
    this.selectedOccupancy,
    this.categories = const [],
    this.selectedRhythm,
    this.selectedStyle,
    this.startHour24,
    this.endHour24,
    this.restMinutesPerTask = 0,
    this.tasks = const [],
    this.notificationsEnabled = false,
    this.errorMessage,
  });

  /// Factory for creating an explicitly empty starting state
  factory OnboardingState.empty() => const OnboardingState();

  // --- Dynamic Lifecycle Computations ---

  /// Calculates total available daily working minutes from configured start and end hours
  int get activeCapacityMinutes {
    if (startHour24 == null || endHour24 == null) {
      return 480; // Standard 8 hours fallback
    }
    try {
      final startParts = startHour24!.split(':');
      final endParts = endHour24!.split(':');
      final startMin = int.parse(startParts[0]) * 60 + int.parse(startParts[1]);
      final endMin = int.parse(endParts[0]) * 60 + int.parse(endParts[1]);
      final diff = endMin - startMin;
      return diff > 0 ? diff : 480;
    } catch (_) {
      return 480;
    }
  }

  /// Total focus duration in minutes from all tasks added
  int get totalTaskMinutes =>
      tasks.fold<int>(0, (sum, t) => sum + t.durationMinutes);

  /// Total rest buffer duration in minutes from all tasks added
  int get totalRestMinutes =>
      tasks.fold<int>(0, (sum, t) => sum + t.restMinutes);

  /// Total allocated time (tasks + rest)
  int get totalAllocatedMinutes => totalTaskMinutes + totalRestMinutes;

  /// Real-time calculated workload percentage
  int get workloadPercentage {
    final cap = activeCapacityMinutes;
    if (cap <= 0 || tasks.isEmpty) return 0;
    final pct = ((totalAllocatedMinutes / cap) * 100).round();
    return pct.clamp(0, 100);
  }

  /// Real-time calculated workload status badge label
  String get workloadStatus {
    final pct = workloadPercentage;
    if (tasks.isEmpty || pct == 0) return 'Empty';
    if (pct < 50) return 'Light';
    if (pct <= 80) return 'Optimal';
    if (pct <= 95) return 'Near Capacity';
    return 'Overload';
  }

  // --- Step Validation Helpers ---
  bool get isStep1Valid =>
      username.trim().isNotEmpty && categories.isNotEmpty;
  bool get isStep2Valid => selectedRhythm != null && selectedStyle != null;
  bool get isStep3Valid => startHour24 != null && endHour24 != null;
  bool get isStep4Valid => tasks.isNotEmpty;

  OnboardingState copyWith({
    OnboardingLifecycle? lifecycle,
    int? currentStep,
    String? username,
    String? selectedOccupancy,
    bool clearOccupancy = false,
    List<WorkspaceCategory>? categories,
    String? selectedRhythm,
    String? selectedStyle,
    String? startHour24,
    String? endHour24,
    int? restMinutesPerTask,
    List<OnboardingTask>? tasks,
    bool? notificationsEnabled,
    String? errorMessage,
    bool clearError = false,
  }) {
    return OnboardingState(
      lifecycle: lifecycle ?? this.lifecycle,
      currentStep: currentStep ?? this.currentStep,
      username: username ?? this.username,
      selectedOccupancy:
          clearOccupancy ? null : (selectedOccupancy ?? this.selectedOccupancy),
      categories: categories ?? this.categories,
      selectedRhythm: selectedRhythm ?? this.selectedRhythm,
      selectedStyle: selectedStyle ?? this.selectedStyle,
      startHour24: startHour24 ?? this.startHour24,
      endHour24: endHour24 ?? this.endHour24,
      restMinutesPerTask: restMinutesPerTask ?? this.restMinutesPerTask,
      tasks: tasks ?? this.tasks,
      notificationsEnabled:
          notificationsEnabled ?? this.notificationsEnabled,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

/// StateNotifier driving the lifecycle of the Onboarding Flow
class OnboardingNotifier extends StateNotifier<OnboardingState> {
  OnboardingNotifier() : super(OnboardingState.empty());

  /// Resets back to clean empty state
  void resetToEmptyState() {
    state = OnboardingState.empty();
  }

  /// Sets current active onboarding step (1..5)
  void setStep(int step) {
    state = state.copyWith(
      currentStep: step.clamp(1, 5),
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 1: Update Username
  void setUsername(String username) {
    state = state.copyWith(
      username: username,
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 1: Select or toggle occupancy chip
  void selectOccupancy(String? occupancy) {
    if (occupancy == null || state.selectedOccupancy == occupancy) {
      // Deselect
      state = state.copyWith(
        clearOccupancy: true,
        lifecycle: OnboardingLifecycle.editing,
      );
      return;
    }

    final template = kOccupancyCategoryTemplates[occupancy];
    state = state.copyWith(
      selectedOccupancy: occupancy,
      categories: template != null ? List.from(template) : state.categories,
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 1: Set full category list directly
  void setCategories(List<WorkspaceCategory> categories) {
    state = state.copyWith(
      categories: List.unmodifiable(categories),
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 1: Add a custom category
  bool addCategory(WorkspaceCategory category) {
    state = state.copyWith(
      categories: [...state.categories, category],
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
    return true;
  }

  /// Step 1: Remove category by index
  void removeCategory(int index) {
    final updated = List<WorkspaceCategory>.from(state.categories);
    if (index >= 0 && index < updated.length) {
      updated.removeAt(index);
      state = state.copyWith(
        categories: updated,
        lifecycle: OnboardingLifecycle.editing,
      );
    }
  }

  /// Step 2: Select daily energy rhythm & style
  void selectRhythmAndStyle(String rhythm, String style) {
    state = state.copyWith(
      selectedRhythm: rhythm,
      selectedStyle: style,
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 3: Update time allocation
  void setTimeAllocation({
    required String startHour24,
    required String endHour24,
    required int restMinutes,
  }) {
    state = state.copyWith(
      startHour24: startHour24,
      endHour24: endHour24,
      restMinutesPerTask: restMinutes,
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 4: Add a new task
  void addTask(OnboardingTask task) {
    state = state.copyWith(
      tasks: [...state.tasks, task],
      lifecycle: OnboardingLifecycle.editing,
      clearError: true,
    );
  }

  /// Step 4: Remove task by index
  void removeTask(int index) {
    final updated = List<OnboardingTask>.from(state.tasks);
    if (index >= 0 && index < updated.length) {
      updated.removeAt(index);
      state = state.copyWith(
        tasks: updated,
        lifecycle: OnboardingLifecycle.editing,
      );
    }
  }

  /// Step 5: Toggle notification permission
  void setNotificationsEnabled(bool enabled) {
    state = state.copyWith(
      notificationsEnabled: enabled,
      lifecycle: OnboardingLifecycle.editing,
    );
  }

  /// Mark onboarding flow submitting
  void setSubmitting(bool isSubmitting) {
    state = state.copyWith(
      lifecycle: isSubmitting
          ? OnboardingLifecycle.submitting
          : OnboardingLifecycle.editing,
    );
  }

  /// Complete onboarding lifecycle
  void markCompleted() {
    state = state.copyWith(lifecycle: OnboardingLifecycle.completed);
  }
}

/// Global provider for the data-driven onboarding state
final onboardingStateProvider =
    StateNotifierProvider<OnboardingNotifier, OnboardingState>((ref) {
  return OnboardingNotifier();
});
