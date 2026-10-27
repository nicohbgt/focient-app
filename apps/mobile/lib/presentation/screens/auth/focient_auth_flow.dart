import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/auth_state.dart';
import '../dashboard/focient_dashboard_screen.dart';
import '../onboarding/focient_onboarding_flow.dart';
import 'focient_forgot_password_screen.dart';
import 'focient_login_screen.dart';
import 'focient_otp_screen.dart';
import 'focient_register_screen.dart';
import 'focient_reset_password_screen.dart';
import 'focient_welcome_screen.dart';

enum AuthScreenView {
  welcome,
  register,
  login,
  forgotPassword,
}

/// FoCient Auth Flow Coordinator
///
/// Implements the canonical authentication workflows:
/// 1. Welcome -> Register -> OTP Verification -> Dashboard
/// 2. Welcome -> Login -> Dashboard
/// 3. Register -> Login -> Dashboard
/// 4. Login -> Forgot Password (Input Email) -> OTP Verification -> Reset Password -> Login
class FocientAuthFlow extends ConsumerStatefulWidget {
  final AuthScreenView initialView;

  const FocientAuthFlow({
    super.key,
    this.initialView = AuthScreenView.welcome,
  });

  @override
  ConsumerState<FocientAuthFlow> createState() => _FocientAuthFlowState();
}

class _FocientAuthFlowState extends ConsumerState<FocientAuthFlow> {
  late AuthScreenView _activeView;

  @override
  void initState() {
    super.initState();
    _activeView = widget.initialView;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    // 1. If authenticated
    if (authState.isAuthenticated) {
      if (!(authState.user?.isOnboardingCompleted ?? false)) {
        return FocientOnboardingFlow(
          onCancel: () {
            ref.read(authProvider.notifier).logout();
          },
        );
      }
      return const FocientDashboardScreen();
    }

    // 2. If OTP verification pending -> render OTP screen (Image 3)
    if (authState.isOtpPending) {
      return FocientOtpScreen(
        onBack: () {
          ref.read(authProvider.notifier).cancelOtp();
          setState(() {
            if (authState.otpPurpose == OtpPurpose.forgotPassword) {
              _activeView = AuthScreenView.forgotPassword;
            } else {
              _activeView = AuthScreenView.register;
            }
          });
        },
      );
    }

    // 3. If OTP verified for password reset -> render Reset Password screen
    if (authState.isResetPasswordPending) {
      return FocientResetPasswordScreen(
        onBack: () {
          ref.read(authProvider.notifier).cancelOtp();
          setState(() => _activeView = AuthScreenView.forgotPassword);
        },
        onPasswordResetComplete: () {
          setState(() => _activeView = AuthScreenView.login);
        },
      );
    }

    // 4. Render Active View
    switch (_activeView) {
      case AuthScreenView.welcome:
        return FocientWelcomeScreen(
          onGetStarted: () {
            setState(() => _activeView = AuthScreenView.register);
          },
          onLogin: () {
            setState(() => _activeView = AuthScreenView.login);
          },
        );

      case AuthScreenView.register:
        return FocientRegisterScreen(
          onBack: () {
            setState(() => _activeView = AuthScreenView.welcome);
          },
          onNavigateToLogin: () {
            setState(() => _activeView = AuthScreenView.login);
          },
        );

      case AuthScreenView.login:
        return FocientLoginScreen(
          onBack: () {
            setState(() => _activeView = AuthScreenView.welcome);
          },
          onNavigateToRegister: () {
            setState(() => _activeView = AuthScreenView.register);
          },
          onNavigateToForgotPassword: () {
            setState(() => _activeView = AuthScreenView.forgotPassword);
          },
        );

      case AuthScreenView.forgotPassword:
        return FocientForgotPasswordScreen(
          onBack: () {
            setState(() => _activeView = AuthScreenView.login);
          },
        );
    }
  }
}
