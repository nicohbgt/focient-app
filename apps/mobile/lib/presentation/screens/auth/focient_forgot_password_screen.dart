import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';

/// FoCient Forgot Password Screen (Matches Uploaded Mock Specification)
///
/// Implements:
/// - Top back arrow navigation (`<`)
/// - Title: "Forgot Password?"
/// - Subtitle: "Enter your email address to receive the OTP Verification code"
/// - Email Address input field with validation
/// - "Get OTP" primary action
class FocientForgotPasswordScreen extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  final VoidCallback? onOtpDispatched;

  const FocientForgotPasswordScreen({
    super.key,
    required this.onBack,
    this.onOtpDispatched,
  });

  @override
  ConsumerState<FocientForgotPasswordScreen> createState() =>
      _FocientForgotPasswordScreenState();
}

class _FocientForgotPasswordScreenState
    extends ConsumerState<FocientForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _emailTouched = false;
  bool _submittedOnce = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _handleGetOtp() async {
    setState(() {
      _submittedOnce = true;
      _emailTouched = true;
    });

    final emailResult = FocientValidators.validateEmail(_emailController.text);
    if (!emailResult.isValid) {
      return;
    }

    final success = await ref
        .read(authProvider.notifier)
        .requestPasswordReset(_emailController.text.trim());

    if (success && mounted) {
      widget.onOtpDispatched?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final emailResult = _emailTouched || _submittedOnce
        ? FocientValidators.validateEmail(_emailController.text)
        : ValidationResult.valid;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : FocientColorTokens.neutralTextBold;

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: isDark
          ? FocientColorDarkTokens.neutralBgCanvas
          : FocientColorTokens.neutralSurfaceCard,
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
                crossAxisAlignment: CrossAxisAlignment.center,
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
                      onPressed: widget.onBack,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Title: "Forgot Password?"
                  Text(
                    'Forgot Password?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                      color: titleColor,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Enter your email address to receive the OTP Verification code',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        height: 1.4,
                        color: subtitleColor,
                      ),
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Email Address Input Field
                  FocientInputField(
                    controller: _emailController,
                    label: 'Email Address',
                    hintText: 'Input your email here',
                    keyboardType: TextInputType.emailAddress,
                    errorText: emailResult.errorMessage,
                    isInvalid: !emailResult.isValid,
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.done,
                    onChanged: (val) {
                      if (_submittedOnce) setState(() => _emailTouched = true);
                    },
                    onSubmitted: (_) => _handleGetOtp(),
                  ),

                  if (authState.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      authState.errorMessage!,
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

                  const SizedBox(height: 28),

                  // "Get OTP" Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      onPressed: authState.isLoading ? null : _handleGetOtp,
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
                              'Get OTP',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
