import 'dart:ui';
import 'package:flutter/material.dart';

/// FoCient Single Typeface Standard (100% Inter Font Family)
/// Strict 3-Tier Weight Restriction:
/// - Regular: 400 (Body, guidance copy)
/// - Medium: 500 (Labels, buttons, navigation, status badges)
/// - SemiBold: 600 (Display, headings H1-H3, primary CTAs)
/// (Bold 700+, ExtraBold, and Black strictly forbidden)
class FocientTheme {
  static const String fontFamily = 'Inter';
  static const List<String> fontFamilyFallbacks = [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ];

  // Semantic Colors
  static const Color primaryBlue = Color(0xFF2563EB); // Deep Cobalt (Focus)
  static const Color secondaryTeal = Color(0xFF0D9488); // Soft Balance Teal (Efficient)
  static const Color accentViolet = Color(0xFF7C3AED); // Deep Violet
  static const Color neutralCanvas = Color(0xFFF8FAFC); // Cool Slate Canvas
  static const Color neutralCard = Color(0xFFFFFFFF); // Card Surface
  static const Color neutralBorder = Color(0xFFCBD5E1); // Subtle Border
  static const Color neutralText = Color(0xFF0F172A); // High Contrast Body
  static const Color warningAmber = Color(0xFFD97706); // Guilt-Free Reschedule Guardrail
  static const Color warningSubtle = Color(0xFFFFFBEB); // Soft Alert Background

  /// OpenType Tabular Figures font feature for jitter-free numbers, timers, and timeline
  static const List<FontFeature> tabularFiguresFeature = [
    FontFeature.tabularFigures(),
  ];

  static TextStyle get display => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 32,
        height: 40 / 32,
        letterSpacing: -0.02 * 32,
        fontWeight: FontWeight.w600,
        color: neutralText,
      );

  static TextStyle get heading1 => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 24,
        height: 32 / 24,
        letterSpacing: -0.015 * 24,
        fontWeight: FontWeight.w600,
        color: neutralText,
      );

  static TextStyle get heading2 => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 20,
        height: 28 / 20,
        letterSpacing: -0.01 * 20,
        fontWeight: FontWeight.w600,
        color: neutralText,
      );

  static TextStyle get heading3 => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 16,
        height: 24 / 16,
        letterSpacing: 0.0,
        fontWeight: FontWeight.w600,
        color: neutralText,
      );

  static TextStyle get bodyLarge => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 16,
        height: 24 / 16,
        letterSpacing: 0.0,
        fontWeight: FontWeight.w400,
        color: neutralText,
      );

  static TextStyle get bodyMedium => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 14,
        height: 20 / 14,
        letterSpacing: 0.0,
        fontWeight: FontWeight.w400,
        color: neutralText,
      );

  static TextStyle get labelMedium => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 14,
        height: 20 / 14,
        letterSpacing: 0.01 * 14,
        fontWeight: FontWeight.w500,
        color: neutralText,
      );

  static TextStyle get caption => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 12,
        height: 16 / 12,
        letterSpacing: 0.01 * 12,
        fontWeight: FontWeight.w500,
        fontFeatures: tabularFiguresFeature,
        color: Color(0xFF64748B),
      );

  static TextStyle get micro => const TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallbacks,
        fontSize: 11,
        height: 14 / 11,
        letterSpacing: 0.05 * 11,
        fontWeight: FontWeight.w600,
        fontFeatures: tabularFiguresFeature,
      );

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: neutralCanvas,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: primaryBlue,
        onPrimary: Colors.white,
        secondary: secondaryTeal,
        onSecondary: Colors.white,
        error: warningAmber, // Guilt-free: use warm amber instead of punitive red
        onError: Colors.white,
        surface: neutralCard,
        onSurface: neutralText,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: neutralCard,
        elevation: 0,
        scrolledUnderElevation: 1,
        titleTextStyle: heading2,
        centerTitle: false,
      ),
    );
  }
}
