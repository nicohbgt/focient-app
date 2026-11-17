import 'dart:math';
import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// FoCient Daily Capacity Meter (<DailyCapacityMeter/>)
///
/// Visualizes daily work hours against limits with guilt-free amber warning for overload.
class FocientDailyCapacityMeter extends StatelessWidget {
  final int allocatedMinutes;
  final int totalCapacityMinutes;
  final void Function(int allocated, int capacity)? onOverloadDetected;

  const FocientDailyCapacityMeter({
    super.key,
    required this.allocatedMinutes,
    required this.totalCapacityMinutes,
    this.onOverloadDetected,
  });

  String _formatHours(int minutes) {
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (mins == 0) return '${hours}j';
    return '${hours}j ${mins}m';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = max(1, totalCapacityMinutes);
    final ratio = (allocatedMinutes / total).clamp(0.0, 1.0);
    final percentage = (ratio * 100).round();

    Color fillColor;
    String statusLabel;

    if (percentage < 50) {
      fillColor = isDark ? FocientColorDarkTokens.secondaryTrackBase : FocientColorTokens.secondaryTrackBase;
      statusLabel = 'Ringan';
    } else if (percentage <= 75) {
      fillColor = isDark ? FocientColorDarkTokens.secondaryActionBase : FocientColorTokens.secondaryActionBase;
      statusLabel = 'Optimal';
    } else if (percentage <= 90) {
      fillColor = isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase;
      statusLabel = 'Mendekati Kapasitas';
    } else {
      fillColor = isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase;
      statusLabel = 'Kapasitas Penuh';
      WidgetsBinding.instance.addPostFrameCallback((_) {
        onOverloadDetected?.call(allocatedMinutes, totalCapacityMinutes);
      });
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Beban Kerja Harian ($statusLabel)',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
              ),
            ),
            Text(
              '${_formatHours(allocatedMinutes)} / ${_formatHours(totalCapacityMinutes)} ($percentage%)',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
        const SizedBox(height: FocientSpacingTokens.space2),
        ClipRRect(
          borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusFull),
          child: Container(
            height: 8.0,
            width: double.infinity,
            color: percentage < 50
                ? (isDark ? FocientColorDarkTokens.secondaryBgSubtle : FocientColorTokens.secondaryBgSubtle)
                : const Color(0xFFE2E8F0),
            child: Stack(
              children: [
                AnimatedFractionallySizedBox(
                  duration: FocientAnimationTokens.durationDeliberate,
                  curve: FocientAnimationTokens.easeFluid,
                  widthFactor: ratio,
                  alignment: Alignment.centerLeft,
                  child: Container(
                    decoration: BoxDecoration(
                      color: fillColor,
                      borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusFull),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
