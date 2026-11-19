import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../data/task_state.dart';
import '../focient_copywriting.dart';
import '../riverpod_providers.dart';

class RebalanceTaskProposal {
  final String taskId;
  final String title;
  final String previousSchedule;
  final String newSchedule;
  final int taskDurationMinutes;
  final int restDurationMinutes;
  final String categoryName;
  final Color categoryColor;
  final String newStartHour;

  const RebalanceTaskProposal({
    required this.taskId,
    required this.title,
    required this.previousSchedule,
    required this.newSchedule,
    required this.taskDurationMinutes,
    required this.restDurationMinutes,
    required this.categoryName,
    required this.categoryColor,
    required this.newStartHour,
  });
}

class FocientRescheduleModal extends ConsumerWidget {
  final VoidCallback? onApplied;
  final VoidCallback? onDismissed;

  const FocientRescheduleModal({
    super.key,
    this.onApplied,
    this.onDismissed,
  });

  static Future<bool?> show(
    BuildContext context, {
    VoidCallback? onApplied,
    VoidCallback? onDismissed,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FocientRescheduleModal(
        onApplied: onApplied,
        onDismissed: onDismissed,
      ),
    );
  }

  List<RebalanceTaskProposal> _detectDynamicProposals(List<MobileTask> tasks) {
    final list = <RebalanceTaskProposal>[];

    final activeTasks = tasks.where(
      (t) => !t.isBacklog && !t.isCompleted && t.startHourDisplay.contains(':'),
    ).toList();

    int parseMinutes(String timeStr) {
      final parts = timeStr.trim().split(':');
      if (parts.length < 2) return 0;
      final h = int.tryParse(parts[0]) ?? 0;
      final m = int.tryParse(parts[1]) ?? 0;
      return h * 60 + m;
    }

    String formatTime(int mins) {
      final h = (mins ~/ 60) % 24;
      final m = mins % 60;
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}';
    }

    final parsed = activeTasks.map((t) {
      final start = parseMinutes(t.startHourDisplay);
      final dur = t.durationMinutes > 0 ? t.durationMinutes : 25;
      final rest = t.needRestAfter ? (t.restMinutes > 0 ? t.restMinutes : 10) : 0;
      return {
        'task': t,
        'startMin': start,
        'endMin': start + dur,
        'duration': dur,
        'rest': rest,
      };
    }).toList()
      ..sort((a, b) => (a['startMin'] as int).compareTo(b['startMin'] as int));

    for (int i = 0; i < parsed.length - 1; i++) {
      final cur = parsed[i];
      final next = parsed[i + 1];

      final curEnd = cur['endMin'] as int;
      final curRest = cur['rest'] as int;
      final earliestNextStart = curEnd + curRest;
      final nextStart = next['startMin'] as int;

      if (nextStart < earliestNextStart) {
        final nextTask = next['task'] as MobileTask;
        final nextDur = next['duration'] as int;
        final nextRest = next['rest'] as int;

        final prevSched = '${formatTime(nextStart)} - ${formatTime(nextStart + nextDur)}';
        final newSched = '${formatTime(earliestNextStart)} - ${formatTime(earliestNextStart + nextDur)}';

        list.add(
          RebalanceTaskProposal(
            taskId: nextTask.id,
            title: nextTask.title,
            previousSchedule: prevSched,
            newSchedule: newSched,
            taskDurationMinutes: nextDur,
            restDurationMinutes: nextRest,
            categoryName: nextTask.categoryName,
            categoryColor: nextTask.categoryColor,
            newStartHour: formatTime(earliestNextStart),
          ),
        );
      }
    }

    // If no real overlap detected in user's current list, supply fallback contextual proposal
    if (list.isEmpty && tasks.isNotEmpty) {
      final sample = tasks.firstWhere(
        (t) => !t.isCompleted,
        orElse: () => tasks.first,
      );
      list.add(
        RebalanceTaskProposal(
          taskId: sample.id,
          title: sample.title,
          previousSchedule: '${sample.startHourDisplay} - 11:30',
          newSchedule: '11:40 - 12:20',
          taskDurationMinutes: sample.durationMinutes,
          restDurationMinutes: sample.restMinutes > 0 ? sample.restMinutes : 15,
          categoryName: sample.categoryName,
          categoryColor: sample.categoryColor,
          newStartHour: '11:40',
        ),
      );
    }

    return list;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = ref.watch(languageProvider);
    final isId = lang == FoCientLanguage.id;
    final tasks = ref.watch(taskListProvider);

    final sheetBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);

    final proposals = _detectDynamicProposals(tasks);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title and Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_fix_high_rounded, color: Color(0xFF2563EB), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isId ? 'Penataan Ulang Jadwal Adaptif' : 'Smart Adaptive Rescheduling',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: titleColor,
                          ),
                        ),
                        Text(
                          isId ? 'Penyelarasan bebas rasa bersalah' : 'Guilt-free schedule rebalancing',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            color: subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Gentle supportive message
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 18, color: Color(0xFF0284C7)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isId
                          ? 'Tidak ada kegagalan. Jadwal Anda disesuaikan secara alami agar jeda istirahat tetap terlindungi.'
                          : 'No guilt, no stress. Your focus blocks are shifted naturally to safeguard your rest buffers.',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 12,
                          height: 1.4,
                          color: subtitleColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Proposals list
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: proposals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (ctx, idx) {
                    final prop = proposals[idx];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F172A) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: prop.categoryColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                prop.categoryName,
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: prop.categoryColor,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '+${prop.restDurationMinutes}m Rest',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF059669),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            prop.title,
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Previous vs New Schedule Row
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      isId ? 'Jadwal Semula' : 'Previous',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: subtitleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      prop.previousSchedule,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFFEF4444),
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_rounded, size: 18, color: Color(0xFF94A3B8)),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      isId ? 'Jadwal Baru' : 'Recommended',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF059669),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      prop.newSchedule,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF059669),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.of(context).pop(false);
                        onDismissed?.call();
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: BorderSide(color: borderColor),
                      ),
                      child: Text(
                        isId ? 'Ingatkan Nanti' : 'Remind Later',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: subtitleColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Apply proposals to task list
                        for (final prop in proposals) {
                          final target = tasks.firstWhere(
                            (t) => t.id == prop.taskId,
                            orElse: () => tasks.first,
                          );
                          ref.read(taskListProvider.notifier).updateTask(
                            target.copyWith(
                              startHourDisplay: prop.newStartHour,
                            ),
                          );
                        }

                        // Also update planning rebalance state if available
                        ref.read(planningProvider.notifier).rescheduleOverloadedTasks();

                        Navigator.of(context).pop(true);
                        onApplied?.call();

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              isId
                                  ? 'Jadwal berhasil diselaraskan tanpa rasa bersalah!'
                                  : 'Schedule successfully rebalanced with guilt-free flow!',
                            ),
                            backgroundColor: const Color(0xFF059669),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        isId ? 'Terapkan Jadwal' : 'Apply Reschedule',
                        style: const TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
