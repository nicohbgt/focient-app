import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/auth_state.dart';
import '../../../data/focient_repository.dart';
import '../../../data/task_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';
import '../../riverpod_providers.dart';
import '../plan/focient_today_plan_screen.dart';
import '../task/focient_add_task_screen.dart';
import '../task/focient_task_list_screen.dart';

/// FoCient Main Dashboard Screen
///
/// Implements:
/// - Top bar: Profile avatar, "Hi, John Doe", dynamic workload bell pill (e.g. 60%), notifications & settings.
/// - Header: "My Dashboard" & "Monday, October 5th 2026".
/// - Card 1: Today Workload (Dynamic percentage meter, Total tasks count, High/Medium/Low priority breakdown).
/// - Card 2: Task Reschedule Suggestion (Empathetic collision detection, mini timeline with overlapping blocks, "Reschedule Later" & "Reschedule Now" CTAs).
/// - Card 3: Top 3 Priority Task (Dynamic top-3 tasks with "Show More" toggle between compact and detailed card styles).
/// - Section 4: Today Timeline (Horizontal timeline with time markers 13:30 - 16:30 and placed task blocks).
/// - Card 5: Quick Add Task (Task name input, Category pills, Duration pills, "Confirm New Task" green button).
/// - Bottom Navigation Bar: Home, Plan, Add Task, Task List, Insights.
class FocientDashboardScreen extends ConsumerStatefulWidget {
  const FocientDashboardScreen({super.key});

  @override
  ConsumerState<FocientDashboardScreen> createState() =>
      _FocientDashboardScreenState();
}

class _FocientDashboardScreenState
    extends ConsumerState<FocientDashboardScreen> {
  int _activeNavIndex = 0;
  bool _showDetailedTop3 = true; // Toggle between compact and detailed view
  bool _rescheduleResolved = false;
  bool _rescheduleDismissed = false;

  // Quick Add Task Form State
  final _taskNameController = TextEditingController();
  String _selectedCategoryName = 'Strategic';
  Color _selectedCategoryColor = const Color(0xFF7C3AED);
  int _selectedDurationMinutes = 20;

  final List<String> _availableCategories = const [
    'Strategic',
    'Execution',
    'Meeting',
    'Operation',
  ];

  final Map<String, Color> _categoryColors = const {
    'Strategic': Color(0xFF7C3AED),
    'Execution': Color(0xFF0284C7),
    'Meeting': Color(0xFFB45309),
    'Operation': Color(0xFF0D9488),
    'Personal': Color(0xFFD97706),
  };

  final List<int> _availableDurations = const [10, 15, 20, 25, 30];
  bool _isLoadingTasks = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTasksFromApi();
    });
  }

  Future<void> _loadTasksFromApi() async {
    if (!mounted) return;
    setState(() {
      _isLoadingTasks = true;
      _errorMessage = null;
    });
    try {
      final apiTasks = await ref.read(focientRepositoryProvider).getTasks();
      if (apiTasks.isNotEmpty && mounted) {
        ref.read(taskListProvider.notifier).setTasks(apiTasks);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Could not sync latest tasks from server.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingTasks = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _taskNameController.dispose();
    super.dispose();
  }

  void _onConfirmNewTask() async {
    final title = _taskNameController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Give your task a short title to guide your focus.'),
          backgroundColor: Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final tasks = ref.read(taskListProvider);
    final top3Count = tasks.where((t) => t.priority == TaskPriorityEnum.top3 && !t.isCompleted).length;
    final isTop3 = top3Count < 3;

    final newTask = MobileTask(
      id: 'task-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      durationMinutes: _selectedDurationMinutes,
      priority: isTop3 ? TaskPriorityEnum.top3 : TaskPriorityEnum.normal,
      energyLevel: isTop3 ? EnergyLevelEnum.high : EnergyLevelEnum.medium,
      categoryName: _selectedCategoryName,
      categoryColor: _selectedCategoryColor,
      restMinutes: 20,
      dateDisplay: 'October, 5th',
      startHourDisplay: '14:30',
      focusType: isTop3 ? 'Deep Focus' : 'Medium',
    );

    ref.read(taskListProvider.notifier).addTask(newTask);
    _taskNameController.clear();
    FocusScope.of(context).unfocus();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Task "$title" added to today\'s schedule successfully!'),
        backgroundColor: const Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
      ),
    );

    final saved = await ref.read(focientRepositoryProvider).createTask(newTask);
    final repo = ref.read(focientRepositoryProvider);
    if (saved == null && mounted && repo.lastError != null) {
      if (repo.lastConflict != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Conflict: ${repo.lastConflict!.message}'),
            backgroundColor: const Color(0xFFD97706),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save to server: ${repo.lastError}'),
            backgroundColor: const Color(0xFFE11D48),
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () {
                ref.read(focientRepositoryProvider).createTask(newTask);
              },
            ),
          ),
        );
      }
    }
  }

  void _onRescheduleNow() {
    setState(() {
      _rescheduleResolved = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Schedule adjusted without guilt! Rescheduled after "Implement Color Palette Token" with a 10-minute rest buffer.',
        ),
        backgroundColor: Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 4),
      ),
    );
  }

  void _onRescheduleLater() {
    setState(() {
      _rescheduleDismissed = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Schedule adjustment postponed. The system will monitor your available time.'),
        backgroundColor: Color(0xFF475569),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out of FoCient?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FocientButton(
            size: FocientButtonSize.sm,
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_activeNavIndex == 1) {
      return FocientTodayPlanScreen(
        onBack: () => setState(() => _activeNavIndex = 0),
        onNavigateTab: (idx) => setState(() => _activeNavIndex = idx),
      );
    }
    if (_activeNavIndex == 2) {
      return FocientAddTaskScreen(
        onBack: () => setState(() => _activeNavIndex = 0),
        onTaskSaved: (_) => setState(() => _activeNavIndex = 3),
      );
    }
    if (_activeNavIndex == 3) {
      return FocientTaskListScreen(
        onBack: () => setState(() => _activeNavIndex = 0),
        onNavigateTab: (idx) => setState(() => _activeNavIndex = idx),
      );
    }

    final authState = ref.watch(authProvider);
    final user = authState.user;
    final tasks = ref.watch(taskListProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : const Color(0xFFF8FAFC);

    final cardBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final borderColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFE2E8F0);

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    // --- Dynamic Workload & Priority Computation ---
    final todayTasks = tasks
        .where((t) =>
            !t.isBacklog &&
            (t.dateDisplay.contains('5th') ||
                t.dateDisplay.contains('10th') ||
                !t.dateDisplay.contains('3rd')))
        .toList();

    final totalTasksCount = todayTasks.length;
    final highPriorityCount = todayTasks
        .where((t) => t.priority == TaskPriorityEnum.top3 || t.energyLevel == EnergyLevelEnum.high)
        .length;
    final mediumPriorityCount = todayTasks
        .where((t) => t.priority == TaskPriorityEnum.normal || t.energyLevel == EnergyLevelEnum.medium)
        .length;
    final lowPriorityCount = todayTasks
        .where((t) => t.priority == TaskPriorityEnum.low || t.energyLevel == EnergyLevelEnum.low)
        .length;

    final allocatedMinutes = todayTasks
        .where((t) => !t.isCompleted)
        .fold<int>(0, (sum, t) => sum + t.durationMinutes);

    const capacityMinutes = 480;
    final workloadPercent = todayTasks.isEmpty
        ? 0
        : ((allocatedMinutes / capacityMinutes) * 100).round().clamp(0, 100);

    String workloadStatus;
    if (todayTasks.isEmpty || workloadPercent == 0) {
      workloadStatus = 'Empty Plan';
    } else if (workloadPercent < 50) {
      workloadStatus = 'Light';
    } else if (workloadPercent <= 80) {
      workloadStatus = 'Optimal';
    } else if (workloadPercent <= 95) {
      workloadStatus = 'Near Capacity';
    } else {
      workloadStatus = 'Overload';
    }

    final top3Tasks = todayTasks
        .where((t) => t.priority == TaskPriorityEnum.top3 && !t.isCompleted)
        .toList();

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(
              user: user,
              workloadPercent: workloadPercent,
              titleColor: titleColor,
              subtitleColor: subtitleColor,
            ),

            // Scrollable Dashboard Content
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadTasksFromApi,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_isLoadingTasks)
                        const Padding(
                          padding: EdgeInsets.only(bottom: 12.0),
                          child: LinearProgressIndicator(minHeight: 2),
                        ),
                      if (_errorMessage != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 12.0),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            border: Border.all(color: const Color(0xFFFECACA)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline, color: Color(0xFFDC2626), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(
                                    color: Color(0xFF991B1B),
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: _loadTasksFromApi,
                                child: const Text('Coba Lagi', style: TextStyle(fontSize: 12)),
                              ),
                            ],
                          ),
                        ),
                      // Page Title & Formatted Date
                      Text(
                        'My Dashboard',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: titleColor,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Monday, October 5th 2026',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: subtitleColor,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Card 1: Today Workload
                    _buildTodayWorkloadCard(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                      workloadPercent: workloadPercent,
                      workloadStatus: workloadStatus,
                      totalTasksCount: totalTasksCount,
                      highPriorityCount: highPriorityCount,
                      mediumPriorityCount: mediumPriorityCount,
                      lowPriorityCount: lowPriorityCount,
                    ),
                    const SizedBox(height: 16),

                    // Card 2: Task Reschedule Suggestion (Algoritma 3)
                    if (!_rescheduleDismissed)
                      _buildRescheduleSuggestionCard(
                        cardBg: cardBg,
                        borderColor: borderColor,
                        titleColor: titleColor,
                        subtitleColor: subtitleColor,
                        isResolved: _rescheduleResolved,
                      ),
                    if (!_rescheduleDismissed) const SizedBox(height: 16),

                    // Card 3: Top 3 Priority Task
                    _buildTop3PriorityCard(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                      top3Tasks: top3Tasks,
                    ),
                    const SizedBox(height: 20),

                    // Section 4: Today Timeline
                    _buildTodayTimelineSection(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),
                    const SizedBox(height: 20),

                    // Section 5: Quick Add Task
                    _buildQuickAddTaskCard(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),
                    const SizedBox(height: 28),
                  ],
                ),
              ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(isDark: isDark),
    );
  }

  // --- 1. Top App Bar ---
  Widget _buildTopAppBar({
    required AuthUser? user,
    required int workloadPercent,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    final userName = (user?.name != null && user!.name.isNotEmpty)
        ? user.name
        : ((user?.username != null && user!.username!.isNotEmpty)
            ? user.username!
            : 'John Doe');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
      child: Row(
        children: [
          // Profile User Icon Outline
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: const Icon(
              Icons.person_outline_rounded,
              size: 20,
              color: Color(0xFF2563EB),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Hi, $userName',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Workload Pill (e.g. 60% bell pill)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.notifications_active_outlined,
                  size: 13,
                  color: Color(0xFF2563EB),
                ),
                const SizedBox(width: 4),
                Text(
                  '$workloadPercent%',
                  style: const TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2563EB),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Bell Icon
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, size: 22),
            color: subtitleColor,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Semua notifikasi ritme kerja tersinkronisasi.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            tooltip: 'Notifications',
          ),
          // Settings Gear Icon
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            color: subtitleColor,
            onPressed: () => _confirmLogout(context, ref),
            tooltip: 'Settings / Logout',
          ),
        ],
      ),
    );
  }

  // --- 2. Card 1: Today Workload ---
  Widget _buildTodayWorkloadCard({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
    required int workloadPercent,
    required String workloadStatus,
    required int totalTasksCount,
    required int highPriorityCount,
    required int mediumPriorityCount,
    required int lowPriorityCount,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Today Workload',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 8),
          // Big Status (e.g. "60% - Optimal")
          Text(
            '$workloadPercent% - $workloadStatus',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: titleColor,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 12),
          // Capacity Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (workloadPercent / 100.0).clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: const Color(0xFFEFF6FF),
              valueColor: const AlwaysStoppedAnimation<Color>(
                Color(0xFF0284C7),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Total Today's Task Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Total Today's Task",
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
              Text(
                '$totalTasksCount Tasks',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // High Priority Row (Orange Dot)
          _buildPriorityCountRow(
            dotColor: const Color(0xFFF97316),
            label: 'High Priority',
            count: highPriorityCount,
            titleColor: titleColor,
          ),
          const SizedBox(height: 8),

          // Medium Priority Row (Blue Dot)
          _buildPriorityCountRow(
            dotColor: const Color(0xFF0284C7),
            label: 'Medium Priority',
            count: mediumPriorityCount,
            titleColor: titleColor,
          ),
          const SizedBox(height: 8),

          // Low Priority Row (Green Dot)
          _buildPriorityCountRow(
            dotColor: const Color(0xFF10B981),
            label: 'Low Priority',
            count: lowPriorityCount,
            titleColor: titleColor,
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityCountRow({
    required Color dotColor,
    required String label,
    required int count,
    required Color titleColor,
  }) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: titleColor,
          ),
        ),
        const Spacer(),
        Text(
          '$count Tasks',
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: titleColor,
          ),
        ),
      ],
    );
  }

  // --- 3. Card 2: Task Reschedule Suggestion ---
  Widget _buildRescheduleSuggestionCard({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
    required bool isResolved,
  }) {
    if (isResolved) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFBBF7D0)),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF16A34A),
              size: 20,
            ),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Today\'s schedule is calm and collision-free. Optimal work rhythm!',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF166534),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Task Reschedule Suggestion',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '"Message to best friend" need to reschedule due another assignment at the same time, we suggest reschedule after "Implement Color Palette Token"',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: subtitleColor,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 14),

          // Mini Timeline Collision Graphic
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                // Top Time Markers
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Text(
                      '14:30',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        color: subtitleColor,
                      ),
                    ),
                    Text(
                      '15:30',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        color: subtitleColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                // Colliding Blocks
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: const Text(
                        'Implement..',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1D4ED8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Text(
                        'Mess..',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFB45309),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                // Bottom Time Markers
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '14:00',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: titleColor,
                      ),
                    ),
                    Text(
                      '15:00',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: titleColor,
                      ),
                    ),
                    Text(
                      '16:00',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: titleColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Action Buttons: Reschedule Later & Reschedule Now
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 40,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: EdgeInsets.zero,
                    ),
                    onPressed: _onRescheduleLater,
                    child: const Text(
                      'Reschedule Later',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 40,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: EdgeInsets.zero,
                    ),
                    onPressed: _onRescheduleNow,
                    child: const Text(
                      'Reschedule Now',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- 4. Card 3: Top 3 Priority Task ---
  Widget _buildTop3PriorityCard({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
    required List<MobileTask> top3Tasks,
  }) {
    final firstTask = top3Tasks.isNotEmpty
        ? top3Tasks.first
        : MobileTask(
            id: 'mock-okr',
            title: 'Create the Annual OKR',
            durationMinutes: 25,
            restMinutes: 20,
            categoryName: 'Strategy',
            categoryColor: const Color(0xFF7C3AED),
            dateDisplay: 'October, 10th',
            startHourDisplay: '10:00',
          );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Text(
            'Top 3 Priority Task',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 10),

          // Show More Toggle Row
          InkWell(
            onTap: () {
              setState(() => _showDetailedTop3 = !_showDetailedTop3);
            },
            child: Row(
              children: [
                Text(
                  _showDetailedTop3 ? 'Show Less' : 'Show More',
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: subtitleColor,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  _showDetailedTop3
                      ? Icons.keyboard_arrow_up_rounded
                      : Icons.keyboard_arrow_down_rounded,
                  size: 18,
                  color: subtitleColor,
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Subheader: Top 3 Task Detail
          Text(
            'Top 3 Task Detail',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),

          // Image 1: Compact View (when _showDetailedTop3 is false)
          if (!_showDetailedTop3)
            Row(
              children: [
                // Blue Dot Indicator
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF2563EB),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    firstTask.title,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: titleColor,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                // Purple Category Badge (e.g. Strategy)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3E8FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: firstTask.categoryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        firstTask.categoryName,
                        style: const TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF7C3AED),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            )
          // Image 2: Detailed Boxed Card (when _showDetailedTop3 is true)
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    firstTask.title,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${firstTask.dateDisplay} - ${firstTask.startHourDisplay}',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 12,
                      color: subtitleColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Badges Row: 25" Task | 20" Rest | ● Strategic
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Text(
                          '${firstTask.durationMinutes}" Task',
                          style: const TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Text(
                          '${firstTask.restMinutes}" Rest',
                          style: const TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3E8FF),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: firstTask.categoryColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              firstTask.categoryName,
                              style: const TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF7C3AED),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // --- 5. Section 4: Today Timeline ---
  Widget _buildTodayTimelineSection({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Today Timeline',
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Time Markers
                Row(
                  children: [
                    const SizedBox(width: 4),
                    _timelineText('13:30', subtitleColor),
                    const SizedBox(width: 60),
                    _timelineText('14:30', subtitleColor),
                    const SizedBox(width: 70),
                    _timelineText('15:30', subtitleColor),
                    const SizedBox(width: 60),
                    _timelineText('16:30', subtitleColor),
                  ],
                ),
                const SizedBox(height: 8),

                // Task Blocks on Track
                Row(
                  children: [
                    const SizedBox(width: 90),
                    // Block 1: Meeting C..
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: const Text(
                        'Meeting C..',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1D4ED8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Block 2: Create th..
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: const Text(
                        'Create th..',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1D4ED8),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Bottom Time Markers
                Row(
                  children: [
                    const SizedBox(width: 30),
                    _timelineText('14:00', titleColor, isBold: true),
                    const SizedBox(width: 70),
                    _timelineText('15:00', titleColor, isBold: true),
                    const SizedBox(width: 70),
                    _timelineText('16:00', titleColor, isBold: true),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _timelineText(String text, Color color, {bool isBold = false}) {
    return Text(
      text,
      style: TextStyle(
        fontFamily: FocientTypographyTokens.fontFamily,
        fontSize: 11,
        fontWeight: isBold ? FontWeight.w700 : FontWeight.w400,
        color: color,
      ),
    );
  }

  // --- 6. Section 5: Quick Add Task ---
  Widget _buildQuickAddTaskCard({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Add Task',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 16),

          // Field 1: Task Name
          Text(
            'Task Name',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 6),
          FocientInputField(
            controller: _taskNameController,
            hintText: 'Input in here!',
          ),
          const SizedBox(height: 16),

          // Field 2: Task Categories
          Text(
            'Task Categories',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _availableCategories.map((catName) {
                final isSelected = _selectedCategoryName == catName;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      setState(() {
                        _selectedCategoryName = catName;
                        _selectedCategoryColor =
                            _categoryColors[catName] ?? const Color(0xFF7C3AED);
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFFEDE9FE)
                            : const Color(0xFFF3E8FF),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected
                              ? const Color(0xFF7C3AED)
                              : const Color(0xFFDDD6FE),
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Text(
                        catName,
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: const Color(0xFF6D28D9),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Field 3: Task Duration
          Text(
            'Task Duration',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _availableDurations.map((dur) {
                final isSelected = _selectedDurationMinutes == dur;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      setState(() => _selectedDurationMinutes = dur);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF2563EB)
                            : const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected
                              ? const Color(0xFF1D4ED8)
                              : const Color(0xFFBFDBFE),
                        ),
                      ),
                      child: Text(
                        '$dur Minute',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : const Color(0xFF1D4ED8),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // Action Button: Confirm New Task
          Align(
            alignment: Alignment.centerRight,
            child: SizedBox(
              height: 42,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                ),
                onPressed: _onConfirmNewTask,
                child: const Text(
                  'Confirm New Task',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- 7. Bottom Navigation Bar ---
  Widget _buildBottomNavBar({required bool isDark}) {
    final navItems = [
      (Icons.home_outlined, Icons.home_rounded, 'Home'),
      (Icons.calendar_today_outlined, Icons.calendar_month_rounded, 'Plan'),
      (Icons.add_rounded, Icons.add_rounded, 'Add Task'),
      (Icons.format_list_bulleted_rounded, Icons.format_list_bulleted_rounded, 'Task List'),
      (Icons.insert_chart_outlined_rounded, Icons.insert_chart_rounded, 'Insights'),
    ];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: navItems.asMap().entries.map((entry) {
              final idx = entry.key;
              final (iconOutlined, iconFilled, label) = entry.value;
              final isActive = _activeNavIndex == idx;
              final isCenterAdd = idx == 2;

              return InkWell(
                onTap: () {
                  setState(() => _activeNavIndex = idx);
                },
                child: SizedBox(
                  width: 58,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isActive ? iconFilled : iconOutlined,
                        size: isCenterAdd ? 24 : 20,
                        color: isActive
                            ? const Color(0xFF0F172A)
                            : const Color(0xFF64748B),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        label,
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 10,
                          fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                          color: isActive
                              ? const Color(0xFF0F172A)
                              : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
