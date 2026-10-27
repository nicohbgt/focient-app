import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../primitive/focient_button.dart';

class FocientTermsSheet extends StatelessWidget {
  final VoidCallback onAgree;

  const FocientTermsSheet({super.key, required this.onAgree});

  static Future<void> show(BuildContext context, {required VoidCallback onAgree}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FocientTermsSheet(onAgree: onAgree),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? FocientColorDarkTokens.neutralSurfaceCard
            : FocientColorTokens.neutralSurfaceCard,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(FocientBorderRadiusTokens.radiusXl),
        ),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: FocientSpacingTokens.space6,
        vertical: FocientSpacingTokens.space5,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark
                    ? FocientColorDarkTokens.neutralBorderSubtle
                    : FocientColorTokens.neutralBorderSubtle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          Text(
            'Terms & Privacy Policy',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: isDark
                  ? FocientColorDarkTokens.neutralTextBold
                  : FocientColorTokens.neutralTextBold,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          Expanded(
            child: SingleChildScrollView(
              child: Text(
                'Welcome to FoCient — the guilt-free cognitive productivity platform.\n\n'
                '1. Anti-Toxic Productivity Principle\n'
                'FoCient does not use punitive language, guilt-inducing reminders, or unrealistic streak pressures. We champion single-task flow, adaptive pacing, and respectful work boundaries.\n\n'
                '2. Data Privacy & Confidentiality\n'
                'Your schedules, tasks, and personal metrics are encrypted and never sold to third-party advertisers. You retain 100% control over your productivity data.\n\n'
                '3. Account Responsibility\n'
                'You agree to provide accurate registration details and maintain the security of your account credentials. We provide multi-layer OTP verification to safeguard your access.\n\n'
                '4. Guilt-Free Work Boundaries\n'
                'FoCient caps daily recommended work capacity at reasonable human thresholds (1 to 16 hours) with default 8 hours to prevent digital burnout.',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 14,
                  height: 1.5,
                  color: isDark
                      ? FocientColorDarkTokens.neutralTextMuted
                      : FocientColorTokens.neutralTextMuted,
                ),
              ),
            ),
          ),

          const SizedBox(height: FocientSpacingTokens.space4),
          SizedBox(
            width: double.infinity,
            child: FocientButton(
              onPressed: () {
                Navigator.of(context).pop();
                onAgree();
              },
              child: const Text('I Agree & Continue'),
            ),
          ),
        ],
      ),
    );
  }
}
