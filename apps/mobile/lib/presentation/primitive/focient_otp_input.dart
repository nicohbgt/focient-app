import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// 6-Digit OTP Box Entry Component (<FocientOtpInput/>)
///
/// Implements:
/// - Exact 6-box rounded visual layout matching FoCient design spec
/// - Placeholder "0" in subtle text color when empty (as seen in mobile mocks)
/// - Auto-advance focus on typing digit
/// - Auto-retreat focus on backspace
/// - Clipboard paste support for full 6-digit codes
/// - Tabular figures typography for clean numeric presentation
class FocientOtpInput extends StatefulWidget {
  final int length;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;
  final bool isInvalid;
  final bool enabled;
  final String? initialValue;

  const FocientOtpInput({
    super.key,
    this.length = 6,
    this.onChanged,
    this.onCompleted,
    this.isInvalid = false,
    this.enabled = true,
    this.initialValue,
  });

  @override
  State<FocientOtpInput> createState() => FocientOtpInputState();
}

class FocientOtpInputState extends State<FocientOtpInput> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
      (index) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
      (index) => FocusNode(),
    );

    if (widget.initialValue != null && widget.initialValue!.isNotEmpty) {
      setOtpCode(widget.initialValue!);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get currentCode => _controllers.map((c) => c.text).join();

  void clear() {
    for (final c in _controllers) {
      c.clear();
    }
    if (_focusNodes.isNotEmpty) {
      _focusNodes[0].requestFocus();
    }
    widget.onChanged?.call('');
  }

  void setOtpCode(String code) {
    final digits = code.replaceAll(RegExp(r'\D'), '');
    for (int i = 0; i < widget.length; i++) {
      if (i < digits.length) {
        _controllers[i].text = digits[i];
      } else {
        _controllers[i].text = '';
      }
    }
    final full = currentCode;
    widget.onChanged?.call(full);
    if (full.length == widget.length) {
      widget.onCompleted?.call(full);
      _focusNodes[widget.length - 1].unfocus();
    } else if (digits.length < widget.length) {
      _focusNodes[digits.length].requestFocus();
    }
  }

  void _onFieldChanged(String value, int index) {
    if (!widget.enabled) return;

    // Handle paste of multiple characters
    if (value.length > 1) {
      setOtpCode(value);
      return;
    }

    if (value.isNotEmpty) {
      // Advance to next box if available
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
      }
    }

    final code = currentCode;
    widget.onChanged?.call(code);
    if (code.length == widget.length) {
      widget.onCompleted?.call(code);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final defaultBorder = isDark
        ? FocientColorDarkTokens.neutralBorderSubtle
        : FocientColorTokens.neutralBorderSubtle;

    final focusedBorder = isDark
        ? FocientColorDarkTokens.primaryActionBase
        : FocientColorTokens.primaryActionBase;

    final errorBorder = isDark
        ? FocientColorDarkTokens.dangerActionBase
        : FocientColorTokens.dangerActionBase;

    final activeBorderColor = widget.isInvalid ? errorBorder : defaultBorder;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(widget.length, (index) {
        return _buildDigitBox(
          index: index,
          isDark: isDark,
          defaultBorder: activeBorderColor,
          focusedBorder: widget.isInvalid ? errorBorder : focusedBorder,
        );
      }),
    );
  }

  Widget _buildDigitBox({
    required int index,
    required bool isDark,
    required Color defaultBorder,
    required Color focusedBorder,
  }) {
    final controller = _controllers[index];
    final focusNode = _focusNodes[index];

    return AnimatedBuilder(
      animation: Listenable.merge([controller, focusNode]),
      builder: (context, _) {
        final hasFocus = focusNode.hasFocus;

        return KeyboardListener(
          focusNode: FocusNode(skipTraversal: true),
          onKeyEvent: (event) {
            // Check for backspace key to navigate backwards when empty
            if (event is KeyDownEvent &&
                event.logicalKey == LogicalKeyboardKey.backspace &&
                controller.text.isEmpty &&
                index > 0) {
              _focusNodes[index - 1].requestFocus();
              _controllers[index - 1].text = '';
              widget.onChanged?.call(currentCode);
            }
          },
          child: Container(
            width: 48,
            height: 58,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isDark
                  ? FocientColorDarkTokens.neutralSurfaceCard
                  : FocientColorTokens.neutralSurfaceCard,
              borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
              border: Border.all(
                color: hasFocus ? focusedBorder : defaultBorder,
                width: hasFocus
                    ? FocientBorderRadiusTokens.strokeBold
                    : FocientBorderRadiusTokens.strokeRegular,
              ),
              boxShadow: hasFocus
                  ? [
                      BoxShadow(
                        color: (isDark
                                ? FocientColorDarkTokens.primaryActionBase
                                : FocientColorTokens.primaryActionBase)
                            .withValues(alpha: 0.12),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              enabled: widget.enabled,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 1,
              showCursor: hasFocus,
              cursorColor: isDark
                  ? FocientColorDarkTokens.primaryActionBase
                  : FocientColorTokens.primaryActionBase,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
              ],
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: isDark
                    ? FocientColorDarkTokens.neutralTextBold
                    : FocientColorTokens.neutralTextBold,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
              decoration: InputDecoration(
                counterText: '',
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                hintText: hasFocus ? '' : '0',
                hintStyle: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 20,
                  fontWeight: FontWeight.w400,
                  color: isDark
                      ? FocientColorDarkTokens.neutralTextSubtle
                      : FocientColorTokens.neutralTextSubtle,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
              onChanged: (val) => _onFieldChanged(val, index),
            ),
          ),
        );
      },
    );
  }
}
