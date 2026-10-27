import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/auth_state.dart';
import '../../../data/workspace_category.dart';
import 'focient_onboarding_rhythm_screen.dart';
import 'focient_onboarding_time_screen.dart';
import 'focient_onboarding_workspace_screen.dart';

/// FoCient Multi-Phase Onboarding Flow Coordinator
///
/// Coordinates the 5-step onboarding journey:
/// - Step 1: Personalize your Workspace (Username, Occupancy, Task Categories)
/// - Step 2: Working Rhythm Setup (Daily Energy Rhythm & Scheduling Style)
/// - Step 3: Time Allocation Setup (Daily Active Hour & Rest Time per Task)
/// - (Step 4 & 5: Capacity limits and confirmation)
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

  // Step 1 state
  String _username = '';
  String _occupancy = 'General';
  List<WorkspaceCategory> _categories = [];

  // Step 2 state
  String _energyRhythm = 'Early Bird';
  String _schedulingStyle = 'Structured';

  // Step 3 state
  String _startHour24 = '09:00';
  String _endHour24 = '17:00';
  int _restMinutes = 20;

  @override
  void initState() {
    super.initState();
    _currentStep = widget.initialStep;
  }

  Future<void> _finalizeOnboarding() async {
    final success = await ref
        .read(authProvider.notifier)
        .completeWorkspaceOnboarding(
          username: _username.isNotEmpty ? _username : 'User',
          occupancy: _occupancy,
          categories: _categories.isNotEmpty
              ? _categories
              : (kOccupancyCategoryTemplates[_occupancy] ??
                  kOccupancyCategoryTemplates['General']!),
          energyRhythm: _energyRhythm,
          schedulingStyle: _schedulingStyle,
          startWorkTime: _startHour24,
          endWorkTime: _endHour24,
          restTimeMinutesPerTask: _restMinutes,
        );

    if (success && mounted) {
      widget.onCompleted?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    switch (_currentStep) {
      case 1:
        return FocientOnboardingWorkspaceScreen(
          onBack: widget.onCancel ??
              () {
                ref.read(authProvider.notifier).logout();
              },
          onWorkspaceConfigured: (username, occupancy, categories) {
            setState(() {
              _username = username;
              _occupancy = occupancy;
              _categories = categories;
              _currentStep = 2;
            });
          },
        );

      case 2:
        return FocientOnboardingRhythmScreen(
          initialRhythm: _energyRhythm,
          initialStyle: _schedulingStyle,
          onBack: () {
            setState(() => _currentStep = 1);
          },
          onNext: (rhythm, style) {
            setState(() {
              _energyRhythm = rhythm;
              _schedulingStyle = style;
              _currentStep = 3;
            });
          },
        );

      case 3:
      default:
        return FocientOnboardingTimeScreen(
          initialRestMinutes: _restMinutes,
          onBack: () {
            setState(() => _currentStep = 2);
          },
          onNext: (start24, end24, restMinutes) {
            _startHour24 = start24;
            _endHour24 = end24;
            _restMinutes = restMinutes;
            _finalizeOnboarding();
          },
        );
    }
  }
}
