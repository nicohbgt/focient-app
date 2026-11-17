import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

enum FocientIconSize { xs, sm, md, lg, xl, xxl, xxxl, xxxxl }
enum FocientIconVariant { outline, filled }

/// FoCient Lucide-style Icon Widget
///
/// Features strict integration with FoCient icon-token specifications:
/// - Scaled using FocientIconTokens sizes (xs: 16px, sm: 24px, md: 32px, etc.)
/// - Supports outline and filled variants
class FocientIcon extends StatelessWidget {
  final IconData icon;
  final FocientIconSize size;
  final Color? color;
  final String? semanticLabel;

  const FocientIcon(
    this.icon, {
    super.key,
    this.size = FocientIconSize.sm,
    this.color,
    this.semanticLabel,
  });

  // Pre-configured Lucide Icon constants for Flutter
  static const IconData check = Icons.check_rounded;
  static const IconData checkCircle = Icons.check_circle_outline_rounded;
  static const IconData checkCircleFilled = Icons.check_circle_rounded;
  static const IconData clock = Icons.access_time_rounded;
  static const IconData calendar = Icons.calendar_today_rounded;
  static const IconData calendarClock = Icons.event_repeat_rounded;
  static const IconData target = Icons.gps_fixed_rounded;
  static const IconData sparkles = Icons.auto_awesome_rounded;
  static const IconData rotateCcw = Icons.replay_rounded;
  static const IconData play = Icons.play_arrow_rounded;
  static const IconData pause = Icons.pause_rounded;
  static const IconData pencil = Icons.edit_outlined;
  static const IconData trash = Icons.delete_outline_rounded;
  static const IconData plus = Icons.add_rounded;
  static const IconData x = Icons.close_rounded;
  static const IconData chevronDown = Icons.keyboard_arrow_down_rounded;
  static const IconData chevronRight = Icons.keyboard_arrow_right_rounded;
  static const IconData chevronLeft = Icons.keyboard_arrow_left_rounded;
  static const IconData arrowRight = Icons.arrow_forward_rounded;
  static const IconData arrowLeft = Icons.arrow_back_rounded;
  static const IconData search = Icons.search_rounded;
  static const IconData filter = Icons.tune_rounded;
  static const IconData tag = Icons.local_offer_outlined;
  static const IconData alertTriangle = Icons.warning_amber_rounded;
  static const IconData alertCircle = Icons.info_outline_rounded;
  static const IconData info = Icons.info_rounded;
  static const IconData barChart = Icons.bar_chart_rounded;
  static const IconData trendingUp = Icons.trending_up_rounded;
  static const IconData sun = Icons.light_mode_outlined;
  static const IconData moon = Icons.dark_mode_outlined;
  static const IconData bell = Icons.notifications_none_rounded;
  static const IconData gripVertical = Icons.drag_indicator_rounded;
  static const IconData layoutDashboard = Icons.dashboard_outlined;

  double _getPixelSize() {
    switch (size) {
      case FocientIconSize.xs:
        return FocientIconTokens.sizeXs; // 16px
      case FocientIconSize.sm:
        return FocientIconTokens.sizeSm; // 24px
      case FocientIconSize.md:
        return FocientIconTokens.sizeMd; // 32px
      case FocientIconSize.lg:
        return FocientIconTokens.sizeLg; // 36px
      case FocientIconSize.xl:
        return FocientIconTokens.sizeXl; // 40px
      case FocientIconSize.xxl:
        return FocientIconTokens.size2xl; // 48px
      case FocientIconSize.xxxl:
        return FocientIconTokens.size3xl; // 56px
      case FocientIconSize.xxxxl:
        return FocientIconTokens.size4xl; // 64px
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultColor = IconTheme.of(context).color ?? Theme.of(context).colorScheme.onSurface;

    return Icon(
      icon,
      size: _getPixelSize(),
      color: color ?? defaultColor,
      semanticLabel: semanticLabel,
    );
  }
}
