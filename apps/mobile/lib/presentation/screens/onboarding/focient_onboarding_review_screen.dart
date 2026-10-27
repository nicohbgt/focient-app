import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/onboarding_task.dart';
import '../../primitive/focient_button.dart';

/// FoCient Onboarding Step 5: Your first plan is complete Screen
///
/// Matches Image 1 specifications:
/// - Step indicator: "5 of 5 steps" with 100% linear progress bar
/// - Title & Subtitle: "Your first plan is complete"
/// - Today Workload Card:
///   - 60% - Optimal capacity indicator
///   - Capacity progress bar
///   - Show More toggle
///   - Top 3 Task Detail with priority dot and category badge
/// - Notification switch toggle
/// - "Start your Current Plan!" CTA
class FocientOnboardingReviewScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onStartPlan;
  final List<OnboardingTask> tasks;
  final int workCapacityMinutes;
  final int initialPercent;
  final String initialStatus;

  const FocientOnboardingReviewScreen({
    super.key,
    this.onBack,
    this.onStartPlan,
    required this.tasks,
    this.workCapacityMinutes = 480,
    this.initialPercent = 60,
    this.initialStatus = 'Optimal',
  });

  @override
  State<FocientOnboardingReviewScreen> createState() =>
      _FocientOnboardingReviewScreenState();
}

class _FocientOnboardingReviewScreenState
    extends State<FocientOnboardingReviewScreen> {
  bool _notificationEnabled = false;
  bool _showMore = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : FocientColorTokens.neutralBgCanvas;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final cardBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final borderColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFE2E8F0);

    // Calculate Workload based on Algoritma 1
    final totalTaskMinutes = widget.tasks.fold<int>(
      0,
      (sum, t) => sum + t.durationMinutes + (t.needsRestAfter ? t.restMinutes : 0),
    );

    final percent = widget.initialPercent;
    final statusText = widget.initialStatus;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation & Step Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (widget.onBack != null)
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                          color: titleColor,
                          onPressed: widget.onBack,
                          tooltip: 'Back',
                        )
                      else
                        const SizedBox(width: 40),
                      Expanded(
                        child: Center(
                          child: Text(
                            '5 of 5 steps',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: subtitleColor,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 40),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // 100% Linear Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: const LinearProgressIndicator(
                      value: 1.0, // Step 5 of 5
                      minHeight: 6,
                      backgroundColor: Color(0xFFE2E8F0),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFF2563EB),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    // Header Title (Centered)
                    Center(
                      child: Text(
                        'Your first plan is complete',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                          height: 1.25,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Subtitle (Centered)
                    Center(
                      child: Text(
                        "Let's review your latest task and give us\nthe notification permission",
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: subtitleColor,
                          height: 1.4,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Today Workload Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
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
                          const SizedBox(height: 10),

                          // 60% - Optimal
                          Text(
                            '$percent% - $statusText',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Capacity Progress Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: percent / 100.0,
                              minHeight: 8,
                              backgroundColor: const Color(0xFFEFF6FF),
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(0xFF0284C7),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Show More Toggle
                          InkWell(
                            onTap: () {
                              setState(() => _showMore = !_showMore);
                            },
                            child: Row(
                              children: [
                                Text(
                                  'Show More',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: subtitleColor,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Icon(
                                  _showMore
                                      ? Icons.keyboard_arrow_up_rounded
                                      : Icons.keyboard_arrow_down_rounded,
                                  size: 18,
                                  color: subtitleColor,
                                ),
                              ],
                            ),
                          ),

                          // Top 3 Task Detail
                          if (_showMore) ...[
                            const SizedBox(height: 16),
                            const Divider(height: 1),
                            const SizedBox(height: 16),
                            Text(
                              'Top 3 Task Detail',
                              style: TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: titleColor,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // List tasks or fallback mock OKR task
                            if (widget.tasks.isNotEmpty)
                              ...widget.tasks.map((task) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Row(
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
                                          task.title,
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
                                      // Category Badge
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
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
                                    ],
                                  ),
                                );
                              })
                            else
                              Row(
                                children: [
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
                                      'Create the Annual OKR',
                                      style: TextStyle(
                                        fontFamily: FocientTypographyTokens.fontFamily,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: titleColor,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF3E8FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        CircleAvatar(
                                          radius: 4,
                                          backgroundColor: Color(0xFF7C3AED),
                                        ),
                                        SizedBox(width: 6),
                                        Text(
                                          'Strategy',
                                          style: TextStyle(
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
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Notification Switch Toggle
                    Row(
                      children: [
                        Switch.adaptive(
                          value: _notificationEnabled,
                          activeColor: const Color(0xFF2563EB),
                          onChanged: (val) {
                            setState(() => _notificationEnabled = val);
                          },
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Notification',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: titleColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),

            // Bottom CTA "Start your Current Plan!" Button
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: SizedBox(
                width: double.infinity,
                child: FocientButton(
                  onPressed: widget.onStartPlan,
                  child: const Text(
                    'Start your Current Plan!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
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
