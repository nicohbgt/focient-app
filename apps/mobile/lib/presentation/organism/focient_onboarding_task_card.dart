import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../data/onboarding_task.dart';
import '../../data/workspace_category.dart';

/// FoCient Add Task Card (A)
///
/// Implements:
/// (add icon) (title)
class FocientAddTaskCard extends StatelessWidget {
  final VoidCallback onTap;
  final String title;

  const FocientAddTaskCard({
    super.key,
    required this.onTap,
    this.title = 'Add your Task',
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : const Color(0xFFF8FAFC);

    final borderColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFCBD5E1);

    final textColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.add_rounded,
              size: 22,
              color: Color(0xFF64748B),
            ),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// FoCient Task Added Card (B)
///
/// Implements:
/// --------------------
/// title
/// timestamp -> tanggal task, jam task
/// (badge) -> task category + focus type + task duration
/// --------------------
class FocientTaskAddedCard extends StatelessWidget {
  final OnboardingTask task;
  final VoidCallback? onDelete;
  final VoidCallback? onTap;

  const FocientTaskAddedCard({
    super.key,
    required this.task,
    this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : const Color(0xFFF8FAFC);

    final borderColor = isDark
        ? const Color(0xFF2563EB).withValues(alpha: 0.4)
        : const Color(0xFFBFDBFE);

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final timestampColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor, width: 1.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Task Title & Delete action
            Row(
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                    ),
                  ),
                ),
                if (onDelete != null)
                  InkWell(
                    onTap: onDelete,
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Icon(
                        Icons.close_rounded,
                        size: 16,
                        color: timestampColor,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),

            // 2. Timestamp (Tanggal task, Jam task)
            Text(
              task.formattedTimestamp,
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: timestampColor,
              ),
            ),
            const SizedBox(height: 12),

            // 3. Badges: Task Duration + Rest Duration + Category/Focus Type
            Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                // Task Duration Badge: e.g. 25" Task
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Text(
                    '${task.durationMinutes}" Task',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white : const Color(0xFF475569),
                    ),
                  ),
                ),

                // Category Badge (Dot + Name)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: task.categoryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: task.categoryColor.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: task.categoryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        task.categoryName,
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: task.categoryColor,
                        ),
                      ),
                    ],
                  ),
                ),

                // Focus Type Badge with unified canonical tokens
                if (task.focusType.isNotEmpty)
                  Builder(
                    builder: (context) {
                      final ft = FocusTypeExtension.fromString(task.focusType);
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: ft.backgroundColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: ft.borderColor.withValues(alpha: 0.35),
                          ),
                        ),
                        child: Text(
                          task.focusType,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: ft.textColor,
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
