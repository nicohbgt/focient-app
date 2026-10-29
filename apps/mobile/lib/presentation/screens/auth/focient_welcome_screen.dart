import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../focient_copywriting.dart';
import '../../primitive/focient_button.dart';
import '../../riverpod_providers.dart';

/// FoCient Welcome / Onboarding Landing Page
///
/// Features:
/// - Header language switcher toggle (English vs Indonesian).
/// - Anti-overload brand typography and value pillars (no emblem logo).
/// - Fully responsive primary and secondary CTA buttons.
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
        child: Column(
          children: [
            // Header: Wordmark & Language Switcher (Point 1)
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FocientSpacingTokens.space5,
                vertical: FocientSpacingTokens.space3,
              ),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? const Color(0xFF334155).withValues(alpha: 0.5)
                        : const Color(0xFFE2E8F0).withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'FoCient',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                      color: titleColor,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF1E293B)
                          : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark
                            ? const Color(0xFF334155)
                            : const Color(0xFFE2E8F0),
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
                              ref
                                  .read(languageProvider.notifier)
                                  .setLanguage(FoCientLanguage.en);
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
                              ref
                                  .read(languageProvider.notifier)
                                  .setLanguage(FoCientLanguage.id);
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
            ),

            // Responsive Body Content (Without Logo)
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 440),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      return SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(
                          horizontal: FocientSpacingTokens.space6,
                          vertical: FocientSpacingTokens.space4,
                        ),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            minHeight: constraints.maxHeight - 32,
                          ),
                          child: IntrinsicHeight(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Spacer(flex: 1),

                                // Tagline
                                Text(
                                  copy.welcomeTagline,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontFamily:
                                        FocientTypographyTokens.fontFamily,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -0.6,
                                    color: FocientColorTokens.primaryActionBase,
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Subtitle
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16),
                                  child: Text(
                                    copy.welcomeSubtitle,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontFamily:
                                          FocientTypographyTokens.fontFamily,
                                      fontSize: 14,
                                      height: 1.45,
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
                                const SizedBox(height: 14),
                                _buildPillar(
                                  icon: Icons.sync_rounded,
                                  text: copy.welcomePillar2,
                                  isDark: isDark,
                                ),
                                const SizedBox(height: 14),
                                _buildPillar(
                                  icon: Icons.speed_rounded,
                                  text: copy.welcomePillar3,
                                  isDark: isDark,
                                ),

                                const Spacer(flex: 2),
                                const SizedBox(height: 28),

                                // Responsive CTA Buttons
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: FocientButton(
                                    isFullWidth: true,
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

                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: FocientButton(
                                    isFullWidth: true,
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

                                const SizedBox(height: 12),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
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
          color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
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
