import 'package:flutter/material.dart';

/// Pixel-perfect Google 'G' Logo painted with standard Google brand colors:
/// - Blue: #4285F4
/// - Green: #34A853
/// - Yellow: #FBBC05
/// - Red: #EA4335
class GoogleLogo extends StatelessWidget {
  final double size;

  const GoogleLogo({super.key, this.size = 20.0});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double scale = size.width / 24.0;
    canvas.save();
    canvas.scale(scale, scale);

    // Blue section: horizontal bar + top-right quadrant
    final bluePaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;
    final bluePath = Path()
      ..moveTo(23.745, 12.27)
      ..cubicTo(23.745, 11.48, 23.675, 10.73, 23.545, 10.01)
      ..lineTo(12.0, 10.01)
      ..lineTo(12.0, 14.78)
      ..lineTo(18.585, 14.78)
      ..cubicTo(18.3, 16.31, 17.43, 17.61, 16.13, 18.48)
      ..lineTo(16.13, 21.57)
      ..lineTo(20.09, 21.57)
      ..cubicTo(22.41, 19.43, 23.745, 16.15, 23.745, 12.27)
      ..close();
    canvas.drawPath(bluePath, bluePaint);

    // Green section: bottom curve
    final greenPaint = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.fill;
    final greenPath = Path()
      ..moveTo(12.0, 24.0)
      ..cubicTo(15.24, 24.0, 17.96, 22.92, 19.96, 21.07)
      ..lineTo(16.0, 17.98)
      ..cubicTo(14.9, 18.72, 13.51, 19.16, 12.0, 19.16)
      ..cubicTo(8.87, 19.16, 6.22, 17.06, 5.27, 14.21)
      ..lineTo(1.18, 14.21)
      ..lineTo(1.18, 17.39)
      ..cubicTo(3.26, 21.44, 7.31, 24.0, 12.0, 24.0)
      ..close();
    canvas.drawPath(greenPath, greenPaint);

    // Yellow section: bottom-left curve
    final yellowPaint = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.fill;
    final yellowPath = Path()
      ..moveTo(5.27, 14.21)
      ..cubicTo(5.03, 13.48, 4.9, 12.71, 4.9, 11.91)
      ..cubicTo(4.9, 11.11, 5.03, 10.34, 5.27, 9.61)
      ..lineTo(5.27, 6.43)
      ..lineTo(1.18, 6.43)
      ..cubicTo(0.43, 7.92, 0.0, 9.87, 0.0, 11.91)
      ..cubicTo(0.0, 13.95, 0.43, 15.9, 1.18, 17.39)
      ..lineTo(5.27, 14.21)
      ..close();
    canvas.drawPath(yellowPath, yellowPaint);

    // Red section: top curve
    final redPaint = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.fill;
    final redPath = Path()
      ..moveTo(12.0, 4.84)
      ..cubicTo(13.76, 4.84, 15.34, 5.45, 16.59, 6.64)
      ..lineTo(20.13, 3.1)
      ..cubicTo(17.96, 1.08, 15.24, 0.0, 12.0, 0.0)
      ..cubicTo(7.31, 0.0, 3.26, 2.56, 1.18, 6.61)
      ..lineTo(5.27, 9.79)
      ..cubicTo(6.22, 6.94, 8.87, 4.84, 12.0, 4.84)
      ..close();
    canvas.drawPath(redPath, redPaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
