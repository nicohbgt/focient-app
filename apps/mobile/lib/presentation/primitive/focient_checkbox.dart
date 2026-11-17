import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// FoCient Checkbox (<Checkbox/>)
///
/// Features guaranteed 48px x 48px touch hitbox, 150ms pop-in checkmark animation,
/// tactile scale(0.92) press feedback, and guilt-free Amber "Needs Adjustment" state.
class FocientCheckbox extends StatefulWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final bool indeterminate;
  final bool needsAdjustment;

  const FocientCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    this.indeterminate = false,
    this.needsAdjustment = false,
  });

  @override
  State<FocientCheckbox> createState() => _FocientCheckboxState();
}

class _FocientCheckboxState extends State<FocientCheckbox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: FocientAnimationTokens.durationFast,
      value: (widget.value || widget.indeterminate || widget.needsAdjustment) ? 1.0 : 0.0,
    );
    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: FocientAnimationTokens.easeDecelerate),
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
  }

  @override
  void didUpdateWidget(FocientCheckbox oldWidget) {
    super.didUpdateWidget(oldWidget);
    final isFilled = widget.value || widget.indeterminate || widget.needsAdjustment;
    final wasFilled = oldWidget.value || oldWidget.indeterminate || oldWidget.needsAdjustment;
    if (isFilled != wasFilled) {
      if (isFilled) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color boxBgColor;
    Color boxBorderColor;

    if (widget.needsAdjustment) {
      boxBgColor = isDark ? FocientColorDarkTokens.warningBgSubtle : FocientColorTokens.warningBgSubtle;
      boxBorderColor = isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase;
    } else if (widget.value || widget.indeterminate) {
      boxBgColor = isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase;
      boxBorderColor = isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase;
    } else {
      boxBgColor = Colors.transparent;
      boxBorderColor = isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle;
    }

    Widget contentIcon;
    if (widget.needsAdjustment) {
      contentIcon = Icon(
        Icons.sync,
        size: 14,
        color: isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase,
      );
    } else if (widget.indeterminate) {
      contentIcon = const Icon(
        Icons.remove,
        size: 14,
        color: Colors.white,
      );
    } else {
      contentIcon = const Icon(
        Icons.check,
        size: 14,
        color: Colors.white,
      );
    }

    return GestureDetector(
      onTapDown: (_) => widget.onChanged != null ? setState(() => _isPressed = true) : null,
      onTapUp: (_) => widget.onChanged != null ? setState(() => _isPressed = false) : null,
      onTapCancel: () => widget.onChanged != null ? setState(() => _isPressed = false) : null,
      child: InkWell(
        onTap: widget.onChanged != null ? () => widget.onChanged!(!widget.value) : null,
        borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusSm),
        child: Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          child: AnimatedScale(
            scale: _isPressed ? 0.92 : 1.0,
            duration: const Duration(milliseconds: 100),
            curve: FocientAnimationTokens.easeFluid,
            child: AnimatedContainer(
              duration: FocientAnimationTokens.durationFast,
              curve: FocientAnimationTokens.easeFluid,
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: boxBgColor,
                borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusSm),
                border: Border.all(
                  color: boxBorderColor,
                  width: 1.5,
                ),
              ),
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: contentIcon,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
