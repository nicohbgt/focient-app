import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_checkbox.dart';
import '../../primitive/focient_input_field.dart';
import '../../primitive/google_logo.dart';
import 'focient_terms_sheet.dart';

/// FoCient Registration Screen (Image 1 Specification)
///
/// Implements:
/// - Title: "Start Your Journey Here!"
/// - Name, Email, and Password inputs with inline validation
/// - Password visibility toggle + canonical requirement guidance
/// - Term and Condition checkbox with interactive sheet
/// - "Create Account" primary action with loading and error states
/// - "Or continue with" divider
/// - "Continue with Google" branded action
/// - "Already have an account? Login" transition
class FocientRegisterScreen extends ConsumerStatefulWidget {
  final VoidCallback onNavigateToLogin;
  final VoidCallback? onRegistrationSuccess;
  final VoidCallback? onBack;

  const FocientRegisterScreen({
    super.key,
    required this.onNavigateToLogin,
    this.onRegistrationSuccess,
    this.onBack,
  });

  @override
  ConsumerState<FocientRegisterScreen> createState() => _FocientRegisterScreenState();
}

class _FocientRegisterScreenState extends ConsumerState<FocientRegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _agreedToTerms = false;

  bool _nameTouched = false;
  bool _emailTouched = false;
  bool _passwordTouched = false;
  bool _submittedOnce = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleCreateAccount() async {
    setState(() {
      _submittedOnce = true;
      _nameTouched = true;
      _emailTouched = true;
      _passwordTouched = true;
    });

    final nameValid = FocientValidators.validateName(_nameController.text);
    final emailValid = FocientValidators.validateEmail(_emailController.text);
    final passValid = FocientValidators.validatePassword(_passwordController.text);

    if (!nameValid.isValid || !emailValid.isValid || !passValid.isValid) {
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please agree to the Term and Condition to proceed.'),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).initiateRegistration(
          name: _nameController.text,
          email: _emailController.text,
          password: _passwordController.text,
        );

    if (success && mounted) {
      widget.onRegistrationSuccess?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final nameResult = _nameTouched || _submittedOnce
        ? FocientValidators.validateName(_nameController.text)
        : ValidationResult.valid;

    final emailResult = _emailTouched || _submittedOnce
        ? FocientValidators.validateEmail(_emailController.text)
        : ValidationResult.valid;

    final passResult = _passwordTouched || _submittedOnce
        ? FocientValidators.validatePassword(_passwordController.text)
        : ValidationResult.valid;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : FocientColorTokens.neutralTextBold;

    final dividerLineColor = isDark
        ? FocientColorDarkTokens.neutralBorderSubtle
        : const Color(0xFFCBD5E1);

    final mutedTextColor = isDark
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
                vertical: FocientSpacingTokens.space6,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 16),

                  // Header Title - Left/Start Aligned (No center)
                  Text(
                    'Start Your Journey Here!',
                    textAlign: TextAlign.start,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                      color: titleColor,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Field 1: Name
                  FocientInputField(
                    controller: _nameController,
                    label: 'Name',
                    hintText: 'Input your name here',
                    errorText: nameResult.errorMessage,
                    isInvalid: !nameResult.isValid,
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.next,
                    onChanged: (val) {
                      if (_submittedOnce) setState(() => _nameTouched = true);
                    },
                  ),

                  const SizedBox(height: FocientSpacingTokens.space4),

                  // Field 2: Email Address
                  FocientInputField(
                    controller: _emailController,
                    label: 'Email Address',
                    hintText: 'Input your email here',
                    keyboardType: TextInputType.emailAddress,
                    errorText: emailResult.errorMessage,
                    isInvalid: !emailResult.isValid,
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.next,
                    onChanged: (val) {
                      if (_submittedOnce) setState(() => _emailTouched = true);
                    },
                  ),

                  const SizedBox(height: FocientSpacingTokens.space4),

                  // Field 3: Password
                  FocientInputField(
                    controller: _passwordController,
                    label: 'Password',
                    hintText: 'Input your password here',
                    obscureText: _obscurePassword,
                    errorText: passResult.errorMessage,
                    isInvalid: !passResult.isValid,
                    helperText: 'Make sure include 1 Uppercase, 1 Lowercase and 1 Number',
                    borderRadius: FocientBorderRadiusTokens.radiusLg,
                    textInputAction: TextInputAction.done,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
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
                    onSubmitted: (_) => _handleCreateAccount(),
                  ),

                  const SizedBox(height: FocientSpacingTokens.space4),

                  // Checkbox: Terms and Conditions
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: FocientCheckbox(
                          value: _agreedToTerms,
                          onChanged: (val) {
                            setState(() {
                              _agreedToTerms = val;
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: FocientSpacingTokens.space3),
                      Expanded(
                        child: Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _agreedToTerms = !_agreedToTerms;
                                });
                              },
                              child: Text(
                                'I agree to the ',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  color: titleColor,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                FocientTermsSheet.show(
                                  context,
                                  onAgree: () {
                                    setState(() => _agreedToTerms = true);
                                  },
                                );
                              },
                              child: Text(
                                'Term and Condition',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: titleColor,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: FocientSpacingTokens.space4),

                  if (authState.errorMessage != null) ...[
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
                    const SizedBox(height: 12),
                  ],

                  // Button: Create Account
                  SizedBox(
                    height: 48,
                    child: FocientButton(
                      onPressed: authState.isLoading ? null : _handleCreateAccount,
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
                              'Create Account',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: FocientSpacingTokens.space5),

                  // Divider: "Or continue with"
                  Row(
                    children: [
                      Expanded(
                        child: Divider(
                          color: dividerLineColor,
                          thickness: 1,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'Or continue with',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 13,
                            color: mutedTextColor,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Divider(
                          color: dividerLineColor,
                          thickness: 1,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: FocientSpacingTokens.space5),

                  // Button: Continue with Google
                  SizedBox(
                    height: 48,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: isDark
                            ? FocientColorDarkTokens.neutralSurfaceCard
                            : Colors.white,
                        side: BorderSide(
                          color: dividerLineColor,
                          width: 1,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            FocientBorderRadiusTokens.radiusLg,
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      onPressed: authState.isLoading
                          ? null
                          : () async {
                              final success = await ref
                                  .read(authProvider.notifier)
                                  .loginWithGoogle();
                              if (success && mounted) {
                                widget.onRegistrationSuccess?.call();
                              }
                            },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const GoogleLogo(size: 20),
                          const SizedBox(width: 12),
                          Text(
                            'Continue with Google',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: titleColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Footer: Already have an account? Login
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        'Already have an account? ',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          color: titleColor,
                        ),
                      ),
                      GestureDetector(
                        onTap: widget.onNavigateToLogin,
                        child: Text(
                          'Login',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: titleColor,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
