import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../focient_copywriting.dart';
import '../../primitive/focient_button.dart';
import '../../riverpod_providers.dart';

/// FoCient Welcome / Onboarding Landing Page
///
/// Features:
/// - Language switcher toggle (English vs Indonesian) with interactive state update.
/// - Adaptive value pillars and brand tagline.
/// - Primary and Secondary CTA navigations into Register / Login flows.
class FocientWelcomeScreen extends ConsumerWidget {
  final VoidCallback onGetStarted;
  final VoidCallback onLogin;
  final FoCientLanguage? initialLanguage;
  final ValueChanged<FoCientLanguage>? onLanguageChanged;

  const FocientWelcomeScreen({
    super.key,
    required this.onGetStarted,
    required this.onLogin,
    this.initialLanguage,
    this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    FoCientLanguage activeLanguage = initialLanguage ?? FoCientLanguage.en;
    try {
      activeLanguage = initialLanguage ?? ref.watch(languageProvider);
    } catch (_) {
      activeLanguage = initialLanguage ?? FoCientLanguage.en;
    }
    final copy = FoCientCopywriting.of(activeLanguage);
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
                  // Top Language Switcher Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildLanguageChip(
                              label: 'English',
                              isSelected: activeLanguage == FoCientLanguage.en,
                              onTap: () {
                                try {
                                  ref.read(languageProvider.notifier).setLanguage(FoCientLanguage.en);
                                } catch (_) {}
                                onLanguageChanged?.call(FoCientLanguage.en);
                              },
                              isDark: isDark,
                            ),
                            const SizedBox(width: 4),
                            _buildLanguageChip(
                              label: 'Indonesia',
                              isSelected: activeLanguage == FoCientLanguage.id,
                              onTap: () {
                                try {
                                  ref.read(languageProvider.notifier).setLanguage(FoCientLanguage.id);
                                } catch (_) {}
                                onLanguageChanged?.call(FoCientLanguage.id);
                              },
                              isDark: isDark,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

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
                    copy.welcomeTagline,
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
                      copy.welcomeSubtitle,
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
                    text: copy.welcomePillar1,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildPillar(
                    icon: Icons.sync_rounded,
                    text: copy.welcomePillar2,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildPillar(
                    icon: Icons.speed_rounded,
                    text: copy.welcomePillar3,
                    isDark: isDark,
                  ),

                  const SizedBox(height: 36),

                  // Primary CTA: Get Started
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      onPressed: onGetStarted,
                      child: Text(
                        copy.getStarted,
                        style: const TextStyle(
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
                        copy.alreadyHaveAccountLogin,
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

  Widget _buildLanguageChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF2563EB)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
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
