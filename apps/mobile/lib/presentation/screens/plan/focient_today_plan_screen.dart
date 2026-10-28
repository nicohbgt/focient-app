import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/focient_repository.dart';
import '../../../data/planning_state.dart';
import '../../../data/workspace_category.dart';
import '../../primitive/focient_button.dart';
import '../../riverpod_providers.dart';
import '../onboarding/create_task_bottom_sheet.dart';

/// FoCient Today Plan Screen ("Your Planning")
///
/// Implements:
/// - Top Bar: Back arrow button, "Your Planning" title, dynamic workload bell pill (e.g. 60%), notification bell & settings gear.
/// - Section 1: Task Categories horizontal scrollable list with allocation vs max budget.
/// - Section 2: Weekly Workload Distribution card with 7-day bar chart (Mon - Sun) and summary metrics (Active Hours, Buffer Hours, Scheduled Tasks).
/// - Section 3: Smart Rebalancer card with empathetic overload resolution, "Show More" / "Show Less" toggle (Image 1 compact vs Image 2 detailed cards), "Reschedule Task" (Orange) and "Keep The Schedule" (Green) CTAs.
/// - Section 4: Backlog Scheduler card with "Not yet scheduled" status pills and category badges.
/// - 5-tab Bottom Navigation Bar: Home, Plan (Active), Add Task, Task List, Insights.
class FocientTodayPlanScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final ValueChanged<int>? onNavigateTab;
  final bool showBottomNav;

  const FocientTodayPlanScreen({
    super.key,
    this.onBack,
    this.onNavigateTab,
    this.showBottomNav = true,
  });

  @override
  ConsumerState<FocientTodayPlanScreen> createState() =>
      _FocientTodayPlanScreenState();
}

class _FocientTodayPlanScreenState extends ConsumerState<FocientTodayPlanScreen> {
  int _activeNavIndex = 1; // Plan is active

  void _onRescheduleTask() {
    ref.read(planningProvider.notifier).rescheduleOverloadedTasks();
    ref.read(focientRepositoryProvider).rebalanceSchedule();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Jadwal berhasil diseimbangkan! 2 tugas dipindahkan ke Kamis pagi. Beban hari Rabu berkurang menjadi 65% (Optimal).',
        ),
        backgroundColor: Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 4),
      ),
    );
  }

  void _onKeepSchedule() {
    ref.read(planningProvider.notifier).keepCurrentSchedule();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Jadwal asli tetap dipertahankan tanpa rasa bersalah. Anda dapat menyesuaikannya kapan saja.',
        ),
        backgroundColor: Color(0xFF475569),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 3),
      ),
    );
  }

  void _onScheduleBacklogItem(BacklogTaskItem task) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Jadwalkan Tugas Backlog',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                task.title,
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF334155),
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.today_rounded, color: Color(0xFF0284C7)),
                title: const Text('Jadwalkan Hari Ini (15:00)'),
                onTap: () {
                  Navigator.pop(ctx);
                  ref.read(planningProvider.notifier).scheduleBacklogTask(task.id, 'Today, 15:00');
                  ref.read(focientRepositoryProvider).scheduleBacklogTask(taskId: task.id, targetTime: 'Today, 15:00');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Tugas "${task.title}" dijadwalkan ke jam 15:00!'),
                      backgroundColor: const Color(0xFF059669),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.next_plan_rounded, color: Color(0xFF7C3AED)),
                title: const Text('Jadwalkan Besok Pagi (10:00)'),
                onTap: () {
                  Navigator.pop(ctx);
                  ref.read(planningProvider.notifier).scheduleBacklogTask(task.id, 'Tomorrow, 10:00');
                  ref.read(focientRepositoryProvider).scheduleBacklogTask(taskId: task.id, targetTime: 'Tomorrow, 10:00');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Tugas "${task.title}" dijadwalkan ke Besok jam 10:00!'),
                      backgroundColor: const Color(0xFF059669),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final planningState = ref.watch(planningProvider);
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

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(
              isDark: isDark,
              titleColor: titleColor,
              workloadPercentage: planningState.isEmptyState ? 0 : 60,
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1: Task Categories
                    _buildTaskCategoriesSection(
                      categories: planningState.categories,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),

                    const SizedBox(height: 16),

                    // Section 2: Weekly Workload Distribution
                    _buildWeeklyWorkloadCard(
                      distribution: planningState.weeklyDistribution,
                      metrics: planningState.metrics,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),

                    const SizedBox(height: 16),

                    // Section 3: Smart Rebalancer
                    _buildSmartRebalancerCard(
                      state: planningState,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),

                    const SizedBox(height: 16),

                    // Section 4: Backlog Scheduler
                    _buildBacklogSchedulerCard(
                      tasks: planningState.backlogTasks,
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      subtitleColor: subtitleColor,
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Bottom Navigation Bar
            if (widget.showBottomNav)
              _buildBottomNavBar(isDark: isDark),
          ],
        ),
      ),
    );
  }

  // --- 1. Top App Bar ---
  Widget _buildTopAppBar({
    required bool isDark,
    required Color titleColor,
    required int workloadPercentage,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Back Button
          IconButton(
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
            ),
            color: titleColor,
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {
              if (widget.onBack != null) {
                widget.onBack!();
              } else if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else if (widget.onNavigateTab != null) {
                widget.onNavigateTab!(0); // Return to home
              }
            },
          ),
          const SizedBox(width: 8),

          // Screen Title
          Expanded(
            child: Text(
              'Your Planning',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
            ),
          ),

          // Workload Bell Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFFBFDBFE),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.notifications_none_rounded,
                  size: 14,
                  color: Color(0xFF2563EB),
                ),
                const SizedBox(width: 4),
                Text(
                  '$workloadPercentage%',
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1E40AF),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),

          // Notification Bell
          IconButton(
            icon: const Icon(
              Icons.notifications_none_rounded,
              size: 22,
            ),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Tidak ada notifikasi baru.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          const SizedBox(width: 6),

          // Settings Gear
          IconButton(
            icon: const Icon(
              Icons.settings_outlined,
              size: 22,
            ),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Pengaturan perencanaan dibuka.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // --- 2. Task Categories Section ---
  Widget _buildTaskCategoriesSection({
    required List<CategoryBudgetItem> categories,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Task Categories',
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
        const SizedBox(height: 10),

        SizedBox(
          height: 60,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final cat = categories[index];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: borderColor, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      cat.name,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      cat.formattedAllocation,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: subtitleColor,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // --- 3. Weekly Workload Distribution Card ---
  Widget _buildWeeklyWorkloadCard({
    required List<DailyWorkloadItem> distribution,
    required PlanningMetrics metrics,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            'Weekly Workload Distribution',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Monday, October 5th 2026',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: subtitleColor,
            ),
          ),
          const SizedBox(height: 20),

          // 7-Bar Chart
          SizedBox(
            height: 120,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: distribution.map((item) {
                // Height calculation: max height 80px for 100%
                final double barHeight = item.percentage > 0
                    ? ((item.percentage / 100.0) * 80.0).clamp(6.0, 80.0)
                    : 4.0;

                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 14,
                      height: barHeight,
                      decoration: BoxDecoration(
                        color: item.barColor,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${item.percentage}%',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 20),
          Divider(color: borderColor, height: 1),
          const SizedBox(height: 16),

          // Summary Metrics
          _buildMetricRow(
            label: 'Active Hours Allocated',
            value: '${metrics.activeHoursAllocated} Hours',
            titleColor: titleColor,
            labelColor: const Color(0xFF334155),
          ),
          const SizedBox(height: 10),
          _buildMetricRow(
            label: 'Buffer Hours Allocated',
            value: '${metrics.bufferMinutesAllocated} Minutes',
            titleColor: titleColor,
            labelColor: const Color(0xFF334155),
          ),
          const SizedBox(height: 10),
          _buildMetricRow(
            label: 'On Scheduled Task',
            value: '${metrics.onScheduledTaskCount} Task',
            titleColor: titleColor,
            labelColor: const Color(0xFF334155),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow({
    required String label,
    required String value,
    required Color titleColor,
    required Color labelColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w400,
            color: labelColor,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
      ],
    );
  }

  // --- 4. Smart Rebalancer Card ---
  Widget _buildSmartRebalancerCard({
    required PlanningState state,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Text(
            'Smart Rebalancer',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 8),

          // Empathetic Description
          if (state.isRebalanced)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Text(
                'Jadwal berhasil diseimbangkan! Beban kerja hari Rabu menjadi 65% (Optimal) setelah memindahkan 2 tugas ke Kamis pagi.',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF065F46),
                  height: 1.4,
                ),
              ),
            )
          else if (state.isScheduleKept)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: Text(
                'Jadwal asli tetap dipertahankan tanpa rasa bersalah. Anda dapat menyesuaikannya kapan saja.',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF334155),
                  height: 1.4,
                ),
              ),
            )
          else
            Text(
              'Your workload at Wednesday reach 85%, we suggested you to reschedule 2 Tasks at Thursday. here is the suggested task to reschedule:',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 12.5,
                fontWeight: FontWeight.w400,
                color: const Color(0xFF475569),
                height: 1.4,
              ),
            ),

          const SizedBox(height: 12),

          // Show More / Show Less Toggle Row
          InkWell(
            onTap: () {
              ref.read(planningProvider.notifier).toggleRebalancerDetail();
            },
            borderRadius: BorderRadius.circular(6),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    state.showDetailedRebalancer ? 'Show Less' : 'Show More',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF475569),
                    ),
                  ),
                  Icon(
                    state.showDetailedRebalancer
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    size: 20,
                    color: const Color(0xFF64748B),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Collapsed View (Image 1) vs Detailed Cards (Image 2)
          if (!state.showDetailedRebalancer) ...[
            // Image 1: Compact Bullets
            ...state.rebalanceSuggestions.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF0284C7),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.title,
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // Image 2: Detailed Task Cards
            ...state.rebalanceSuggestions.map(
              (item) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: borderColor, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Previous Schedule',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            color: subtitleColor,
                          ),
                        ),
                        Text(
                          item.previousSchedule,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: titleColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'New Schedule',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            color: subtitleColor,
                          ),
                        ),
                        Text(
                          item.newSchedule,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: titleColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Badges Row
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        _buildPillBadge(
                          label: '${item.taskDurationMinutes}" Task',
                          bgColor: const Color(0xFFF0F9FF),
                          borderColor: const Color(0xFFBAE6FD),
                          textColor: const Color(0xFF0369A1),
                        ),
                        _buildPillBadge(
                          label: '${item.restDurationMinutes}" Rest',
                          bgColor: const Color(0xFFF0F9FF),
                          borderColor: const Color(0xFFBAE6FD),
                          textColor: const Color(0xFF0369A1),
                        ),
                        _buildCategoryBadge(
                          categoryName: item.categoryName,
                          color: item.categoryColor,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: 12),

          // Action Buttons: Reschedule Task (Orange) & Keep The Schedule (Green)
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 40,
                  child: ElevatedButton(
                    onPressed: state.isRebalanced ? null : _onRescheduleTask,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    child: Text(
                      'Reschedule Task',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: SizedBox(
                  height: 40,
                  child: ElevatedButton(
                    onPressed: state.isScheduleKept ? null : _onKeepSchedule,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    child: Text(
                      'Keep The Schedule',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
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

  // --- 5. Backlog Scheduler Card ---
  Widget _buildBacklogSchedulerCard({
    required List<BacklogTaskItem> tasks,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            'Backlog Scheduler',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),

          if (tasks.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Center(
                child: Text(
                  'Belum ada tugas di backlog. Tambahkan tugas baru untuk merencanakan pekerjaan masa depan.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 12.5,
                    color: const Color(0xFF64748B),
                  ),
                ),
              ),
            )
          else
            ...tasks.map(
              (task) => InkWell(
                onTap: () => _onScheduleBacklogItem(task),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: borderColor, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        task.title,
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _buildPillBadge(
                            label: task.isScheduled
                                ? (task.scheduledTime ?? 'Scheduled')
                                : 'Not yet scheduled',
                            bgColor: task.isScheduled
                                ? const Color(0xFFECFDF5)
                                : const Color(0xFFF1F5F9),
                            borderColor: task.isScheduled
                                ? const Color(0xFFA7F3D0)
                                : const Color(0xFFCBD5E1),
                            textColor: task.isScheduled
                                ? const Color(0xFF065F46)
                                : const Color(0xFF475569),
                          ),
                          const SizedBox(width: 8),
                          _buildCategoryBadge(
                            categoryName: task.categoryName,
                            color: task.categoryColor,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // --- Badge Helpers ---
  Widget _buildPillBadge({
    required String label,
    required Color bgColor,
    required Color borderColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: FocientTypographyTokens.fontFamily,
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  Widget _buildCategoryBadge({
    required String categoryName,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F3FF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFDDD6FE), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            categoryName,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF6B21A8),
            ),
          ),
        ],
      ),
    );
  }

  // --- 6. Bottom Navigation Bar ---
  Widget _buildBottomNavBar({required bool isDark}) {
    final navItems = [
      (Icons.home_outlined, Icons.home_rounded, 'Home'),
      (Icons.calendar_today_outlined, Icons.calendar_month_rounded, 'Plan'),
      (Icons.add_rounded, Icons.add_rounded, 'Add Task'),
      (Icons.format_list_bulleted_rounded, Icons.format_list_bulleted_rounded, 'Task List'),
      (Icons.insert_chart_outlined_rounded, Icons.insert_chart_rounded, 'Insights'),
    ];

    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: navItems.asMap().entries.map((entry) {
          final idx = entry.key;
          final (iconOutlined, iconFilled, label) = entry.value;
          final isActive = _activeNavIndex == idx;
          final isCenterAdd = idx == 2;

          return InkWell(
            onTap: () {
              if (idx == 0) {
                // Return to Home
                if (widget.onNavigateTab != null) {
                  widget.onNavigateTab!(0);
                } else if (widget.onBack != null) {
                  widget.onBack!();
                } else if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                }
                return;
              }

              if (widget.onNavigateTab != null) {
                widget.onNavigateTab!(idx);
                return;
              }

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
    );
  }
}
