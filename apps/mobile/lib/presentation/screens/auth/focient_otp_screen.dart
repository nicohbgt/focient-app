import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_badge.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_otp_input.dart';

/// FoCient OTP Verification Screen (Image 2 & 3 Specification)
///
/// Implements:
/// - Top back arrow navigation (`<`)
/// - Title: "Verify Your OTP"
/// - Subtitle: "Enter 6 digit code that you'll receive on your email address"
/// - Masked email badge (e.g. `j******@gmail.com`)
/// - 6-box OTP entry with placeholder '0' and auto-advance
/// - "Submit" primary action with loading and validation states
/// - "Didn't receive an OTP code? Resend code" with active countdown timer
class FocientOtpScreen extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  final VoidCallback? onVerificationSuccess;

  const FocientOtpScreen({
    super.key,
    required this.onBack,
    this.onVerificationSuccess,
  });

  @override
  ConsumerState<FocientOtpScreen> createState() => _FocientOtpScreenState();
}

class _FocientOtpScreenState extends ConsumerState<FocientOtpScreen> {
  final GlobalKey<FocientOtpInputState> _otpKey = GlobalKey<FocientOtpInputState>();
  String _enteredCode = '';
  bool _submittedOnce = false;

  void _handleSubmit() async {
    setState(() => _submittedOnce = true);

    final validation = FocientValidators.validateOtp(_enteredCode);
    if (!validation.isValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(validation.errorMessage ?? 'Please enter all 6 digits.'),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).verifyOtp(_enteredCode);
    if (success && mounted) {
      widget.onVerificationSuccess?.call();
    }
  }

  void _handleResend() async {
    final auth = ref.read(authProvider);
    if (auth.otpCooldownSeconds > 0) return;

    final success = await ref.read(authProvider.notifier).resendOtp();
    if (success && mounted) {
      _otpKey.currentState?.clear();
      setState(() {
        _enteredCode = '';
        _submittedOnce = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('A fresh 6-digit verification code has been sent to your email.'),
          duration: Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final targetEmail = authState.pendingEmail ?? 'johndoe@gmail.com';
    final maskedEmail = FocientValidators.maskEmail(targetEmail);

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : FocientColorTokens.neutralTextBold;

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final isInvalid = _submittedOnce && _enteredCode.length < 6;

    return Scaffold(
      backgroundColor: isDark
          ? FocientColorDarkTokens.neutralBgCanvas
          : FocientColorTokens.neutralBgCanvas,
      body: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: FocientSpacingTokens.space6,
                vertical: FocientSpacingTokens.space4,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top Row: Back button (<)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      icon: const Icon(
                        Icons.chevron_left_rounded,
                        size: 32,
                        color: Color(0xFF64748B),
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      splashRadius: 24,
                      onPressed: () {
                        ref.read(authProvider.notifier).cancelOtp();
                        widget.onBack();
                      },
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Title: "Verify Your OTP" - Left/Start Aligned
                  Text(
                    'Verify Your OTP',
                    textAlign: TextAlign.start,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                      color: titleColor,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Subtitle - Left/Start Aligned
                  Text(
                    "Enter 6 digit code that you'll receive on your email address",
                    textAlign: TextAlign.start,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      height: 1.4,
                      color: subtitleColor,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Masked Email Badge / Pill
                  Align(
                    alignment: Alignment.centerLeft,
                    child: FocientBadge(
                      text: maskedEmail,
                      variant: FocientBadgeVariant.focus,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 6-digit OTP Box Field
                  FocientOtpInput(
                    key: _otpKey,
                    length: 6,
                    isInvalid: isInvalid,
                    enabled: !authState.isLoading,
                    onChanged: (code) {
                      setState(() => _enteredCode = code);
                    },
                    onCompleted: (code) {
                      setState(() => _enteredCode = code);
                      _handleSubmit();
                    },
                  ),

                  if (isInvalid || authState.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      authState.errorMessage ?? 'Masukkan 6 digit kode OTP yang valid.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isDark
                            ? FocientColorDarkTokens.dangerTextBold
                            : FocientColorTokens.dangerTextBold,
                      ),
                    ),
                  ],

                  const SizedBox(height: 32),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      onPressed: authState.isLoading ? null : _handleSubmit,
                      child: authState.isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Submit',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Resend Code Section
                  Text(
                    'Didn’t receive an OTP code?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      color: subtitleColor,
                    ),
                  ),

                  const SizedBox(height: 6),

                  GestureDetector(
                    onTap: authState.otpCooldownSeconds > 0 ? null : _handleResend,
                    child: Text(
                      authState.otpCooldownSeconds > 0
                          ? 'Resend code in ${authState.otpCooldownSeconds}s'
                          : 'Resend code',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: authState.otpCooldownSeconds > 0
                            ? const Color(0xFF94A3B8)
                            : titleColor,
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
