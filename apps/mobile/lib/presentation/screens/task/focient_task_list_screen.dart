import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/focient_repository.dart';
import '../../../data/models/task_item.dart';
import '../../../data/task_state.dart';
import '../../riverpod_providers.dart';
import 'focient_add_task_screen.dart';
import 'focient_task_detail_screen.dart';

/// FoCient Your Task List Screen
///
/// Implements:
/// - Top Bar: Back button, "Your Task List", workload bell pill (e.g. 60%), notification bell & settings gear.
/// - Month Navigator: "<  October 2026  >".
/// - Calendar Grid: Sun-Sat weekdays and month day numbers (interactive day selection, defaults to Oct 3).
/// - Day Schedule Section: Formatted day header (e.g. "October, 3rd 2026"), timeline task cards with duration/category badges, and inline resting intervals ("Resting After ...").
/// - Tapping any task card opens Task Detail screen.
/// - 5-tab Bottom Navigation Bar: Home, Plan, Add Task, Task List (Active), Insights.
class FocientTaskListScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final ValueChanged<int>? onNavigateTab;
  final bool showBottomNav;

  const FocientTaskListScreen({
    super.key,
    this.onBack,
    this.onNavigateTab,
    this.showBottomNav = true,
  });

  @override
  ConsumerState<FocientTaskListScreen> createState() => _FocientTaskListScreenState();
}

class _FocientTaskListScreenState extends ConsumerState<FocientTaskListScreen> {
  int _activeNavIndex = 3; // Task List is active
  int _selectedDay = 3; // October 3rd, 2026
  final int _selectedYear = 2026;
  bool _isLoading = false;
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
      _isLoading = true;
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
          _errorMessage = 'Tidak dapat memperbarui tugas dari server.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onSelectTask(MobileTask task) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FocientTaskDetailScreen(
          task: task,
          onBack: () => Navigator.of(context).pop(),
          onTaskDeleted: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }

  void _onOpenAddTask() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FocientAddTaskScreen(
          onBack: () => Navigator.of(context).pop(),
          onTaskSaved: (_) => Navigator.of(context).pop(),
        ),
      ),
    );
  }

  String _formatSelectedDateTitle() {
    String suffix = 'th';
    if (_selectedDay == 1 || _selectedDay == 21 || _selectedDay == 31) {
      suffix = 'st';
    } else if (_selectedDay == 2 || _selectedDay == 22) {
      suffix = 'nd';
    } else if (_selectedDay == 3 || _selectedDay == 23) {
      suffix = 'rd';
    }
    return 'October, $_selectedDay$suffix $_selectedYear';
  }

  @override
  Widget build(BuildContext context) {
    final allTasks = ref.watch(taskListProvider);

    // Filter tasks for selected day
    final selectedDayStr = '$_selectedDay';
    final dayTasks = allTasks.where((t) {
      if (t.isBacklog) return false;
      if (_selectedDay == 3) {
        return t.dateDisplay.contains('3rd') || t.dateDisplay.contains('October, 3');
      } else if (_selectedDay == 5) {
        return t.dateDisplay.contains('5th') || t.dateDisplay.contains('October, 5');
      } else if (_selectedDay == 10) {
        return t.dateDisplay.contains('10th') || t.dateDisplay.contains('October, 10');
      }
      return t.dateDisplay.contains(selectedDayStr);
    }).toList();

    final taskItems = dayTasks.map(TaskItem.fromMobileTask).toList();

    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : const Color(0xFFF8FAFC);

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
      bottomNavigationBar: widget.showBottomNav ? _buildBottomNavBar(isDark: isDark) : null,
      body: SafeArea(
        bottom: !widget.showBottomNav,
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(isDark: isDark, titleColor: titleColor),

            // Scrollable Calendar & Schedule
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadTasksFromApi,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_isLoading)
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
                    // Month Navigator (< October 2026 >)
                    _buildMonthNavigator(titleColor),
                    const SizedBox(height: 14),

                    // Calendar Grid
                    _buildCalendarGrid(titleColor, subtitleColor),
                    const SizedBox(height: 14),

                    Divider(color: borderColor, height: 1),
                    const SizedBox(height: 14),

                    // Day Date Header (e.g. October, 3rd 2026)
                    Text(
                      _formatSelectedDateTitle(),
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Schedule Timeline (4 Lifecycle State: Loading, Empty, Zero Inbox, Populated)
                    _buildBodyContent(taskItems, _isLoading),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Dynamic Lifecycle State Body Content ---
  Widget _buildBodyContent(List<TaskItem> tasks, bool isLoading) {
    if (isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40.0),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    // 1. Empty State (Kondisi Awal Pengguna Baru)
    if (tasks.isEmpty) {
      return _buildEmptyState();
    }

    // 2. All Tasks Completed (Zero Inbox)
    final bool allDone = tasks.every((t) => t.isCompleted);
    if (allDone) {
      return _buildZeroInboxState();
    }

    // 3. Populated State (Tampilan Berisi)
    return _buildTaskList(tasks);
  }

  Widget _buildEmptyState() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Icon(Icons.event_available_outlined, size: 40, color: subtitleColor),
          const SizedBox(height: 10),
          Text(
            'Belum ada tugas yang dijadwalkan untuk hari ini.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              color: subtitleColor,
            ),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: _onOpenAddTask,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(Icons.add_rounded, size: 18),
            label: const Text('Add Task'),
          ),
        ],
      ),
    );
  }

  Widget _buildZeroInboxState() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFFECFDF5),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline_rounded, size: 36, color: Color(0xFF059669)),
          ),
          const SizedBox(height: 12),
          Text(
            'Semua Tugas Selesai! (Zero Inbox)',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Hebat! Seluruh fokus target hari ini telah tercapai dengan ritme seimbang. Istirahatlah dengan tenang.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 12,
              color: subtitleColor,
            ),
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: _onOpenAddTask,
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF0D9488),
              side: const BorderSide(color: Color(0xFF0D9488)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            ),
            icon: const Icon(Icons.add_rounded, size: 16),
            label: const Text('+ Tambah Tugas Ekstra', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskList(List<TaskItem> tasks) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);

    final allMobileTasks = ref.watch(taskListProvider);
    final matchingMobileTasks = tasks.map((ti) {
      return allMobileTasks.firstWhere(
        (mt) => mt.id == ti.id,
        orElse: () => ti.toMobileTask(dateDisplay: _formatSelectedDateTitle()),
      );
    }).toList();

    return Column(
      children: _buildTimelineWidgets(
        tasks: matchingMobileTasks,
        cardBg: cardBg,
        borderColor: borderColor,
        titleColor: titleColor,
        subtitleColor: subtitleColor,
      ),
    );
  }

  // --- 1. Month Navigator ---
  Widget _buildMonthNavigator(Color titleColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 18),
          color: titleColor,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          onPressed: () {},
        ),
        const SizedBox(width: 24),
        Text(
          'October 2026',
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
        const SizedBox(width: 24),
        IconButton(
          icon: const Icon(Icons.arrow_forward_ios_rounded, size: 18),
          color: titleColor,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          onPressed: () {},
        ),
      ],
    );
  }

  // --- 2. Calendar Grid ---
  Widget _buildCalendarGrid(Color titleColor, Color subtitleColor) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 5 Weeks grid for October 2026 (starting Sunday Sep 27)
    final gridItems = [
      // Row 1
      (27, true), (28, true), (29, true), (30, true), (1, false), (2, false), (3, false),
      // Row 2
      (4, false), (5, false), (6, false), (7, false), (8, false), (9, false), (10, false),
      // Row 3
      (11, false), (12, false), (13, false), (14, false), (15, false), (16, false), (17, false),
      // Row 4
      (18, false), (19, false), (20, false), (21, false), (22, false), (23, false), (24, false),
      // Row 5
      (25, false), (26, false), (27, false), (28, false), (29, false), (30, false), (31, false),
    ];

    return Column(
      children: [
        // Weekday Headers
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: daysOfWeek
              .map(
                (d) => SizedBox(
                  width: 36,
                  child: Center(
                    child: Text(
                      d,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: subtitleColor,
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 8),

        // Calendar Days Rows
        for (int r = 0; r < 5; r++) ...[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                for (int c = 0; c < 7; c++) ...[
                  Builder(builder: (_) {
                    final item = gridItems[r * 7 + c];
                    final dayNum = item.$1;
                    final isMuted = item.$2;
                    final isSelected = !isMuted && _selectedDay == dayNum;

                    return InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: isMuted
                          ? null
                          : () {
                              setState(() {
                                _selectedDay = dayNum;
                              });
                            },
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFFEFF6FF)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(18),
                          border: isSelected
                              ? Border.all(color: const Color(0xFF2563EB), width: 1.5)
                              : null,
                        ),
                        child: Center(
                          child: Text(
                            '$dayNum',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected
                                  ? const Color(0xFF1D4ED8)
                                  : (isMuted ? const Color(0xFF94A3B8) : titleColor),
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }

  // --- 3. Timeline Items with Resting Buffers ---
  List<Widget> _buildTimelineWidgets({
    required List<MobileTask> tasks,
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    final List<Widget> widgets = [];

    for (int i = 0; i < tasks.length; i++) {
      final task = tasks[i];

      // Task Row
      widgets.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Timestamp column
              SizedBox(
                width: 58,
                child: Padding(
                  padding: const EdgeInsets.only(top: 14.0),
                  child: Text(
                    task.startHourDisplay,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                    ),
                  ),
                ),
              ),

              // Task Card
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => _onSelectTask(task),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cardBg,
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
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: [
                            _buildPillBadge(
                              label: '${task.durationMinutes}" Task',
                              bgColor: const Color(0xFFF1F5F9),
                              borderColor: const Color(0xFFCBD5E1),
                              textColor: const Color(0xFF475569),
                            ),
                            _buildCategoryBadge(
                              categoryName: task.categoryName,
                              color: task.categoryColor,
                            ),
                            if (task.focusType == 'Deep Focus')
                              _buildPillBadge(
                                label: 'Deep Focus',
                                bgColor: const Color(0xFFFFE4E6),
                                borderColor: const Color(0xFFFECDD3),
                                textColor: const Color(0xFF9F1239),
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
        ),
      );

      // Inline Resting Buffer (if task has rest or needRestAfter)
      if (task.needRestAfter && task.restMinutes > 0) {
        final shortTitle = task.title.length > 15
            ? '${task.title.substring(0, 15)}..'
            : task.title;

        widgets.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: Row(
              children: [
                const SizedBox(width: 58), // Align with task card
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: borderColor, width: 1),
                    ),
                    child: Text(
                      'Resting After "$shortTitle"',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    }

    return widgets;
  }

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
        borderRadius: BorderRadius.circular(16),
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
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0), width: 1),
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
            style: const TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  // --- 4. Top App Bar ---
  Widget _buildTopAppBar({required bool isDark, required Color titleColor}) {
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
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
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
          Expanded(
            child: Text(
              'Your Task List',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFBFDBFE), width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.notifications_none_rounded, size: 14, color: Color(0xFF2563EB)),
                const SizedBox(width: 4),
                Text(
                  '60%',
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
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, size: 22),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {},
          ),
          const SizedBox(width: 6),
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  // --- 5. Bottom Navigation Bar ---
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
            color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: navItems.asMap().entries.map((entry) {
              final idx = entry.key;
              final (iconOutlined, iconFilled, label) = entry.value;
              final isActive = _activeNavIndex == idx;
              final isCenterAdd = idx == 2;

              void handleTap() {
                if (isCenterAdd) {
                  _onOpenAddTask();
                  return;
                }

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

                setState(() => _activeNavIndex = idx);
                if (widget.onNavigateTab != null) {
                  widget.onNavigateTab!(idx);
                }
              }

              if (isCenterAdd) {
                return InkWell(
                  onTap: handleTap,
                  borderRadius: BorderRadius.circular(24),
                  child: Transform.translate(
                    offset: const Offset(0, -6),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.add_rounded,
                            color: Colors.white,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          label,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2563EB),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return InkWell(
                onTap: handleTap,
                borderRadius: BorderRadius.circular(8),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isActive ? iconFilled : iconOutlined,
                          size: 20,
                          color: isActive
                              ? const Color(0xFF2563EB)
                              : const Color(0xFF64748B),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          label,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 11,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                            color: isActive
                                ? const Color(0xFF2563EB)
                                : const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 2),
                        if (isActive)
                          Container(
                            width: 4,
                            height: 4,
                            decoration: const BoxDecoration(
                              color: Color(0xFF2563EB),
                              shape: BoxShape.circle,
                            ),
                          )
                        else
                          const SizedBox(height: 4),
                      ],
                    ),
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
