import 'package:flutter/material.dart';

/// Official FoCient Brand Logo
///
/// Minimalist segmented lowercase 'f' representing dynamic cognitive rhythm,
/// adaptive focus flow, and guilt-free productivity.
class FoCientLogo extends StatelessWidget {
  final double size;
  final Color? color;
  final bool withBackground;
  final Color? backgroundColor;
  final double borderRadius;

  const FoCientLogo({
    super.key,
    this.size = 40.0,
    this.color,
    this.withBackground = false,
    this.backgroundColor,
    this.borderRadius = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? const Color(0xFF2563EB);
    final logoColor = color ?? (withBackground ? Colors.white : const Color(0xFF2563EB));

    if (!withBackground) {
      final double width = size * (220.0 / 492.0);
      return SizedBox(
        width: width,
        height: size,
        child: CustomPaint(
          painter: _FoCientLogoPainter(color: logoColor),
        ),
      );
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F2563EB),
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: SizedBox(
          width: size * 0.7,
          height: size * 0.7,
          child: CustomPaint(
            painter: _FoCientLogoPainter(color: logoColor),
          ),
        ),
      ),
    );
  }
}

class _FoCientLogoPainter extends CustomPainter {
  final Color color;

  _FoCientLogoPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // ViewBox is [minX: 138, minY: 11, width: 220, height: 492]
    // Normalized to maintain aspect ratio centered inside size
    const double srcMinX = 138.0;
    const double srcMinY = 11.0;
    const double srcW = 220.0;
    const double srcH = 492.0;

    final double scale = (size.width / srcW < size.height / srcH)
        ? size.width / srcW
        : size.height / srcH;

    final double dx = (size.width - srcW * scale) / 2.0 - srcMinX * scale;
    final double dy = (size.height - srcH * scale) / 2.0 - srcMinY * scale;

    canvas.save();
    canvas.translate(dx, dy);
    canvas.scale(scale, scale);

    final path = Path();

    // Segment 1 (Top right horizontal arch)
    path.moveTo(266, 16);
    path.lineTo(304, 18);
    path.lineTo(335, 27);
    path.lineTo(327, 49);
    path.lineTo(303, 41);
    path.lineTo(267, 39);
    path.lineTo(265, 17);
    path.close();

    // Segment 2 (Upper right arc)
    path.moveTo(236, 23);
    path.lineTo(239, 24);
    path.lineTo(246, 44);
    path.lineTo(216, 60);
    path.lineTo(194, 81);
    path.lineTo(177, 66);
    path.lineTo(206, 39);
    path.lineTo(235, 24);
    path.close();

    // Segment 3 (Upper vertical curve)
    path.moveTo(167, 82);
    path.lineTo(185, 94);
    path.lineTo(173, 118);
    path.lineTo(167, 142);
    path.lineTo(146, 139);
    path.lineTo(153, 111);
    path.lineTo(167, 83);
    path.close();

    // Segment 4 (Middle stem above junction)
    path.moveTo(154, 163);
    path.lineTo(166, 163);
    path.lineTo(170, 190);
    path.lineTo(191, 241);
    path.lineTo(197, 272);
    path.lineTo(186, 274);
    path.lineTo(175, 272);
    path.lineTo(171, 248);
    path.lineTo(148, 189);
    path.lineTo(145, 164);
    path.lineTo(153, 164);
    path.close();

    // Segment 5 (Outer crossbar curve)
    path.moveTo(290, 225);
    path.lineTo(319, 229);
    path.lineTo(353, 243);
    path.lineTo(341, 263);
    path.lineTo(313, 251);
    path.lineTo(290, 248);
    path.lineTo(290, 226);
    path.close();

    // Segment 6 (Inner crossbar extending from stem)
    path.moveTo(262, 229);
    path.lineTo(269, 251);
    path.lineTo(242, 264);
    path.lineTo(219, 286);
    path.lineTo(201, 272);
    path.lineTo(228, 246);
    path.lineTo(248, 234);
    path.lineTo(261, 230);
    path.close();

    // Segment 7 (Lower stem)
    path.moveTo(176, 295);
    path.lineTo(197, 297);
    path.lineTo(191, 329);
    path.lineTo(169, 383);
    path.lineTo(164, 411);
    path.lineTo(143, 409);
    path.lineTo(149, 377);
    path.lineTo(167, 334);
    path.lineTo(176, 296);
    path.close();

    // Segment 8 (Bottom curved tail)
    path.moveTo(164, 431);
    path.lineTo(170, 460);
    path.lineTo(183, 488);
    path.lineTo(164, 498);
    path.lineTo(150, 467);
    path.lineTo(144, 433);
    path.lineTo(163, 432);
    path.close();

    canvas.drawPath(path, paint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _FoCientLogoPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
