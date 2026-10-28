import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/task_state.dart';
import '../../riverpod_providers.dart';
import 'focient_add_task_screen.dart';

/// FoCient Task Detail Screen
///
/// Implements:
/// - Top Bar: Back button, "Task Detail", workload bell pill (e.g. 60%), notification bell & settings gear.
/// - Task Header: Title (e.g. "Project Progress Discussion"), Category badge (e.g. "● Meeting"), Focus Type badge (e.g. "Deep Focus").
/// - Metadata List: Task Date, Task Start, Duration, Rest Time.
/// - Bottom Buttons: Cancel Task (Crimson Red) & Edit Task (Warm Amber/Orange).
class FocientTaskDetailScreen extends ConsumerStatefulWidget {
  final MobileTask task;
  final VoidCallback? onBack;
  final ValueChanged<MobileTask>? onTaskUpdated;
  final VoidCallback? onTaskDeleted;

  const FocientTaskDetailScreen({
    super.key,
    required this.task,
    this.onBack,
    this.onTaskUpdated,
    this.onTaskDeleted,
  });

  @override
  ConsumerState<FocientTaskDetailScreen> createState() => _FocientTaskDetailScreenState();
}

class _FocientTaskDetailScreenState extends ConsumerState<FocientTaskDetailScreen> {
  late MobileTask _currentTask;

  @override
  void initState() {
    super.initState();
    _currentTask = widget.task;
  }

  void _onCancelTask() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Batalkan Tugas?'),
        content: const Text(
          'Tugas ini akan dihapus dari jadwal tanpa rasa bersalah. Anda selalu dapat menambahkannya kembali nanti.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(taskListProvider.notifier).removeTask(_currentTask.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Tugas "${_currentTask.title}" dibatalkan tanpa rasa bersalah.'),
                  backgroundColor: const Color(0xFF475569),
                  behavior: SnackBarBehavior.floating,
                ),
              );

              if (widget.onTaskDeleted != null) {
                widget.onTaskDeleted!();
              } else if (widget.onBack != null) {
                widget.onBack!();
              } else if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              }
            },
            child: const Text('Hapus Tugas'),
          ),
        ],
      ),
    );
  }

  void _onEditTask() async {
    final updated = await Navigator.of(context).push<MobileTask>(
      MaterialPageRoute(
        builder: (_) => FocientAddTaskScreen(
          taskToEdit: _currentTask,
          onTaskSaved: (updatedTask) {
            setState(() {
              _currentTask = updatedTask;
            });
            widget.onTaskUpdated?.call(updatedTask);
          },
        ),
      ),
    );

    if (updated != null) {
      setState(() {
        _currentTask = updated;
      });
      widget.onTaskUpdated?.call(updated);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen to changes in taskListProvider in case task is modified
    final tasks = ref.watch(taskListProvider);
    final liveTask = tasks.firstWhere(
      (t) => t.id == _currentTask.id,
      orElse: () => _currentTask,
    );

    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : const Color(0xFFF8FAFC);

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
            _buildTopAppBar(isDark: isDark, titleColor: titleColor),

            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Task Title
                    Text(
                      liveTask.title,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: titleColor,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Badges Row
                    Row(
                      children: [
                        // Category Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: liveTask.categoryColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                liveTask.categoryName,
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),

                        // Focus Type Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE4E6),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            liveTask.focusType,
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Metadata List
                    _buildMetaRow('Task Date', liveTask.dateDisplay, titleColor, subtitleColor),
                    const SizedBox(height: 16),
                    _buildMetaRow('Task Start', liveTask.startHourDisplay, titleColor, subtitleColor),
                    const SizedBox(height: 16),
                    _buildMetaRow('Duration', '${liveTask.durationMinutes} Minutes', titleColor, subtitleColor),
                    const SizedBox(height: 16),
                    _buildMetaRow('Rest Time', '${liveTask.restMinutes} Minutes', titleColor, subtitleColor),

                    const Spacer(),

                    // Action Buttons (Cancel Task & Edit Task)
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: ElevatedButton(
                              onPressed: _onCancelTask,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE11D48),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                'Cancel Task',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: ElevatedButton(
                              onPressed: _onEditTask,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFD97706),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                'Edit Task',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaRow(String label, String value, Color titleColor, Color subtitleColor) {
    return Row(
      children: [
        SizedBox(
          width: 110,
          child: Text(
            label,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: titleColor,
            ),
          ),
        ),
      ],
    );
  }

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
              }
            },
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Task Detail',
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
}
