import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/data/auth_state.dart';
import 'package:focient_mobile/presentation/primitive/focient_otp_input.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_auth_flow.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_forgot_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_login_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_otp_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_register_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_reset_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_welcome_screen.dart';

class TestRealAuthNotifier extends AuthNotifier {
  @override
  Future<bool> initiateRegistration({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      status: AuthStatus.otpVerificationPending,
      otpPurpose: OtpPurpose.registration,
      pendingName: name.trim(),
      pendingEmail: email.trim().toLowerCase(),
      pendingPassword: password,
      otpCooldownSeconds: 30,
    );
    return true;
  }

  @override
  Future<bool> requestPasswordReset(String email) async {
    state = state.copyWith(
      status: AuthStatus.otpVerificationPending,
      otpPurpose: OtpPurpose.forgotPassword,
      pendingEmail: email.trim().toLowerCase(),
      otpCooldownSeconds: 30,
    );
    return true;
  }

  @override
  Future<bool> verifyOtp(String code) async {
    final trimmed = code.trim();
    if (trimmed.length != 6) {
      state = state.copyWith(errorMessage: 'Masukkan 6 digit kode OTP yang valid.');
      return false;
    }

    if (state.otpPurpose == OtpPurpose.forgotPassword) {
      state = state.copyWith(
        status: AuthStatus.resetPasswordPending,
        resetPasswordOtp: trimmed,
        clearError: true,
      );
      return true;
    }

    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: AuthUser(
        id: 'usr-real-123',
        name: state.pendingName ?? 'Alex Morgan',
        email: state.pendingEmail ?? 'alex@gmail.com',
        roleArchetype: 'Software Engineer',
        dailyCapacityMinutes: 480,
      ),
      clearError: true,
    );
    return true;
  }

  @override
  Future<bool> resetPassword({required String newPassword}) async {
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      resetPasswordOtp: null,
      clearError: true,
    );
    return true;
  }

  @override
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: AuthUser(
        id: 'usr-real-123',
        name: 'Alex Morgan',
        email: email.trim().toLowerCase(),
        roleArchetype: 'Focus Achiever',
        dailyCapacityMinutes: 480,
      ),
      clearError: true,
    );
    return true;
  }
}

void main() {
  group('FoCient Auth Validation Specifications', () {
    test('1. Name validation requires at least 2 characters', () {
      expect(FocientValidators.validateName('').isValid, isFalse);
      expect(FocientValidators.validateName('A').isValid, isFalse);
      expect(FocientValidators.validateName('Al').isValid, isTrue);
      expect(FocientValidators.validateName('Alex Morgan').isValid, isTrue);
    });

    test('2. Email validation requires valid email structure', () {
      expect(FocientValidators.validateEmail('').isValid, isFalse);
      expect(FocientValidators.validateEmail('invalid-email').isValid, isFalse);
      expect(FocientValidators.validateEmail('user@').isValid, isFalse);
      expect(FocientValidators.validateEmail('user@domain').isValid, isFalse);
      expect(FocientValidators.validateEmail('user@domain.com').isValid, isTrue);
    });

    test('3. Password validation enforces 8 chars, 1 Upper, 1 Lower, 1 Number', () {
      expect(FocientValidators.validatePassword('Aa1!').isValid, isFalse);
      expect(FocientValidators.validatePassword('password123').isValid, isFalse);
      expect(FocientValidators.validatePassword('PASSWORD123').isValid, isFalse);
      expect(FocientValidators.validatePassword('PasswordAbc').isValid, isFalse);
      expect(FocientValidators.validatePassword('Focus2026!').isValid, isTrue);
    });

    test('4. OTP validation requires exactly 6 numeric digits', () {
      expect(FocientValidators.validateOtp('12345').isValid, isFalse);
      expect(FocientValidators.validateOtp('1234567').isValid, isFalse);
      expect(FocientValidators.validateOtp('12345a').isValid, isFalse);
      expect(FocientValidators.validateOtp('123456').isValid, isTrue);
    });

    test('5. Email masking formats correctly for privacy', () {
      expect(FocientValidators.maskEmail('johndoe@gmail.com'), 'j******@gmail.com');
      expect(FocientValidators.maskEmail('alex@focient.dev'), 'a******@focient.dev');
    });
  });

  group('FoCient Welcome Screen Widget Tests', () {
    testWidgets('Renders Welcome elements and buttons', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: FocientWelcomeScreen(
            onGetStarted: () {},
            onLogin: () {},
          ),
        ),
      );

      expect(find.text('FoCient'), findsOneWidget);
      expect(find.text('Focus & Efficient'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);
      expect(find.text('Already have an account? Login'), findsOneWidget);
    });
  });

  group('FoCient Forgot Password Screen Widget Tests (Image 1 & 2 Match)', () {
    testWidgets('Renders all Image 1 & 2 mock specifications exactly', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: FocientForgotPasswordScreen(
              onBack: () {},
            ),
          ),
        ),
      );

      // Top back button
      expect(find.byIcon(Icons.chevron_left_rounded), findsOneWidget);

      // Title & Subtitle
      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(
        find.text('Enter your email address to receive the OTP Verification code'),
        findsOneWidget,
      );

      // Email Address field
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Input your email here'), findsOneWidget);

      // "Get OTP" CTA button
      expect(find.text('Get OTP'), findsOneWidget);
    });
  });

  group('FoCient OTP Screen Widget Tests (Image 3 Match)', () {
    testWidgets('Renders all Image 3 specifications without dummy content', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) {
              final notifier = TestRealAuthNotifier();
              notifier.initiateRegistration(
                name: 'John Doe',
                email: 'johndoe@gmail.com',
                password: 'Password123!',
              );
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientOtpScreen(
              onBack: _dummyBack,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.chevron_left_rounded), findsOneWidget);
      expect(find.text('Verify Your OTP'), findsOneWidget);
      expect(
        find.text("Enter 6 digit code that you'll receive on your email address"),
        findsOneWidget,
      );
      expect(find.text('j******@gmail.com'), findsOneWidget);
      expect(find.text('Submit'), findsOneWidget);
      expect(find.text('Didn’t receive an OTP code?'), findsOneWidget);
      expect(find.textContaining('Resend code'), findsOneWidget);
    });
  });

  group('FoCient Reset Password Screen Widget Tests', () {
    testWidgets('Renders New Password, Confirm Password, and Reset Button', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: FocientResetPasswordScreen(
              onBack: () {},
              onPasswordResetComplete: () {},
            ),
          ),
        ),
      );

      expect(find.text('Reset Password'), findsNWidgets(2)); // Title and Button
      expect(find.text('New Password'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
      expect(
        find.text('Make sure include 1 Uppercase, 1 Lowercase and 1 Number'),
        findsOneWidget,
      );
    });
  });

  group('FoCient Complete User Journey Flows', () {
    testWidgets('Flow 1: welcome -> register -> OTP -> dashboard', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientAuthFlow(initialView: AuthScreenView.welcome),
          ),
        ),
      );

      // 1. Welcome page
      expect(find.text('Get Started'), findsOneWidget);
      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      // 2. Register page
      expect(find.text('Start Your Journey Here!'), findsOneWidget);
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'Alex Morgan');
      await tester.enterText(textFields.at(1), 'alex@gmail.com');
      await tester.enterText(textFields.at(2), 'Pass1234');

      await tester.ensureVisible(find.text('I agree to the '));
      await tester.tap(find.text('I agree to the '));
      await tester.pump();

      await tester.ensureVisible(find.text('Create Account'));
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // 3. OTP Verification
      expect(find.text('Verify Your OTP'), findsOneWidget);
      expect(find.text('a******@gmail.com'), findsOneWidget);

      final otpFields = find.descendant(
        of: find.byType(FocientOtpInput),
        matching: find.byType(TextField),
      );
      for (int i = 0; i < 6; i++) {
        await tester.enterText(otpFields.at(i), '${i + 1}');
      }
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();

      // 4. Authenticated Dashboard!
      expect(find.text('Account Authenticated'), findsOneWidget);
      expect(find.text('Alex Morgan'), findsOneWidget);
    });

    testWidgets('Flow 2: register -> login -> dashboard', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientAuthFlow(initialView: AuthScreenView.register),
          ),
        ),
      );

      // On register, tap "Login"
      await tester.ensureVisible(find.text('Login'));
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      // On login, enter credentials
      expect(find.text('Welcome Back!'), findsOneWidget);
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'alex@gmail.com');
      await tester.enterText(textFields.at(1), 'Pass1234');

      await tester.ensureVisible(find.text('Login').first);
      await tester.tap(find.text('Login').first);
      await tester.pumpAndSettle();

      // Authenticated Dashboard
      expect(find.text('Account Authenticated'), findsOneWidget);
    });

    testWidgets('Flow 3: login -> forgot password -> input email -> OTP -> reset password -> login', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientAuthFlow(initialView: AuthScreenView.login),
          ),
        ),
      );

      // 1. On Login page, tap "Forgot Password?"
      expect(find.text('Forgot Password?'), findsOneWidget);
      await tester.tap(find.text('Forgot Password?'));
      await tester.pumpAndSettle();

      // 2. On Forgot Password screen (Image 1 & 2), enter email
      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(find.text('Enter your email address to receive the OTP Verification code'), findsOneWidget);

      final emailField = find.byType(TextField);
      await tester.enterText(emailField, 'alex@gmail.com');
      await tester.tap(find.text('Get OTP'));
      await tester.pumpAndSettle();

      // 3. On OTP Verification screen (Image 3)
      expect(find.text('Verify Your OTP'), findsOneWidget);
      expect(find.text('a******@gmail.com'), findsOneWidget);

      final otpFields = find.descendant(
        of: find.byType(FocientOtpInput),
        matching: find.byType(TextField),
      );
      for (int i = 0; i < 6; i++) {
        await tester.enterText(otpFields.at(i), '${i + 1}');
      }
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();

      // 4. On Reset Password screen
      expect(find.text('Set your new password to regain access to your account'), findsOneWidget);
      final passFields = find.byType(TextField);
      await tester.enterText(passFields.at(0), 'NewPass2026!');
      await tester.enterText(passFields.at(1), 'NewPass2026!');

      await tester.tap(find.text('Reset Password').last);
      await tester.pumpAndSettle();

      // 5. Back to Login screen!
      expect(find.text('Welcome Back!'), findsOneWidget);
    });
  });
}

void _dummyBack() {}
