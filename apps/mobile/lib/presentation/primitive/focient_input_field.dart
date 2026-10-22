import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// FoCient Text Input Field
///
/// Touch target: 48px height on mobile.
class FocientInputField extends StatelessWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? errorText;
  final ValueChanged<String>? onChanged;

  const FocientInputField({
    super.key,
    this.controller,
    this.label,
    this.hintText,
    this.errorText,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space1),
        ],
        SizedBox(
          height: 48.0,
          child: TextField(
            controller: controller,
            onChanged: onChanged,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 14,
              color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
            ),
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: TextStyle(
                color: isDark ? FocientColorDarkTokens.neutralTextSubtle : FocientColorTokens.neutralTextSubtle,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: FocientSpacingTokens.space4,
                vertical: FocientSpacingTokens.space2,
              ),
              filled: true,
              fillColor: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                borderSide: BorderSide(
                  color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
                  width: FocientBorderRadiusTokens.strokeRegular,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                borderSide: BorderSide(
                  color: isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase,
                  width: FocientBorderRadiusTokens.strokeBold,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                borderSide: BorderSide(
                  color: isDark ? FocientColorDarkTokens.dangerActionBase : FocientColorTokens.dangerActionBase,
                  width: FocientBorderRadiusTokens.strokeRegular,
                ),
              ),
            ),
          ),
        ),
        if (errorText != null) ...[
          const SizedBox(height: 2),
          Text(
            errorText!,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? FocientColorDarkTokens.dangerActionBase : FocientColorTokens.dangerActionBase,
            ),
          ),
        ],
      ],
    );
  }
}
