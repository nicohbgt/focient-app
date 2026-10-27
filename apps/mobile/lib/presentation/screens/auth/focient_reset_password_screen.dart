import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';

/// FoCient Reset Password Screen
///
/// Implements:
/// - Top back arrow navigation (`<`)
/// - Title: "Reset Password"
/// - Subtitle: "Set your new password to regain access to your account"
/// - New Password & Confirm Password inputs with visibility toggles
/// - "Reset Password" action
class FocientResetPasswordScreen extends ConsumerStatefulWidget {
  final VoidCallback onBack;
  final VoidCallback onPasswordResetComplete;

  const FocientResetPasswordScreen({
    super.key,
    required this.onBack,
    required this.onPasswordResetComplete,
  });

  @override
  ConsumerState<FocientResetPasswordScreen> createState() =>
      _FocientResetPasswordScreenState();
}

class _FocientResetPasswordScreenState
    extends ConsumerState<FocientResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _passwordTouched = false;
  bool _confirmTouched = false;
  bool _submittedOnce = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleResetPassword() async {
    setState(() {
      _submittedOnce = true;
      _passwordTouched = true;
      _confirmTouched = true;
    });

    final passResult =
        FocientValidators.validatePassword(_passwordController.text);
    if (!passResult.isValid) {
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      return;
    }

    final success = await ref.read(authProvider.notifier).resetPassword(
          newPassword: _passwordController.text,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password successfully updated! Please log in.'),
          backgroundColor: FocientColorTokens.successActionBase,
          duration: Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
      widget.onPasswordResetComplete();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final passResult = _passwordTouched || _submittedOnce
        ? FocientValidators.validatePassword(_passwordController.text)
        : ValidationResult.valid;

    final passwordsMatch =
        _passwordController.text == _confirmPasswordController.text;
    final confirmError = (_confirmTouched || _submittedOnce) && !passwordsMatch
        ? 'Kata sandi konfirmasi tidak cocok.'
        : null;

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

                  // Title: "Reset Password"
                  Text(
                    'Reset Password',
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
                      'Set your new password to regain access to your account',
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

                  // Field 1: New Password
                  FocientInputField(
                    controller: _passwordController,
                    label: 'New Password',
                    hintText: 'Input your new password here',
                    obscureText: _obscurePassword,
                    errorText: passResult.errorMessage,
                    isInvalid: !passResult.isValid,
                    helperText:
                        'Make sure include 1 Uppercase, 1 Lowercase and 1 Number',
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.next,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                        color: const Color(0xFF94A3B8),
                      ),
                      splashRadius: 20,
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    onChanged: (val) {
                      if (_submittedOnce) setState(() => _passwordTouched = true);
                    },
                  ),

                  const SizedBox(height: FocientSpacingTokens.space4),

                  // Field 2: Confirm Password
                  FocientInputField(
                    controller: _confirmPasswordController,
                    label: 'Confirm Password',
                    hintText: 'Confirm your new password here',
                    obscureText: _obscureConfirmPassword,
                    errorText: confirmError,
                    isInvalid: confirmError != null,
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.done,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                        color: const Color(0xFF94A3B8),
                      ),
                      splashRadius: 20,
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                    onChanged: (val) {
                      if (_submittedOnce) setState(() => _confirmTouched = true);
                    },
                    onSubmitted: (_) => _handleResetPassword(),
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

                  // Reset Password Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FocientButton(
                      onPressed: authState.isLoading ? null : _handleResetPassword,
                      child: authState.isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Reset Password',
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
