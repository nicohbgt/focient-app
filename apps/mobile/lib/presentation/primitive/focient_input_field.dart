import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// FoCient Text Input Field (<FocientInputField/>)
///
/// Implements FoCient Validation Standards:
/// - isInvalid: true applies border --color-danger-action-base (#E11D48)
/// - isWarning: true applies Amber border (warningActionBase)
/// - isNumeric: true enforces tabular numbers (FontFeature.tabularFigures())
/// - WCAG 2.1 AAA Accessibility: Semantics for screen readers
/// - Touch target: 48px height on mobile
class FocientInputField extends StatelessWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? errorText;
  final bool isInvalid;
  final String? warningText;
  final bool isWarning;
  final bool isNumeric;
  final String? unit;
  final bool enabled;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onEditingComplete;

  const FocientInputField({
    super.key,
    this.controller,
    this.label,
    this.hintText,
    this.errorText,
    this.isInvalid = false,
    this.warningText,
    this.isWarning = false,
    this.isNumeric = false,
    this.unit,
    this.enabled = true,
    this.keyboardType,
    this.onChanged,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasError = isInvalid || (errorText != null && errorText!.isNotEmpty);
    final hasWarning = !hasError && (isWarning || (warningText != null && warningText!.isNotEmpty));

    final effectiveKeyboardType = keyboardType ?? (isNumeric ? TextInputType.number : TextInputType.text);

    final errorColor = isDark
        ? FocientColorDarkTokens.dangerActionBase
        : FocientColorTokens.dangerActionBase;

    final warningColor = isDark
        ? FocientColorDarkTokens.warningActionBase
        : FocientColorTokens.warningActionBase;

    final defaultBorderColor = isDark
        ? FocientColorDarkTokens.neutralBorderSubtle
        : FocientColorTokens.neutralBorderSubtle;

    final focusedBorderColor = isDark
        ? FocientColorDarkTokens.primaryActionBase
        : FocientColorTokens.primaryActionBase;

    final activeBorderColor = hasError
        ? errorColor
        : hasWarning
            ? warningColor
            : defaultBorderColor;

    return Semantics(
      label: label,
      textField: true,
      enabled: enabled,
      child: Column(
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
                color: isDark
                    ? FocientColorDarkTokens.neutralTextMuted
                    : FocientColorTokens.neutralTextMuted,
              ),
            ),
            const SizedBox(height: FocientSpacingTokens.space1),
          ],
          SizedBox(
            height: 48.0,
            child: TextField(
              controller: controller,
              enabled: enabled,
              keyboardType: effectiveKeyboardType,
              onChanged: onChanged,
              onEditingComplete: onEditingComplete,
              cursorColor: isDark
                  ? FocientColorDarkTokens.primaryActionBase
                  : FocientColorTokens.primaryActionBase,
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontFeatures: isNumeric ? const [FontFeature.tabularFigures()] : null,
                color: isDark
                    ? FocientColorDarkTokens.neutralTextBold
                    : FocientColorTokens.neutralTextBold,
              ),
              decoration: InputDecoration(
                hintText: hintText,
                hintStyle: TextStyle(
                  color: isDark
                      ? FocientColorDarkTokens.neutralTextSubtle
                      : FocientColorTokens.neutralTextSubtle,
                ),
                suffixIcon: unit != null
                    ? Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12.0),
                        child: Align(
                          alignment: Alignment.centerRight,
                          widthFactor: 1.0,
                          child: Text(
                            unit!,
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              fontFeatures: const [FontFeature.tabularFigures()],
                              color: isDark
                                  ? FocientColorDarkTokens.neutralTextMuted
                                  : FocientColorTokens.neutralTextMuted,
                            ),
                          ),
                        ),
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: FocientSpacingTokens.space4,
                  vertical: FocientSpacingTokens.space2,
                ),
                filled: true,
                fillColor: isDark
                    ? FocientColorDarkTokens.neutralSurfaceCard
                    : FocientColorTokens.neutralSurfaceCard,
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                  borderSide: BorderSide(
                    color: activeBorderColor,
                    width: hasError || hasWarning
                        ? FocientBorderRadiusTokens.strokeBold
                        : FocientBorderRadiusTokens.strokeRegular,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                  borderSide: BorderSide(
                    color: hasError
                        ? errorColor
                        : hasWarning
                            ? warningColor
                            : focusedBorderColor,
                    width: FocientBorderRadiusTokens.strokeBold,
                  ),
                ),
              ),
            ),
          ),
          if (hasError && errorText != null) ...[
            const SizedBox(height: 4),
            Text(
              errorText!,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? FocientColorDarkTokens.dangerTextBold
                    : FocientColorTokens.dangerTextBold,
              ),
            ),
          ] else if (hasWarning && warningText != null) ...[
            const SizedBox(height: 4),
            Text(
              warningText!,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? FocientColorDarkTokens.warningTextBold
                    : FocientColorTokens.warningTextBold,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
