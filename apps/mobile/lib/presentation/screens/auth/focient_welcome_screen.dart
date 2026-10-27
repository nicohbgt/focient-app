import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../primitive/focient_button.dart';

/// FoCient Welcome / Onboarding Landing Page
///
/// Serves as the introductory entrypoint in the auth journey:
/// flow: welcome page -> register / login
class FocientWelcomeScreen extends StatelessWidget {
  final VoidCallback onGetStarted;
  final VoidCallback onLogin;

  const FocientWelcomeScreen({
    super.key,
    required this.onGetStarted,
    required this.onLogin,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : FocientColorTokens.neutralTextBold;

    final mutedColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: isDark
          ? FocientColorDarkTokens.neutralBgCanvas
          : FocientColorTokens.neutralBgCanvas,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: FocientSpacingTokens.space6,
                vertical: FocientSpacingTokens.space4,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // Brand Emblem
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: FocientColorTokens.primaryActionBase,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: FocientColorTokens.primaryActionBase.withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.center_focus_strong_rounded,
                      color: Colors.white,
                      size: 38,
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Brand Title
                  Text(
                    'FoCient',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.8,
                      color: titleColor,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Tagline
                  Text(
                    'Focus & Efficient',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: FocientColorTokens.primaryActionBase,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Guilt-free productivity and adaptive cognitive rhythm for your best work.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        height: 1.4,
                        color: mutedColor,
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Value Pillars
                  _buildPillar(
                    icon: Icons.check_circle_outline_rounded,
                    text: 'Single-task flow without guilt or burnout',
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildPillar(
                    icon: Icons.sync_rounded,
                    text: 'Guilt-free adaptive rescheduling',
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildPillar(
                    icon: Icons.speed_rounded,
                    text: 'Daily work capacity limits (max 8h standard)',
                    isDark: isDark,
                  ),

                  const SizedBox(height: 36),

                  // Primary CTA: Get Started
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      onPressed: onGetStarted,
                      child: const Text(
                        'Get Started',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Secondary CTA: Login
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      variant: FocientButtonVariant.outline,
                      onPressed: onLogin,
                      child: Text(
                        'Already have an account? Login',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: titleColor,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPillar({
    required IconData icon,
    required String text,
    required bool isDark,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 18,
          color: FocientColorTokens.primaryActionBase,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isDark
                  ? FocientColorDarkTokens.neutralTextBold
                  : FocientColorTokens.neutralTextBold,
            ),
          ),
        ),
      ],
    );
  }
}
