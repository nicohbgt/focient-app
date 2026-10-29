import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/onboarding_task.dart';
import '../../../data/task_state.dart';
import '../../../data/workspace_category.dart';
import '../../riverpod_providers.dart';
import '../auth/focient_auth_flow.dart';
import '../auth/focient_forgot_password_screen.dart';
import '../auth/focient_login_screen.dart';
import '../auth/focient_otp_screen.dart';
import '../auth/focient_register_screen.dart';
import '../auth/focient_reset_password_screen.dart';
import '../auth/focient_welcome_screen.dart';
import '../dashboard/focient_dashboard_screen.dart';
import '../plan/focient_today_plan_screen.dart';
import '../task/focient_add_task_screen.dart';
import '../task/focient_task_detail_screen.dart';
import '../task/focient_task_list_screen.dart';
import 'focient_onboarding_review_screen.dart';
import 'focient_onboarding_rhythm_screen.dart';
import 'focient_onboarding_task_screen.dart';
import 'focient_onboarding_time_screen.dart';
import 'focient_onboarding_workspace_screen.dart';

enum InspectorView {
  fullFlow,
  welcome,
  register,
  verificationOtp,
  login,
  forgotPassword,
  resetPassword,
  step1Workspace,
  step2Rhythm,
  step3Time,
  step4Task,
  step5Review,
  dashboard,
  todayPlan,
  taskList,
  addTask,
  taskDetail,
}

/// Developer Screen Inspector Overlay & Prototype Navigation
///
/// Allows instant navigation between all individual screens during UI inspection
/// with toggleable Empty-State vs Populated-State data lifecycles.
class FocientScreenInspector extends ConsumerStatefulWidget {
  const FocientScreenInspector({super.key});

  @override
  ConsumerState<FocientScreenInspector> createState() => _FocientScreenInspectorState();
}

class _FocientScreenInspectorState extends ConsumerState<FocientScreenInspector> {
  InspectorView _activeView = InspectorView.fullFlow;
  bool _isMenuExpanded = false;
  bool _startFromEmptyState = true;

  final List<WorkspaceCategory> _mockCategories = const [
    WorkspaceCategory(
      name: 'Strategic',
      color: Color(0xFF7C3AED),
      colorHex: '#7C3AED',
    ),
    WorkspaceCategory(
      name: 'Execution',
      color: Color(0xFF0284C7),
      colorHex: '#0284C7',
    ),
    WorkspaceCategory(
      name: 'Meeting',
      color: Color(0xFFB45309),
      colorHex: '#B45309',
    ),
  ];

  final List<OnboardingTask> _mockTasks = const [
    OnboardingTask(
      id: 'task-preview-1',
      title: 'Create the Annual OKR',
      categoryName: 'Strategic',
      categoryColor: Color(0xFF7C3AED),
      durationMinutes: 25,
      dateDisplay: 'October, 10th',
      startHourDisplay: '10:00',
      needsRestAfter: true,
      restMinutes: 20,
    ),
  ];

  Widget _buildActiveScreen() {
    switch (_activeView) {
      case InspectorView.fullFlow:
        return const FocientAuthFlow();

      case InspectorView.welcome:
        return FocientWelcomeScreen(
          onGetStarted: () => setState(() => _activeView = InspectorView.register),
          onLogin: () => setState(() => _activeView = InspectorView.login),
        );

      case InspectorView.register:
        return FocientRegisterScreen(
          onBack: () => setState(() => _activeView = InspectorView.welcome),
          onNavigateToLogin: () => setState(() => _activeView = InspectorView.login),
          onRegistrationSuccess: () => setState(() => _activeView = InspectorView.verificationOtp),
        );

      case InspectorView.verificationOtp:
        return FocientOtpScreen(
          onBack: () => setState(() => _activeView = InspectorView.register),
          onVerificationSuccess: () => setState(() => _activeView = InspectorView.step1Workspace),
        );

      case InspectorView.login:
        return FocientLoginScreen(
          onBack: () => setState(() => _activeView = InspectorView.welcome),
          onNavigateToRegister: () => setState(() => _activeView = InspectorView.register),
          onNavigateToForgotPassword: () => setState(() => _activeView = InspectorView.forgotPassword),
          onLoginSuccess: () => setState(() => _activeView = InspectorView.dashboard),
        );

      case InspectorView.forgotPassword:
        return FocientForgotPasswordScreen(
          onBack: () => setState(() => _activeView = InspectorView.login),
          onOtpDispatched: () => setState(() => _activeView = InspectorView.resetPassword),
        );

      case InspectorView.resetPassword:
        return FocientResetPasswordScreen(
          onBack: () => setState(() => _activeView = InspectorView.forgotPassword),
          onPasswordResetComplete: () => setState(() => _activeView = InspectorView.login),
        );

      case InspectorView.step1Workspace:
        return FocientOnboardingWorkspaceScreen(
          initialOccupancy: _startFromEmptyState ? null : 'General',
          initialCategories: _startFromEmptyState ? const [] : _mockCategories,
          onBack: () => setState(() => _activeView = InspectorView.fullFlow),
          onNext: () => setState(() => _activeView = InspectorView.step2Rhythm),
        );

      case InspectorView.step2Rhythm:
        return FocientOnboardingRhythmScreen(
          initialRhythm: _startFromEmptyState ? null : 'Early Bird',
          initialStyle: _startFromEmptyState ? null : 'Structured',
          onBack: () => setState(() => _activeView = InspectorView.step1Workspace),
          onNext: (_, __) => setState(() => _activeView = InspectorView.step3Time),
        );

      case InspectorView.step3Time:
        return FocientOnboardingTimeScreen(
          initialRestMinutes: _startFromEmptyState ? 0 : 20,
          onBack: () => setState(() => _activeView = InspectorView.step2Rhythm),
          onNext: (_, __, ___) => setState(() => _activeView = InspectorView.step4Task),
        );

      case InspectorView.step4Task:
        return FocientOnboardingTaskScreen(
          categories: _mockCategories,
          defaultRestMinutes: 20,
          initialTasks: _startFromEmptyState ? const [] : _mockTasks,
          onBack: () => setState(() => _activeView = InspectorView.step3Time),
          onNext: (_) => setState(() => _activeView = InspectorView.step5Review),
        );

      case InspectorView.step5Review:
        return FocientOnboardingReviewScreen(
          tasks: _startFromEmptyState ? const [] : _mockTasks,
          onBack: () => setState(() => _activeView = InspectorView.step4Task),
          onStartPlan: () => setState(() => _activeView = InspectorView.dashboard),
        );

      case InspectorView.dashboard:
        return const FocientDashboardScreen();

      case InspectorView.todayPlan:
        return FocientTodayPlanScreen(
          onBack: () => setState(() => _activeView = InspectorView.dashboard),
          onNavigateTab: (idx) {
            if (idx == 0) setState(() => _activeView = InspectorView.dashboard);
            if (idx == 2) setState(() => _activeView = InspectorView.addTask);
            if (idx == 3) setState(() => _activeView = InspectorView.taskList);
          },
        );

      case InspectorView.taskList:
        return FocientTaskListScreen(
          onBack: () => setState(() => _activeView = InspectorView.dashboard),
          onNavigateTab: (idx) {
            if (idx == 0) setState(() => _activeView = InspectorView.dashboard);
            if (idx == 1) setState(() => _activeView = InspectorView.todayPlan);
            if (idx == 2) setState(() => _activeView = InspectorView.addTask);
          },
        );

      case InspectorView.addTask:
        return FocientAddTaskScreen(
          onBack: () => setState(() => _activeView = InspectorView.taskList),
          onTaskSaved: (_) => setState(() => _activeView = InspectorView.taskList),
        );

      case InspectorView.taskDetail:
        final allTasks = ref.watch(taskListProvider);
        final sampleTask = allTasks.firstWhere(
          (t) => t.title.contains('Project Progress'),
          orElse: () => MobileTask(
            id: 't-detail-sample',
            title: 'Project Progress Discussion',
            durationMinutes: 60,
            priority: TaskPriorityEnum.top3,
            energyLevel: EnergyLevelEnum.high,
            categoryName: 'Meeting',
            categoryColor: const Color(0xFFD97706),
            restMinutes: 10,
            dateDisplay: 'October, 3rd 2026',
            startHourDisplay: '11:40',
            focusType: 'Deep Focus',
          ),
        );
        return FocientTaskDetailScreen(
          task: sampleTask,
          onBack: () => setState(() => _activeView = InspectorView.taskList),
          onTaskDeleted: () => setState(() => _activeView = InspectorView.taskList),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Main Active Screen
        _buildActiveScreen(),

        // Backdrop to dismiss menu when tapped outside
        if (_isMenuExpanded)
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => setState(() => _isMenuExpanded = false),
              child: Container(
                color: Colors.black.withValues(alpha: 0.15),
              ),
            ),
          ),

        // Floating Inspector Menu Button
        Positioned(
          top: 48,
          right: 12,
          child: Material(
            color: Colors.transparent,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () {
                    setState(() => _isMenuExpanded = !_isMenuExpanded);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.28),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.dashboard_customize_rounded,
                          size: 14,
                          color: Color(0xFF38BDF8),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _activeView == InspectorView.fullFlow
                              ? 'Prototype Nav'
                              : _viewTitle(_activeView),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          _isMenuExpanded
                              ? Icons.arrow_drop_up_rounded
                              : Icons.arrow_drop_down_rounded,
                          size: 16,
                          color: Colors.white70,
                        ),
                      ],
                    ),
                  ),
                ),

                // Expanded Menu Popover
                if (_isMenuExpanded) ...[
                  const SizedBox(height: 6),
                  Container(
                    width: 260,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.22),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          maxHeight: MediaQuery.of(context).size.height * 0.72,
                        ),
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Empty state toggle
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                                child: Row(
                                  children: [
                                    const Expanded(
                                      child: Text(
                                        'Empty State Mode',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF334155),
                                        ),
                                      ),
                                    ),
                                    Switch.adaptive(
                                      value: _startFromEmptyState,
                                      activeTrackColor: const Color(0xFF2563EB),
                                      onChanged: (val) {
                                        setState(() => _startFromEmptyState = val);
                                        if (val) {
                                          ref.read(taskListProvider.notifier).clear();
                                          ref.read(planningProvider.notifier).resetToEmpty();
                                        } else {
                                          ref.read(taskListProvider.notifier).seedSampleTasks();
                                          ref.read(planningProvider.notifier).seedSamplePlanning();
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              const Divider(height: 1),

                              // Interactive Flow
                              _sectionHeader('COMPLETE INTERACTIVE FLOW'),
                              _menuItem('Full App Journey', InspectorView.fullFlow),

                              // Auth Screens
                              _sectionHeader('AUTHENTICATION SCREENS'),
                              _menuItem('Welcome Screen', InspectorView.welcome),
                              _menuItem('Register Screen', InspectorView.register),
                              _menuItem('Verification (OTP) Screen', InspectorView.verificationOtp),
                              _menuItem('Login Screen', InspectorView.login),
                              _menuItem('Forgot Password Screen', InspectorView.forgotPassword),
                              _menuItem('Reset Password Screen', InspectorView.resetPassword),

                              // Onboarding
                              _sectionHeader('ONBOARDING STEPS'),
                              _menuItem('Step 1: Workspace Setup', InspectorView.step1Workspace),
                              _menuItem('Step 2: Working Rhythm', InspectorView.step2Rhythm),
                              _menuItem('Step 3: Time Allocation', InspectorView.step3Time),
                              _menuItem('Step 4: Enter First Task', InspectorView.step4Task),
                              _menuItem('Step 5: Review & Workload', InspectorView.step5Review),

                              // Core App Features
                              _sectionHeader('CORE APP FEATURES'),
                              _menuItem('Dashboard', InspectorView.dashboard),
                              _menuItem('Today Plan (Rebalancer)', InspectorView.todayPlan),
                              _menuItem('Task List Timeline', InspectorView.taskList),
                              _menuItem('Add New Task', InspectorView.addTask),
                              _menuItem('Task Detail Screen', InspectorView.taskDetail),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 14, right: 14, top: 10, bottom: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
          color: Color(0xFF64748B),
        ),
      ),
    );
  }

  Widget _menuItem(String label, InspectorView view) {
    final isSelected = _activeView == view;
    return InkWell(
      onTap: () {
        setState(() {
          _activeView = view;
          _isMenuExpanded = false;
        });
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        color: isSelected ? const Color(0xFFEFF6FF) : Colors.transparent,
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.circle_outlined,
              size: 14,
              color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF1E293B),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _viewTitle(InspectorView view) {
    switch (view) {
      case InspectorView.fullFlow:
        return 'Full Flow';
      case InspectorView.welcome:
        return 'Welcome';
      case InspectorView.register:
        return 'Register';
      case InspectorView.verificationOtp:
        return 'OTP';
      case InspectorView.login:
        return 'Login';
      case InspectorView.forgotPassword:
        return 'Forgot Pass';
      case InspectorView.resetPassword:
        return 'Reset Pass';
      case InspectorView.step1Workspace:
        return 'Step 1';
      case InspectorView.step2Rhythm:
        return 'Step 2';
      case InspectorView.step3Time:
        return 'Step 3';
      case InspectorView.step4Task:
        return 'Step 4';
      case InspectorView.step5Review:
        return 'Step 5';
      case InspectorView.dashboard:
        return 'Dashboard';
      case InspectorView.todayPlan:
        return 'Today Plan';
      case InspectorView.taskList:
        return 'Task List';
      case InspectorView.addTask:
        return 'Add Task';
      case InspectorView.taskDetail:
        return 'Task Detail';
    }
  }
}
