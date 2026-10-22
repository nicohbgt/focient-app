import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../primitive/focient_button.dart';

/// FoCient Adaptive Reschedule Banner / Bottom Sheet (<RescheduleAlert/>)
///
/// Strictly adheres to empathetic, guilt-free language:
/// - Label: "Perlu Penyesuaian Jadwal"
/// - Avoids punitive words like "Terlambat", "Gagal", or "Missed".
class FocientRescheduleAlert extends StatelessWidget {
  final String description;
  final VoidCallback onApply;
  final VoidCallback onDismiss;

  const FocientRescheduleAlert({
    super.key,
    this.description = 'Kapasitas harian memerlukan penyeimbangan alur waktu agar fokus tetap tenang.',
    required this.onApply,
    required this.onDismiss,
  });

  /// Displays the empathetic Bottom Sheet on mobile platforms
  static Future<void> showSheet({
    required BuildContext context,
    String description = 'Kapasitas harian memerlukan penyeimbangan alur waktu agar fokus tetap tenang.',
    required VoidCallback onApply,
    required VoidCallback onDismiss,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FocientBorderRadiusTokens.radiusXl),
        ),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(
            FocientSpacingTokens.space4,
            FocientSpacingTokens.space3,
            FocientSpacingTokens.space4,
            FocientSpacingTokens.space6,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
                    borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusFull),
                  ),
                ),
              ),
              const SizedBox(height: FocientSpacingTokens.space4),
              Text(
                'Perlu Penyesuaian Jadwal',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? FocientColorDarkTokens.secondaryTextBold : FocientColorTokens.secondaryTextBold,
                ),
              ),
              const SizedBox(height: FocientSpacingTokens.space1),
              Text(
                description,
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 14,
                  color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                ),
              ),
              const SizedBox(height: FocientSpacingTokens.space5),
              Row(
                children: [
                  Expanded(
                    child: FocientButton(
                      variant: FocientButtonVariant.secondary,
                      onPressed: () {
                        Navigator.pop(ctx);
                        onApply();
                      },
                      child: const Text('Terapkan Penyesuaian'),
                    ),
                  ),
                  const SizedBox(width: FocientSpacingTokens.space2),
                  FocientButton(
                    variant: FocientButtonVariant.ghost,
                    onPressed: () {
                      Navigator.pop(ctx);
                      onDismiss();
                    },
                    child: const Text('Nanti Saja'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(FocientSpacingTokens.space4),
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.secondaryBgSubtle : FocientColorTokens.secondaryBgSubtle,
        borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
        border: Border.all(
          color: isDark ? FocientColorDarkTokens.secondaryBorderSubtle : FocientColorTokens.secondaryBorderSubtle,
          width: FocientBorderRadiusTokens.strokeRegular,
        ),
        boxShadow: FocientShadowTokens.shadow2,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Perlu Penyesuaian Jadwal',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isDark ? FocientColorDarkTokens.secondaryTextBold : FocientColorTokens.secondaryTextBold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            description,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space3),
          Row(
            children: [
              FocientButton(
                size: FocientButtonSize.sm,
                variant: FocientButtonVariant.secondary,
                onPressed: onApply,
                child: const Text('Terapkan Penyesuaian'),
              ),
              const SizedBox(width: FocientSpacingTokens.space2),
              FocientButton(
                size: FocientButtonSize.sm,
                variant: FocientButtonVariant.ghost,
                onPressed: onDismiss,
                child: const Text('Nanti Saja / Abaikan'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
