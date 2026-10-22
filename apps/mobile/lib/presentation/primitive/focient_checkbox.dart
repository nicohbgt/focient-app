import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

/// FoCient Checkbox (<Checkbox/>)
///
/// Features guaranteed 48px x 48px touch hitbox and 150ms pop-in checkmark animation.
class FocientCheckbox extends StatefulWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;

  const FocientCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  State<FocientCheckbox> createState() => _FocientCheckboxState();
}

class _FocientCheckboxState extends State<FocientCheckbox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: FocientAnimationTokens.durationFast,
      value: widget.value ? 1.0 : 0.0,
    );
    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: FocientAnimationTokens.easeDecelerate),
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
  }

  @override
  void didUpdateWidget(FocientCheckbox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      if (widget.value) {
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

    return InkWell(
      onTap: widget.onChanged != null ? () => widget.onChanged!(!widget.value) : null,
      borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusSm),
      child: Container(
        width: 48,
        height: 48,
        alignment: Alignment.center,
        child: AnimatedContainer(
          duration: FocientAnimationTokens.durationFast,
          curve: FocientAnimationTokens.easeFluid,
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: widget.value
                ? (isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusSm),
            border: Border.all(
              color: widget.value
                  ? (isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase)
                  : (isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle),
              width: 1.5,
            ),
          ),
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: const Icon(
                Icons.check,
                size: 14,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
