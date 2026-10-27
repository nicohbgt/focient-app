import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/auth_state.dart';
import '../../organism/focient_daily_capacity_meter.dart';
import '../../organism/focient_task_card.dart';
import '../../primitive/focient_badge.dart';
import '../../primitive/focient_button.dart';
import '../../riverpod_providers.dart';

class FocientDashboardScreen extends ConsumerWidget {
  const FocientDashboardScreen({super.key});

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
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
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final tasks = ref.watch(taskListProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : FocientColorTokens.neutralTextBold;

    final mutedColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final allocatedMinutes = tasks
        .where((t) => !t.isCompleted)
        .fold<int>(0, (sum, t) => sum + t.durationMinutes);

    return Scaffold(
      backgroundColor: isDark
          ? FocientColorDarkTokens.neutralBgCanvas
          : FocientColorTokens.neutralBgCanvas,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: FocientColorTokens.primaryActionBase,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                user != null && user.name.isNotEmpty ? user.name[0].toUpperCase() : 'F',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    user?.name ?? 'FoCient Member',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: titleColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    user?.email ?? 'user@focient.dev',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 12,
                      color: mutedColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF64748B)),
            tooltip: 'Log Out',
            onPressed: () => _confirmLogout(context, ref),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: FocientSpacingTokens.space5,
            vertical: FocientSpacingTokens.space4,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(FocientSpacingTokens.space5),
                decoration: BoxDecoration(
                  color: isDark
                      ? FocientColorDarkTokens.primaryBgSubtle
                      : FocientColorTokens.primaryBgSubtle,
                  borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
                  border: Border.all(
                    color: isDark
                        ? FocientColorDarkTokens.primaryBorderSubtle
                        : FocientColorTokens.primaryBorderSubtle,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          size: 20,
                          color: FocientColorTokens.primaryActionBase,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Account Authenticated',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: FocientColorTokens.primaryTextBold,
                          ),
                        ),
                        const Spacer(),
                        FocientBadge(
                          text: user?.roleArchetype ?? 'Software Engineer',
                          variant: FocientBadgeVariant.focus,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Welcome to your guilt-free focus workflow. Single-task rhythm and respectful pacing are active.',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        color: mutedColor,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: FocientSpacingTokens.space5),

              // Daily Capacity Meter
              Text(
                'Workload & Capacity',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 8),
              FocientDailyCapacityMeter(
                allocatedMinutes: allocatedMinutes,
                totalCapacityMinutes: user?.dailyCapacityMinutes ?? 480,
              ),

              const SizedBox(height: FocientSpacingTokens.space5),

              // Focus Top-3 Tasks Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Top 3 Focus Tasks',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: titleColor,
                    ),
                  ),
                  const FocientBadge(
                    text: 'Max 3 Slots',
                    variant: FocientBadgeVariant.neutral,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: tasks.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final task = tasks[index];
                  return FocientTaskCard(
                    id: task.id,
                    title: task.title,
                    duration: '${task.durationMinutes}m',
                    completed: task.isCompleted,
                    isFocusTop3: index < 3,
                    onToggleComplete: (_) {
                      ref.read(taskListProvider.notifier).toggleTask(task.id);
                    },
                  );
                },
              ),

              const SizedBox(height: FocientSpacingTokens.space6),

              // Action to switch / re-test auth flow
              Center(
                child: TextButton.icon(
                  onPressed: () => _confirmLogout(context, ref),
                  icon: const Icon(Icons.arrow_back_rounded, size: 16),
                  label: const Text('Log out & return to Login / Register'),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF64748B),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
