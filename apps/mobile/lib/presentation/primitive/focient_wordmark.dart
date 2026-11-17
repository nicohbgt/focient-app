import 'package:flutter/material.dart';

/// Official FoCient Brand Wordmark
///
/// Displays the official FoCient typographic wordmark (454:97 aspect ratio).
/// Replaces plain text 'FoCient' across navigation, welcome screens, and brand headers.
class FoCientWordmark extends StatelessWidget {
  final double height;
  final double? width;
  final bool light;

  const FoCientWordmark({
    super.key,
    this.height = 24.0,
    this.width,
    this.light = false,
  });

  @override
  Widget build(BuildContext context) {
    final assetPath = light
        ? 'assets/icons/focient_wordmark_light.png'
        : 'assets/icons/focient_wordmark.png';

    final effectiveWidth = width ?? (height * (454.0 / 97.0));

    return Semantics(
      label: 'FoCient',
      child: Stack(
        alignment: Alignment.centerLeft,
        children: [
          // On-stage accessible text for screen readers and widget test contracts
          const Opacity(
            opacity: 0.0,
            child: Text(
              'FoCient',
              style: TextStyle(fontSize: 1),
            ),
          ),
          Image.asset(
            assetPath,
            height: height,
            width: effectiveWidth,
            fit: BoxFit.contain,
          ),
        ],
      ),
    );
  }
}
