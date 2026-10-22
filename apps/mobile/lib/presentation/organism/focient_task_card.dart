import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../primitive/focient_badge.dart';
import '../primitive/focient_button.dart';
import '../primitive/focient_checkbox.dart';

/// FoCient Task Card (<TaskCard/>)
///
/// Features 150ms opacity reduction to 0.6 on completion, strikethrough, and elevation shadows.
class FocientTaskCard extends StatelessWidget {
  final String id;
  final String title;
  final String? notes;
  final String? duration;
  final bool completed;
  final bool isFocusTop3;
  final ValueChanged<bool>? onToggleComplete;
  final VoidCallback? onEdit;

  const FocientTaskCard({
    super.key,
    required this.id,
    required this.title,
    this.notes,
    this.duration,
    this.completed = false,
    this.isFocusTop3 = false,
    this.onToggleComplete,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnimatedOpacity(
      duration: FocientAnimationTokens.durationFast,
      curve: FocientAnimationTokens.easeFluid,
      opacity: completed ? 0.6 : 1.0,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(FocientSpacingTokens.space4),
        decoration: BoxDecoration(
          color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
          borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
          border: Border.all(
            color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
            width: FocientBorderRadiusTokens.strokeRegular,
          ),
          boxShadow: FocientShadowTokens.shadow1,
        ),
        child: Row(
          children: [
            FocientCheckbox(
              value: completed,
              onChanged: onToggleComplete != null ? (val) => onToggleComplete!(val) : null,
            ),
            const SizedBox(width: FocientSpacingTokens.space3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      decoration: completed ? TextDecoration.lineThrough : null,
                      color: completed
                          ? (isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted)
                          : (isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold),
                    ),
                  ),
                  if (notes != null && notes!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      notes!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (duration != null || onEdit != null) const SizedBox(width: FocientSpacingTokens.space2),
            if (duration != null)
              FocientBadge(
                text: duration!,
                variant: isFocusTop3 ? FocientBadgeVariant.focus : FocientBadgeVariant.neutral,
              ),
            if (onEdit != null) ...[
              const SizedBox(width: FocientSpacingTokens.space2),
              FocientButton(
                size: FocientButtonSize.sm,
                variant: FocientButtonVariant.ghost,
                onPressed: onEdit,
                child: const Text('Ubah'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
