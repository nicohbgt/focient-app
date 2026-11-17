import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

enum FocientBadgeVariant { focus, neutral, accent, warning }

/// FoCient Badge / Tag (<Badge/>)
///
/// Pill shaped container using tabular-figures font features for clean time/metrics alignment.
class FocientBadge extends StatelessWidget {
  final String text;
  final FocientBadgeVariant variant;

  const FocientBadge({
    super.key,
    required this.text,
    this.variant = FocientBadgeVariant.neutral,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color border;
    Color textColor;

    switch (variant) {
      case FocientBadgeVariant.focus:
        bg = isDark ? FocientColorDarkTokens.primaryBgSubtle : FocientColorTokens.primaryBgSubtle;
        border = isDark ? FocientColorDarkTokens.primaryBorderSubtle : FocientColorTokens.primaryBorderSubtle;
        textColor = isDark ? FocientColorDarkTokens.primaryTextBold : FocientColorTokens.primaryTextBold;
        break;
      case FocientBadgeVariant.neutral:
        bg = isDark ? FocientColorDarkTokens.neutralBgCanvas : FocientColorTokens.neutralBgCanvas;
        border = isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle;
        textColor = isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted;
        break;
      case FocientBadgeVariant.accent:
        bg = isDark ? FocientColorDarkTokens.accentBgSubtle : FocientColorTokens.accentBgSubtle;
        border = isDark ? FocientColorDarkTokens.accentBorderSubtle : FocientColorTokens.accentBorderSubtle;
        textColor = isDark ? FocientColorDarkTokens.accentTextBold : FocientColorTokens.accentTextBold;
        break;
      case FocientBadgeVariant.warning:
        bg = isDark ? FocientColorDarkTokens.warningBgSubtle : FocientColorTokens.warningBgSubtle;
        border = isDark ? FocientColorDarkTokens.warningBorderSubtle : FocientColorTokens.warningBorderSubtle;
        textColor = isDark ? FocientColorDarkTokens.warningTextBold : FocientColorTokens.warningTextBold;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FocientSpacingTokens.space2,
        vertical: FocientSpacingTokens.space1,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusFull),
        border: Border.all(color: border, width: 1.0),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: FocientTypographyTokens.fontFamily,
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: textColor,
          fontFeatures: const [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}
