import 'package:flutter/material.dart';

/// FoCient Custom Rest Time per Task Slider (0 - 30 minutes)
///
/// Matches the design specifications from the onboarding mockups:
/// - Rounded pill track
/// - Active blue fill (#2563EB)
/// - Light blue inactive track (#DCEAFE)
/// - Interval dot markers at 0, 5, 10, 15, 20, 25, 30 minutes
/// - Smooth interactive touch & drag response
class FocientRestTimeSlider extends StatelessWidget {
  final int valueMinutes;
  final ValueChanged<int> onChanged;
  final int minMinutes;
  final int maxMinutes;
  final int stepMinutes;

  const FocientRestTimeSlider({
    super.key,
    required this.valueMinutes,
    required this.onChanged,
    this.minMinutes = 0,
    this.maxMinutes = 30,
    this.stepMinutes = 5,
  });

  void _handleTouch(Offset localPosition, double totalWidth) {
    if (totalWidth <= 0) return;
    final ratio = (localPosition.dx / totalWidth).clamp(0.0, 1.0);
    final totalSteps = (maxMinutes - minMinutes) ~/ stepMinutes;
    final stepIndex = (ratio * totalSteps).round();
    final newMinutes = (minMinutes + stepIndex * stepMinutes).clamp(minMinutes, maxMinutes);
    onChanged(newMinutes);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = const Color(0xFF2563EB);
    final trackColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFDCEAFE);
    final dotColor = isDark ? const Color(0xFF334155) : const Color(0xFF93C5FD);

    final totalRange = maxMinutes - minMinutes;
    final currentRatio = totalRange > 0
        ? ((valueMinutes - minMinutes) / totalRange).clamp(0.0, 1.0)
        : 0.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        const trackHeight = 12.0;
        final activeWidth = width * currentRatio;

        final numIntervals = totalRange ~/ stepMinutes;

        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onHorizontalDragUpdate: (details) =>
              _handleTouch(details.localPosition, width),
          onHorizontalDragStart: (details) =>
              _handleTouch(details.localPosition, width),
          onTapDown: (details) =>
              _handleTouch(details.localPosition, width),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            child: Stack(
              alignment: Alignment.centerLeft,
              children: [
                // Inactive Background Track with interval dots
                Container(
                  width: width,
                  height: trackHeight,
                  decoration: BoxDecoration(
                    color: trackColor,
                    borderRadius: BorderRadius.circular(trackHeight / 2),
                  ),
                ),

                // Interval Dots
                ...List.generate(numIntervals + 1, (index) {
                  final dotRatio = index / numIntervals;
                  final dotX = dotRatio * width;
                  final isPassed = dotRatio <= currentRatio;
                  return Positioned(
                    left: (dotX - 4).clamp(0.0, width - 8),
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isPassed ? Colors.white.withValues(alpha: 0.5) : dotColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                  );
                }),

                // Active Filled Track
                Container(
                  width: activeWidth,
                  height: trackHeight,
                  decoration: BoxDecoration(
                    color: activeColor,
                    borderRadius: BorderRadius.circular(trackHeight / 2),
                  ),
                ),

                // Thumb Dot at current position
                if (activeWidth > 0)
                  Positioned(
                    left: (activeWidth - 8).clamp(0.0, width - 16),
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: activeColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: activeColor.withValues(alpha: 0.4),
                            blurRadius: 4,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
