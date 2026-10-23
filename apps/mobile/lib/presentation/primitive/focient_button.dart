import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';

enum FocientButtonVariant { primary, secondary, ghost, outline }
enum FocientButtonSize { md, sm }

/// FoCient Interactive Button
///
/// Implements tactile scale(0.98) physical press confirmation with zero latency
/// and maximum contrast active state color shifts (#1E40AF for primary, #115E59 for secondary).
class FocientButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final Widget child;
  final FocientButtonVariant variant;
  final FocientButtonSize size;

  const FocientButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = FocientButtonVariant.primary,
    this.size = FocientButtonSize.md,
  });

  @override
  State<FocientButton> createState() => _FocientButtonState();
}

class _FocientButtonState extends State<FocientButton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: FocientAnimationTokens.durationFast,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: FocientAnimationTokens.easeFluid),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _backgroundColor(bool isDark) {
    if (widget.onPressed == null) {
      return (isDark ? FocientColorDarkTokens.neutralSurfaceMuted : FocientColorTokens.neutralSurfaceMuted);
    }
    if (_isPressed) {
      switch (widget.variant) {
        case FocientButtonVariant.primary:
          return isDark ? FocientColorDarkTokens.primaryBorderBold : FocientColorTokens.primaryBorderBold;
        case FocientButtonVariant.secondary:
          return isDark ? FocientColorDarkTokens.secondaryBorderBold : FocientColorTokens.secondaryBorderBold;
        case FocientButtonVariant.ghost:
        case FocientButtonVariant.outline:
          return isDark ? FocientColorDarkTokens.neutralSurfaceMuted : FocientColorTokens.neutralSurfaceMuted;
      }
    }
    switch (widget.variant) {
      case FocientButtonVariant.primary:
        return isDark ? FocientColorDarkTokens.primaryActionBase : FocientColorTokens.primaryActionBase;
      case FocientButtonVariant.secondary:
        return isDark ? FocientColorDarkTokens.secondaryActionBase : FocientColorTokens.secondaryActionBase;
      case FocientButtonVariant.ghost:
      case FocientButtonVariant.outline:
        return Colors.transparent;
    }
  }

  BorderSide _borderSide(bool isDark) {
    if (widget.variant == FocientButtonVariant.ghost || widget.variant == FocientButtonVariant.outline) {
      return BorderSide(
        color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
        width: FocientBorderRadiusTokens.strokeRegular,
      );
    }
    return BorderSide.none;
  }

  Color _textColor(bool isDark) {
    if (widget.onPressed == null) {
      return isDark ? FocientColorDarkTokens.neutralTextSubtle : FocientColorTokens.neutralTextSubtle;
    }
    switch (widget.variant) {
      case FocientButtonVariant.primary:
      case FocientButtonVariant.secondary:
        return Colors.white;
      case FocientButtonVariant.ghost:
      case FocientButtonVariant.outline:
        return isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final minHeight = widget.size == FocientButtonSize.md ? 48.0 : 32.0;
    final horizontalPadding = widget.size == FocientButtonSize.md ? FocientSpacingTokens.space4 : FocientSpacingTokens.space3;
    final radius = widget.size == FocientButtonSize.md ? FocientBorderRadiusTokens.radiusMd : FocientBorderRadiusTokens.radiusSm;

    return GestureDetector(
      onTapDown: (_) {
        if (widget.onPressed != null) {
          setState(() => _isPressed = true);
          _controller.forward();
        }
      },
      onTapUp: (_) {
        if (widget.onPressed != null) {
          setState(() => _isPressed = false);
          _controller.reverse();
        }
      },
      onTapCancel: () {
        if (widget.onPressed != null) {
          setState(() => _isPressed = false);
          _controller.reverse();
        }
      },
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: OutlinedButton(
          onPressed: widget.onPressed,
          style: OutlinedButton.styleFrom(
            minimumSize: Size(minHeight, minHeight),
            backgroundColor: _backgroundColor(isDark),
            foregroundColor: _textColor(isDark),
            side: _borderSide(isDark),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(radius),
            ),
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            textStyle: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontWeight: FontWeight.w600,
              fontSize: widget.size == FocientButtonSize.md ? 14 : 12,
            ),
          ),
          child: widget.child,
        ),
      ),
    );
  }
}
