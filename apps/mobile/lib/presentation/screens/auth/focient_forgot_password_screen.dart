import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';
import '../../riverpod_providers.dart';

/// FoCient Forgot Password Screen
///
/// Implements:
/// - Top back arrow navigation (`<`)
/// - Title: "Forgot Password?"
/// - Subtitle: "Enter your email address to receive password reset instructions"
/// - Email Address input field with validation
/// - "Send Reset Instructions" primary action
/// - Clean confirmation screen upon submission
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
  bool _isSubmitted = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _handleSendInstructions() async {
    setState(() {
      _submittedOnce = true;
      _emailTouched = true;
    });

    final lang = ref.read(languageProvider);
    final emailResult = FocientValidators.validateEmail(_emailController.text, language: lang);
    if (!emailResult.isValid) {
      return;
    }

    final success = await ref
        .read(authProvider.notifier)
        .requestPasswordReset(_emailController.text.trim());

    if (success && mounted) {
      setState(() {
        _isSubmitted = true;
      });
      widget.onOtpDispatched?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final lang = ref.watch(languageProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final emailResult = _emailTouched || _submittedOnce
        ? FocientValidators.validateEmail(_emailController.text, language: lang)
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
                      onPressed: widget.onBack,
                    ),
                  ),

                  const SizedBox(height: 20),

                  if (_isSubmitted) ...[
                    // Success Confirmation State
                    const SizedBox(height: 16),
                    Container(
                      width: 56,
                      height: 56,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.check_circle_outline_rounded,
                        color: Color(0xFF059669),
                        size: 32,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Instructions Sent',
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We have sent password reset instructions to ${_emailController.text.trim()}. Please check your email inbox.',
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        height: 1.4,
                        color: subtitleColor,
                      ),
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: FocientButton(
                        isFullWidth: true,
                        onPressed: widget.onBack,
                        child: const Text(
                          'Back to Login',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ] else ...[
                    // Title: "Forgot Password?" - Left/Start Aligned
                    Text(
                      'Forgot Password?',
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
                      'Enter your email address to receive password reset instructions',
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        height: 1.4,
                        color: subtitleColor,
                      ),
                    ),

                    const SizedBox(height: 32),

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
                      onSubmitted: (_) => _handleSendInstructions(),
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

                    // "Send Reset Instructions" Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: FocientButton(
                        isFullWidth: true,
                        onPressed: authState.isLoading ? null : _handleSendInstructions,
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
                                'Send Reset Instructions',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
