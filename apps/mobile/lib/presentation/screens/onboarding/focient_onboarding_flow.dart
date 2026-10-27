import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/auth_state.dart';
import '../../../data/onboarding_state.dart';
import '../../../data/task_state.dart';
import '../../../data/workspace_category.dart';
import '../../riverpod_providers.dart';
import 'focient_onboarding_review_screen.dart';
import 'focient_onboarding_rhythm_screen.dart';
import 'focient_onboarding_task_screen.dart';
import 'focient_onboarding_time_screen.dart';
import 'focient_onboarding_workspace_screen.dart';

/// FoCient Multi-Phase Onboarding Flow Coordinator
///
/// Drives the data-driven onboarding journey starting from the clean empty state:
/// - Step 1: Personalize your Workspace (Empty state -> Occupancy template / Custom categories)
/// - Step 2: Working Rhythm Setup (Empty state -> Selected rhythm & scheduling style)
/// - Step 3: Time Allocation Setup (Dynamic active hours & rest buffer)
/// - Step 4: Enter your first task (Empty state -> Real focus tasks)
/// - Step 5: Review & Workload Engine (Real-time dynamic workload calculations)
class FocientOnboardingFlow extends ConsumerStatefulWidget {
  final VoidCallback? onCancel;
  final VoidCallback? onCompleted;
  final int initialStep;

  const FocientOnboardingFlow({
    super.key,
    this.onCancel,
    this.onCompleted,
    this.initialStep = 1,
  });

  @override
  ConsumerState<FocientOnboardingFlow> createState() =>
      _FocientOnboardingFlowState();
}

class _FocientOnboardingFlowState extends ConsumerState<FocientOnboardingFlow> {
  late int _currentStep;

  @override
  void initState() {
    super.initState();
    _currentStep = widget.initialStep;
  }

  Future<void> _finalizeOnboarding() async {
    final state = ref.read(onboardingStateProvider);

    // Clear existing tasks and seed with onboarding focus tasks
    ref.read(taskListProvider.notifier).clear();
    for (final t in state.tasks) {
      ref.read(taskListProvider.notifier).addTask(
            MobileTask(
              id: t.id,
              title: t.title,
              durationMinutes: t.durationMinutes,
              priority: TaskPriorityEnum.top3,
              status: TaskStatusEnum.todo,
              categoryName: t.categoryName,
              categoryColor: t.categoryColor,
              restMinutes: t.restMinutes,
              dateDisplay: t.dateDisplay,
              startHourDisplay: t.startHourDisplay,
              focusType: t.focusType,
            ),
          );
    }

    final success = await ref
        .read(authProvider.notifier)
        .completeWorkspaceOnboarding(
          username: state.username.isNotEmpty ? state.username : 'User',
          occupancy: state.selectedOccupancy ?? 'General',
          categories: state.categories.isNotEmpty
              ? state.categories
              : (kOccupancyCategoryTemplates['General']!),
          energyRhythm: state.selectedRhythm ?? 'Steady Pacer',
          schedulingStyle: state.selectedStyle ?? 'Structured',
          startWorkTime: state.startHour24 ?? '09:00',
          endWorkTime: state.endHour24 ?? '17:00',
          restTimeMinutesPerTask: state.restMinutesPerTask,
        );

    if (success && mounted) {
      ref.read(onboardingStateProvider.notifier).markCompleted();
      widget.onCompleted?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final onboarding = ref.watch(onboardingStateProvider);
    final notifier = ref.read(onboardingStateProvider.notifier);

    final activeCategories = onboarding.categories.isNotEmpty
        ? onboarding.categories
        : (onboarding.selectedOccupancy != null
            ? (kOccupancyCategoryTemplates[onboarding.selectedOccupancy] ?? const [])
            : const <WorkspaceCategory>[]);

    switch (_currentStep) {
      case 1:
        return FocientOnboardingWorkspaceScreen(
          initialUsername: onboarding.username.isNotEmpty ? onboarding.username : null,
          initialOccupancy: onboarding.selectedOccupancy,
          initialCategories: onboarding.categories.isNotEmpty ? onboarding.categories : null,
          onBack: widget.onCancel ??
              () {
                ref.read(authProvider.notifier).logout();
              },
          onWorkspaceConfigured: (username, occupancy, categories) {
            notifier.setUsername(username);
            notifier.selectOccupancy(occupancy);
            for (final cat in categories) {
              if (!onboarding.categories.any((c) => c.name == cat.name)) {
                notifier.addCategory(cat);
              }
            }
            setState(() => _currentStep = 2);
          },
        );

      case 2:
        return FocientOnboardingRhythmScreen(
          initialRhythm: onboarding.selectedRhythm,
          initialStyle: onboarding.selectedStyle,
          onBack: () {
            setState(() => _currentStep = 1);
          },
          onNext: (rhythm, style) {
            notifier.selectRhythmAndStyle(rhythm, style);
            setState(() => _currentStep = 3);
          },
        );

      case 3:
        return FocientOnboardingTimeScreen(
          initialRestMinutes: onboarding.restMinutesPerTask > 0
              ? onboarding.restMinutesPerTask
              : 20,
          onBack: () {
            setState(() => _currentStep = 2);
          },
          onNext: (start24, end24, restMinutes) {
            notifier.setTimeAllocation(
              startHour24: start24,
              endHour24: end24,
              restMinutes: restMinutes,
            );
            setState(() => _currentStep = 4);
          },
        );

      case 4:
        return FocientOnboardingTaskScreen(
          categories: activeCategories,
          defaultRestMinutes: onboarding.restMinutesPerTask > 0
              ? onboarding.restMinutesPerTask
              : 20,
          initialTasks: onboarding.tasks,
          onBack: () {
            setState(() => _currentStep = 3);
          },
          onNext: (tasks) {
            // Replace tasks in state
            for (final t in tasks) {
              if (!onboarding.tasks.any((existing) => existing.id == t.id)) {
                notifier.addTask(t);
              }
            }
            setState(() => _currentStep = 5);
          },
        );

      case 5:
      default:
        return FocientOnboardingReviewScreen(
          tasks: onboarding.tasks,
          workCapacityMinutes: onboarding.activeCapacityMinutes,
          onBack: () {
            setState(() => _currentStep = 4);
          },
          onStartPlan: _finalizeOnboarding,
        );
    }
  }
}
