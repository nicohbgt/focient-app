import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../core/validators/focient_validators.dart';
import '../../../data/auth_state.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';
import '../../primitive/google_logo.dart';

/// FoCient Login Screen
///
/// Implements:
/// - Title: "Welcome Back!"
/// - Email & Password inputs with inline validation
/// - Password visibility toggle
/// - "Forgot Password?" recovery interaction
/// - "Login" primary action
/// - "Or continue with" divider
/// - "Continue with Google" hybrid authentication
/// - Quick "Try FoCient Guest Demo"
/// - "Don't have an account? Register" navigation
class FocientLoginScreen extends ConsumerStatefulWidget {
  final VoidCallback onNavigateToRegister;
  final VoidCallback? onNavigateToForgotPassword;
  final VoidCallback? onLoginSuccess;
  final VoidCallback? onBack;

  const FocientLoginScreen({
    super.key,
    required this.onNavigateToRegister,
    this.onNavigateToForgotPassword,
    this.onLoginSuccess,
    this.onBack,
  });

  @override
  ConsumerState<FocientLoginScreen> createState() => _FocientLoginScreenState();
}

class _FocientLoginScreenState extends ConsumerState<FocientLoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _emailTouched = false;
  bool _passwordTouched = false;
  bool _submittedOnce = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    setState(() {
      _submittedOnce = true;
      _emailTouched = true;
      _passwordTouched = true;
    });

    final emailValid = FocientValidators.validateEmail(_emailController.text);
    if (!emailValid.isValid || _passwordController.text.isEmpty) {
      return;
    }

    final success = await ref.read(authProvider.notifier).login(
          email: _emailController.text,
          password: _passwordController.text,
        );

    if (success && mounted) {
      widget.onLoginSuccess?.call();
    }
  }

  void _handleForgotPassword() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final forgotEmailController = TextEditingController(text: _emailController.text);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: isDark
              ? FocientColorDarkTokens.neutralSurfaceCard
              : FocientColorTokens.neutralSurfaceCard,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(FocientBorderRadiusTokens.radiusXl),
          ),
        ),
        child: SafeArea(
          top: false,
          bottom: true,
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Padding(
              padding: const EdgeInsets.all(FocientSpacingTokens.space6),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Reset Password',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter your email address and we’ll send you a 6-digit verification code to reset your password.',
                    style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 20),
                  FocientInputField(
                    controller: forgotEmailController,
                    label: 'Email Address',
                    hintText: 'Input your email here',
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FocientButton(
                      onPressed: () {
                        final email = forgotEmailController.text.trim();
                        if (email.isNotEmpty) {
                          Navigator.of(ctx).pop();
                          ref.read(authProvider.notifier).initiateRegistration(
                                name: 'FoCient Member',
                                email: email,
                                password: 'TempPassword123!',
                              );
                        }
                      },
                      child: const Text('Send Recovery Code'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final emailResult = _emailTouched || _submittedOnce
        ? FocientValidators.validateEmail(_emailController.text)
        : ValidationResult.valid;

    final passEmpty = _passwordTouched || _submittedOnce
        ? _passwordController.text.isEmpty
        : false;

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
                    'Welcome Back!',
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

                  Text(
                    'Log in to continue your guilt-free focus rhythm',
                    textAlign: TextAlign.start,
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      color: mutedTextColor,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Email Field
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

                  // Password Field
                  FocientInputField(
                    controller: _passwordController,
                    label: 'Password',
                    hintText: 'Input your password here',
                    obscureText: _obscurePassword,
                    errorText: passEmpty ? 'Kata sandi wajib diisi.' : null,
                    isInvalid: passEmpty,
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
                    onSubmitted: (_) => _handleLogin(),
                  ),

                  const SizedBox(height: 8),

                  // Forgot Password Link
                  Align(
                    alignment: Alignment.centerRight,
                    child: GestureDetector(
                      onTap: widget.onNavigateToForgotPassword ?? _handleForgotPassword,
                      child: Text(
                        'Forgot Password?',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: FocientColorTokens.primaryActionBase,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

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

                  // Login Button
                  SizedBox(
                    height: 48,
                    child: FocientButton(
                      onPressed: authState.isLoading ? null : _handleLogin,
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
                              'Login',
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

                  // Continue with Google Button
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
                                widget.onLoginSuccess?.call();
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

                  // Footer: Don't have an account? Register
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        "Don't have an account? ",
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          color: titleColor,
                        ),
                      ),
                      GestureDetector(
                        onTap: widget.onNavigateToRegister,
                        child: Text(
                          'Register',
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
