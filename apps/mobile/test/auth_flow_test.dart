import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/data/auth_state.dart';
import 'package:focient_mobile/data/workspace_category.dart';
import 'package:focient_mobile/presentation/primitive/focient_otp_input.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_auth_flow.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_forgot_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_otp_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_reset_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_welcome_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/add_task_category_sheet.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_workspace_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_rhythm_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_time_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_task_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_review_screen.dart';
import 'package:focient_mobile/presentation/organism/focient_onboarding_task_card.dart';
import 'package:focient_mobile/presentation/primitive/focient_rest_time_slider.dart';
import 'package:focient_mobile/data/onboarding_task.dart';
import 'package:focient_mobile/presentation/screens/dashboard/focient_dashboard_screen.dart';
import 'package:focient_mobile/presentation/screens/plan/focient_today_plan_screen.dart';
import 'package:focient_mobile/presentation/screens/task/focient_add_task_screen.dart';
import 'package:focient_mobile/presentation/screens/task/focient_task_detail_screen.dart';
import 'package:focient_mobile/presentation/screens/task/focient_task_list_screen.dart';
import 'package:focient_mobile/presentation/screens/insight/focient_insight_screen.dart';
import 'package:focient_mobile/presentation/screens/settings/focient_settings_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/create_task_bottom_sheet.dart';
import 'package:focient_mobile/presentation/primitive/focient_input_field.dart';
import 'package:focient_mobile/data/planning_state.dart';
import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/riverpod_providers.dart';

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
        roleArchetype: 'General',
        dailyCapacityMinutes: 480,
        isOnboardingCompleted: false,
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
  Future<bool> completeWorkspaceOnboarding({
    required String username,
    required String occupancy,
    required List<WorkspaceCategory> categories,
    String energyRhythm = 'Early Bird',
    String schedulingStyle = 'Structured',
    String startWorkTime = '09:00',
    String endWorkTime = '17:00',
    int restTimeMinutesPerTask = 10,
  }) async {
    final updatedUser = (state.user ??
            AuthUser(
              id: 'usr-real-123',
              name: username,
              email: state.pendingEmail ?? 'alex@gmail.com',
            ))
        .copyWith(
      name: username,
      username: username,
      roleArchetype: occupancy,
      isOnboardingCompleted: true,
      selectedCategories: categories.map((c) => c.name).toList(),
      energyRhythm: energyRhythm,
      schedulingStyle: schedulingStyle,
      startWorkTime: startWorkTime,
      endWorkTime: endWorkTime,
      restTimeMinutesPerTask: restTimeMinutesPerTask,
    );

    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: updatedUser,
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
        isOnboardingCompleted: true,
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
    testWidgets('Renders Welcome elements and buttons with English default', (tester) async {
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
      expect(find.text('English'), findsOneWidget);
      expect(find.text('Indonesia'), findsOneWidget);
    });

    testWidgets('Toggles language between English and Indonesian on Welcome page', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: FocientWelcomeScreen(
              onGetStarted: () {},
              onLogin: () {},
            ),
          ),
        ),
      );

      // Default is English
      expect(find.text('Focus & Efficient'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);
      expect(find.text('Already have an account? Login'), findsOneWidget);

      // Tap Indonesia
      await tester.tap(find.text('Indonesia'));
      await tester.pumpAndSettle();

      // UI switches to Indonesian
      expect(find.text('Fokus & Efisien'), findsOneWidget);
      expect(find.text('Mulai Sekarang'), findsOneWidget);
      expect(find.text('Sudah punya akun? Masuk'), findsOneWidget);

      // Tap English switches back
      await tester.tap(find.text('English'));
      await tester.pumpAndSettle();

      expect(find.text('Focus & Efficient'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);
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

      // 4. Onboarding Step 1: Personalize your Workspace
      expect(find.text('Personalize your Workspace'), findsOneWidget);
      expect(find.text('1 of 5 steps'), findsOneWidget);
      expect(find.text('General'), findsOneWidget);
      expect(find.text('No Categories Configured'), findsOneWidget);

      // Tap General to select occupancy & populate categories
      await tester.tap(find.text('General'));
      await tester.pumpAndSettle();
      expect(find.text('Personal'), findsOneWidget);

      // Item 8: Username field starts empty, so user enters their name
      await tester.enterText(find.byType(FocientInputField).first, 'Alex Morgan');
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 5. Onboarding Step 2: Working Rhythm Setup
      expect(find.text('Working Rhythm Setup'), findsOneWidget);
      expect(find.text('2 of 5 steps'), findsOneWidget);
      expect(find.text('Early Bird'), findsOneWidget);
      expect(find.text('Morning'), findsOneWidget);
      expect(find.text('Structured'), findsOneWidget);

      // Select Early Bird & Structured
      await tester.ensureVisible(find.text('Early Bird'));
      await tester.tap(find.text('Early Bird'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Structured'));
      await tester.tap(find.text('Structured'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 6. Onboarding Step 3: Time Allocation Setup
      expect(find.text('Time Allocation Setup'), findsOneWidget);
      expect(find.text('3 of 5 steps'), findsOneWidget);
      expect(find.text('Daily Active Hour'), findsOneWidget);
      expect(find.text('Rest Time per Task'), findsOneWidget);

      // Select Start Hour (09:00 default in picker)
      await tester.tap(find.text('Input here').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();

      // Select End Hour (17:00 default in picker)
      await tester.tap(find.text('Input here').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 7. Onboarding Step 4: Enter your first task
      expect(find.text('Enter your first task'), findsOneWidget);
      expect(find.text('4 of 5 steps'), findsOneWidget);
      expect(find.text('Your Task Category'), findsOneWidget);
      expect(find.text('First Task'), findsOneWidget);
      expect(find.text('Add your Task'), findsOneWidget);

      // Open Create Task bottom sheet
      await tester.tap(find.text('Add your Task'));
      await tester.pumpAndSettle();

      expect(find.text('Create Your Task'), findsOneWidget);
      await tester.enterText(find.byType(TextField).first, 'Create the Annual OKR');
      await tester.tap(find.text('Personal').last);
      await tester.tap(find.text('25 Minute'));
      await tester.tap(find.text('Deep Focus'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Confirm'));
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      // Verify task added card
      expect(find.text('Create the Annual OKR'), findsOneWidget);

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 8. Onboarding Step 5: Your first plan is complete
      expect(find.text('Your first plan is complete'), findsOneWidget);
      expect(find.text('5 of 5 steps'), findsOneWidget);
      expect(find.text('Today Workload'), findsOneWidget);
      expect(find.text('Start your Current Plan!'), findsOneWidget);

      await tester.ensureVisible(find.text('Start your Current Plan!'));
      await tester.tap(find.text('Start your Current Plan!'));
      await tester.pumpAndSettle();

      // 9. Authenticated Dashboard!
      expect(find.text('My Dashboard'), findsOneWidget);
      expect(find.textContaining('Alex Morgan'), findsOneWidget);
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
      expect(find.text('My Dashboard'), findsOneWidget);
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

  group('FoCient Onboarding Workspace Screen Widget Tests', () {
    testWidgets('Renders all Step 1 UI elements matching specifications', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientOnboardingWorkspaceScreen(),
          ),
        ),
      );

      // 1. Step indicator and progress
      expect(find.text('1 of 5 steps'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // 2. Title & Subtitle
      expect(find.text('Personalize your Workspace'), findsOneWidget);
      expect(
        find.text('enter your nickname and occupancies for setup your personal task categories'),
        findsOneWidget,
      );

      // 3. Username field
      expect(find.text('Username'), findsOneWidget);
      expect(find.text('Enter your username here'), findsOneWidget);

      // 4. Occupancies chips
      expect(find.text('Occupancies'), findsOneWidget);
      expect(find.text('General'), findsOneWidget);
      expect(find.text('Entrepreneur'), findsOneWidget);
      expect(find.text('Professional'), findsOneWidget);
      expect(find.text('Freelancer'), findsOneWidget);
      expect(find.text('Student'), findsOneWidget);
      expect(find.text('Creator'), findsOneWidget);

      // 5. Empty State Task Categories
      expect(find.text('Task Category'), findsOneWidget);
      expect(find.text('No Categories Configured'), findsOneWidget);
      expect(find.text('+ Add Category'), findsOneWidget);

      // 6. Next CTA button
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('Occupancy chip selection automatically updates task category template', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientOnboardingWorkspaceScreen(),
          ),
        ),
      );

      // Initially empty state
      expect(find.text('No Categories Configured'), findsOneWidget);

      // Tap "General" chip
      await tester.tap(find.text('General'));
      await tester.pumpAndSettle();
      expect(find.text('Personal'), findsOneWidget);
      expect(find.text('Deep Work'), findsOneWidget);

      // Tap "Entrepreneur" chip
      await tester.tap(find.text('Entrepreneur'));
      await tester.pumpAndSettle();

      // Categories should now be Entrepreneur template
      expect(find.text('Strategic'), findsOneWidget);
      expect(find.text('Execution'), findsOneWidget);
      expect(find.text('Meeting'), findsOneWidget);
      expect(find.text('Personal'), findsNothing);

      // Tap "Student" chip
      await tester.ensureVisible(find.text('Student'));
      await tester.tap(find.text('Student'));
      await tester.pumpAndSettle();

      // Categories should now be Student template
      expect(find.text('Study & Class'), findsOneWidget);
      expect(find.text('Assignments'), findsOneWidget);
      expect(find.text('Self-Care'), findsOneWidget);
      expect(find.text('Strategic'), findsNothing);
    });

    testWidgets('Validates username and categories requirement before advancing', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => TestRealAuthNotifier()),
          ],
          child: const MaterialApp(
            home: FocientOnboardingWorkspaceScreen(),
          ),
        ),
      );

      // Clear the username field
      final usernameField = find.byType(TextField).first;
      await tester.enterText(usernameField, '');
      await tester.pumpAndSettle();

      // Tap Next
      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Shows error message
      expect(find.text('Username must be at least 2 characters.'), findsOneWidget);
    });
  });

  group('FoCient Add Task Category Sheet Widget Tests', () {
    testWidgets('Renders modal inputs and returns created category', (tester) async {
      WorkspaceCategory? created;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () async {
                  created = await AddTaskCategorySheet.show(context);
                },
                child: const Text('Open Sheet'),
              ),
            ),
          ),
        ),
      );

      // Open sheet
      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      // Check sheet elements
      expect(find.text('Category Name'), findsOneWidget);
      expect(find.text('Label Color'), findsOneWidget);
      expect(find.text('Focus Type'), findsOneWidget);
      expect(find.text('Light'), findsOneWidget);
      expect(find.text('Medium'), findsOneWidget);
      expect(find.text('Deep Focus'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Confirm'), findsOneWidget);

      // Enter category name
      final field = find.descendant(
        of: find.byType(AddTaskCategorySheet),
        matching: find.byType(TextField),
      );
      await tester.enterText(field, 'Research & Development');

      // Select Deep Focus
      await tester.tap(find.text('Deep Focus'));
      await tester.pumpAndSettle();

      // Tap Confirm
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      // Modal closed and category returned
      expect(created, isNotNull);
      expect(created!.name, 'Research & Development');
      expect(created!.focusType, FocusType.deepFocus);
    });
  });

  group('FoCient Onboarding Step 2: Working Rhythm Setup Screen Widget Tests', () {
    testWidgets('Renders all Step 2 elements matching specifications', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: FocientOnboardingRhythmScreen(),
        ),
      );

      // Indicator and progress bar
      expect(find.text('2 of 5 steps'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // Title & Subtitle
      expect(find.text('Working Rhythm Setup'), findsOneWidget);
      expect(
        find.text('Setup your daily energy rhythms and\nscheduling style'),
        findsOneWidget,
      );

      // Daily Energy Rhythm Cards structure
      expect(find.text('Daily Energy Rhythm'), findsOneWidget);
      expect(find.text('Early Bird'), findsOneWidget);
      expect(find.text('Morning'), findsOneWidget);
      expect(
        find.text('Your peak focus are from morning until before 12:00'),
        findsOneWidget,
      );

      expect(find.text('Steady Pacer'), findsOneWidget);
      expect(find.text('Afternoon'), findsOneWidget);
      expect(
        find.text('Your energy are on peak condition from 12:00 until 18:00'),
        findsOneWidget,
      );

      // Scheduling Style
      expect(find.text('Scheduling Style'), findsOneWidget);
      expect(find.text('Structured'), findsOneWidget);
      expect(find.text('Flexible'), findsOneWidget);

      // Next CTA
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('Allows selecting rhythm cards and scheduling style, then invokes onNext', (tester) async {
      String? selectedRhythm;
      String? selectedStyle;

      await tester.pumpWidget(
        MaterialApp(
          home: FocientOnboardingRhythmScreen(
            onNext: (rhythm, style) {
              selectedRhythm = rhythm;
              selectedStyle = style;
            },
          ),
        ),
      );

      // Select Steady Pacer
      await tester.ensureVisible(find.text('Steady Pacer'));
      await tester.tap(find.text('Steady Pacer'));
      await tester.pumpAndSettle();

      // Select Flexible
      await tester.ensureVisible(find.text('Flexible'));
      await tester.tap(find.text('Flexible'));
      await tester.pumpAndSettle();

      // Tap Next
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(selectedRhythm, 'Steady Pacer');
      expect(selectedStyle, 'Flexible');
    });
  });

  group('FoCient Onboarding Step 3: Time Allocation Setup Screen Widget Tests', () {
    testWidgets('Renders all Step 3 elements matching specifications', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: FocientOnboardingTimeScreen(
            initialStartHour: '09:00 AM',
            initialEndHour: '05:00 PM',
            initialRestMinutes: 20,
          ),
        ),
      );

      // Indicator and progress bar
      expect(find.text('3 of 5 steps'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // Title & Subtitle
      expect(find.text('Time Allocation Setup'), findsOneWidget);
      expect(
        find.text('Enter your daily working/active hour, rest\nhour and off hour, it’s help you to avoiding\nburnout and toxic productivity'),
        findsOneWidget,
      );

      // Daily Active Hour
      expect(find.text('Daily Active Hour'), findsOneWidget);
      expect(find.text('Start Hour'), findsOneWidget);
      expect(find.text('09:00 AM'), findsOneWidget);
      expect(find.text('End Hour'), findsOneWidget);
      expect(find.text('05:00 PM'), findsOneWidget);

      // Rest Time per Task
      expect(find.text('Rest Time per Task'), findsOneWidget);
      expect(find.text('20 Minutes / Task'), findsOneWidget);
      expect(find.byType(FocientRestTimeSlider), findsOneWidget);

      // Next CTA
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('Rest Time slider interaction updates dynamic task rest minutes and submits', (tester) async {
      String? submittedStart;
      String? submittedEnd;
      int? submittedRest;

      await tester.pumpWidget(
        MaterialApp(
          home: FocientOnboardingTimeScreen(
            initialStartHour: '09:00 AM',
            initialEndHour: '05:00 PM',
            initialRestMinutes: 5,
            onNext: (start, end, rest) {
              submittedStart = start;
              submittedEnd = end;
              submittedRest = rest;
            },
          ),
        ),
      );

      expect(find.text('5 Minutes / Task'), findsOneWidget);

      // Tap slider to change rest time
      final sliderFinder = find.byType(FocientRestTimeSlider);
      expect(sliderFinder, findsOneWidget);

      // Tap on the slider at 50% width
      await tester.tap(sliderFinder);
      await tester.pumpAndSettle();

      // Submit
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(submittedStart, '09:00');
      expect(submittedEnd, '17:00');
      expect(submittedRest, isNotNull);
    });

    testWidgets('Step 3 defaults to empty state, 0 min rest, and toggles 12h/24h format', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: FocientOnboardingTimeScreen(),
        ),
      );

      // Daily Active Hour starts empty
      expect(find.text('Input here'), findsNWidgets(2));
      // Rest Time defaults to 0 Minute / Task
      expect(find.text('0 Minutes / Task'), findsOneWidget);

      // Format switchers exist
      expect(find.text('12h'), findsOneWidget);
      expect(find.text('24h'), findsOneWidget);

      // Tap 24h toggle
      await tester.tap(find.text('24h'));
      await tester.pumpAndSettle();

      // Tapping Next without hours shows error
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      expect(find.text('Silakan atur jam mulai dan jam selesai kerja terlebih dahulu.'), findsOneWidget);
    });
  });

  group('FoCient Onboarding Step 4: Enter your first task Screen Widget Tests', () {
    testWidgets('Renders all Step 4 elements with Page 1 consistent category style', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: FocientOnboardingTaskScreen(
            categories: const [
              WorkspaceCategory(name: 'Strategic', color: Color(0xFF7C3AED), colorHex: '#7C3AED'),
              WorkspaceCategory(name: 'Execution', color: Color(0xFF0284C7), colorHex: '#0284C7'),
              WorkspaceCategory(name: 'Operation', color: Color(0xFF0D9488), colorHex: '#0D9488'),
            ],
          ),
        ),
      );

      // Indicator and progress bar
      expect(find.text('4 of 5 steps'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // Title & Subtitle
      expect(find.text('Enter your first task'), findsOneWidget);
      expect(
        find.text('Start with your most important task, the\nsystem will prioritize the execution'),
        findsOneWidget,
      );

      // Your Task Category (Strict Page 1 UI Consistency)
      expect(find.text('Your Task Category'), findsOneWidget);
      expect(find.text('Strategic'), findsOneWidget);
      expect(find.text('Execution'), findsOneWidget);
      expect(find.text('Operation'), findsOneWidget);

      // First Task Section with (A) Add Task card
      expect(find.text('First Task'), findsOneWidget);
      expect(find.byType(FocientAddTaskCard), findsOneWidget);
      expect(find.text('Add your Task'), findsOneWidget);

      // Next CTA
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('Opens Create Task modal, confirms, and renders (B) Task Added card', (tester) async {
      List<OnboardingTask>? confirmedTasks;

      await tester.pumpWidget(
        MaterialApp(
          home: FocientOnboardingTaskScreen(
            categories: const [
              WorkspaceCategory(name: 'Strategic', color: Color(0xFF7C3AED), colorHex: '#7C3AED'),
              WorkspaceCategory(name: 'Execution', color: Color(0xFF0284C7), colorHex: '#0284C7'),
            ],
            defaultRestMinutes: 20,
            onNext: (tasks) {
              confirmedTasks = tasks;
            },
          ),
        ),
      );

      // Tap Add Task card
      await tester.tap(find.text('Add your Task'));
      await tester.pumpAndSettle();

      // In Create Task Bottom Sheet
      expect(find.text('Create Your Task'), findsOneWidget);
      expect(find.text('Task Name'), findsOneWidget);
      expect(find.text('Task Categories'), findsOneWidget);
      expect(find.text('Task Duration'), findsOneWidget);
      expect(find.text('Focus Type'), findsOneWidget);
      expect(find.text('Time Slot'), findsOneWidget);
      expect(find.text('Backlog Task'), findsOneWidget);
      expect(find.text('Need to Rest After Task?'), findsOneWidget);

      // Rule: whole input form starts in empty state
      expect(find.text('Select date'), findsOneWidget);
      expect(find.text('Select hour'), findsOneWidget);

      // Enter task info
      await tester.enterText(find.byType(TextField).first, 'Create the Annual OKR');
      await tester.tap(find.text('Strategic').last);
      await tester.tap(find.text('25 Minute'));
      await tester.tap(find.text('Deep Focus'));
      await tester.pumpAndSettle();

      // Confirm
      await tester.ensureVisible(find.text('Confirm'));
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      // Verified: (B) Task Added card is rendered
      expect(find.byType(FocientTaskAddedCard), findsOneWidget);
      expect(find.text('Create the Annual OKR'), findsOneWidget);
      expect(find.text('25" Task'), findsOneWidget);
      // Item 2: Rest badge is removed across all task cards
      expect(find.text('20" Rest'), findsNothing);
      expect(find.text('Strategic'), findsAtLeastNWidgets(1));

      // Tap Next to submit
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(confirmedTasks, isNotNull);
      expect(confirmedTasks!.length, 1);
      expect(confirmedTasks!.first.title, 'Create the Annual OKR');
    });
  });

  group('FoCient Onboarding Step 5: Your first plan is complete Screen Widget Tests', () {
    testWidgets('Renders all Step 5 elements matching specifications', (tester) async {
      bool planStarted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: FocientOnboardingReviewScreen(
            tasks: const [
              OnboardingTask(
                id: 't-1',
                title: 'Create the Annual OKR',
                categoryName: 'Strategy',
                categoryColor: Color(0xFF7C3AED),
                durationMinutes: 25,
                restMinutes: 20,
              ),
            ],
            onStartPlan: () {
              planStarted = true;
            },
          ),
        ),
      );

      // Indicator and progress bar
      expect(find.text('5 of 5 steps'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsNWidgets(2));

      // Title & Subtitle
      expect(find.text('Your first plan is complete'), findsOneWidget);
      expect(
        find.text("Let's review your latest task and give us\nthe notification permission"),
        findsOneWidget,
      );

      // Today Workload Card (Dynamically computed: 25m task + 20m rest = 45m / 480m = 9% - Light)
      expect(find.text('Today Workload'), findsOneWidget);
      expect(find.textContaining('Light'), findsOneWidget);
      expect(find.text('Show More'), findsOneWidget);
      expect(find.text('Top 3 Task Detail'), findsOneWidget);
      expect(find.text('Create the Annual OKR'), findsOneWidget);
      expect(find.text('Strategy'), findsOneWidget);

      // Notification Toggle
      expect(find.text('Notification'), findsOneWidget);

      // Start your Current Plan CTA
      expect(find.text('Start your Current Plan!'), findsOneWidget);
      await tester.tap(find.text('Start your Current Plan!'));
      await tester.pumpAndSettle();

      expect(planStarted, isTrue);
    });

    testWidgets('Step 5 renders dynamic empty workload when no tasks are added', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: FocientOnboardingReviewScreen(
            tasks: [],
          ),
        ),
      );

      expect(find.text('Today Workload'), findsOneWidget);
      expect(find.text('0% - Empty Plan'), findsOneWidget);
      expect(find.text('No tasks in your focus plan yet.'), findsOneWidget);
    });
  });

  group('FoCient Dashboard Screen Widget Tests', () {
    testWidgets('Renders all Dashboard elements matching mockup specifications', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientDashboardScreen(forceShowReschedule: true),
          ),
        ),
      );

      // Top app bar
      expect(find.text('Hi, John Doe'), findsOneWidget);
      expect(find.text('60%'), findsOneWidget);

      // Header
      expect(find.text('My Dashboard'), findsOneWidget);
      expect(find.text('Monday, October 5th 2026'), findsOneWidget);

      // Card 1: Today Workload
      expect(find.text('Today Workload'), findsOneWidget);
      expect(find.text('60% - Optimal'), findsOneWidget);
      expect(find.text("Total Today's Task"), findsOneWidget);
      expect(find.text('12 Tasks'), findsOneWidget);
      expect(find.text('High Priority'), findsOneWidget);
      expect(find.text('3 Tasks'), findsOneWidget);
      expect(find.text('Medium Priority'), findsOneWidget);
      expect(find.text('5 Tasks'), findsOneWidget);
      expect(find.text('Low Priority'), findsOneWidget);
      expect(find.text('4 Tasks'), findsOneWidget);

      // Card 2: Task Reschedule Suggestion
      expect(find.text('Task Reschedule Suggestion'), findsOneWidget);
      expect(find.textContaining('Message to best friend'), findsOneWidget);
      expect(find.text('Implement..'), findsOneWidget);
      expect(find.text('Mess..'), findsOneWidget);
      expect(find.text('Reschedule Later'), findsOneWidget);
      expect(find.text('Reschedule Now'), findsOneWidget);

      // Card 3: Top 3 Priority Task
      await tester.ensureVisible(find.text('Top 3 Priority Task'));
      expect(find.text('Top 3 Priority Task'), findsOneWidget);
      expect(find.text('Show Less'), findsOneWidget);
      expect(find.text('Top 3 Task Detail'), findsOneWidget);
      expect(find.text('Create the Annual OKR'), findsOneWidget);
      expect(find.text('October, 10th - 10:00'), findsOneWidget);
      expect(find.text('25" Task'), findsOneWidget);
      // Item 2: Rest badge removed across all task cards
      expect(find.text('20" Rest'), findsNothing);
      expect(find.text('Strategic'), findsAtLeastNWidgets(1));

      // Section 4: Today Timeline
      await tester.ensureVisible(find.text('Today Timeline'));
      expect(find.text('Today Timeline'), findsOneWidget);
      expect(find.text('Meeting C..'), findsOneWidget);
      expect(find.text('Create th..'), findsOneWidget);

      // Section 5: Quick Add Task
      await tester.ensureVisible(find.text('Quick Add Task'));
      expect(find.text('Quick Add Task'), findsOneWidget);
      expect(find.text('Task Name'), findsOneWidget);
      expect(find.text('Input in here!'), findsOneWidget);
      expect(find.text('Task Categories'), findsOneWidget);
      expect(find.text('Task Duration'), findsOneWidget);
      expect(find.text('Focus Type'), findsOneWidget);
      expect(find.text('Confirm New Task'), findsOneWidget);

      // Bottom Navigation Bar
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Plan'), findsOneWidget);
      expect(find.text('Add Task'), findsOneWidget);
      expect(find.text('Task List'), findsOneWidget);
      expect(find.text('Insights'), findsOneWidget);
    });

    testWidgets('Toggles Top 3 Priority Task between compact and detailed view', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientDashboardScreen(forceShowReschedule: true),
          ),
        ),
      );

      // Initial state is detailed view (Show Less visible)
      await tester.ensureVisible(find.text('Show Less'));
      expect(find.text('Show Less'), findsOneWidget);
      expect(find.text('October, 10th - 10:00'), findsOneWidget);

      // Tap Show Less to toggle to compact view (matching Image 1)
      await tester.tap(find.text('Show Less'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Show More'));
      expect(find.text('Show More'), findsOneWidget);
      expect(find.text('October, 10th - 10:00'), findsNothing);
      expect(find.text('Create the Annual OKR'), findsOneWidget);

      // Tap Show More to return to detailed view (matching Image 2)
      await tester.tap(find.text('Show More'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Show Less'));
      expect(find.text('Show Less'), findsOneWidget);
      expect(find.text('October, 10th - 10:00'), findsOneWidget);
    });

    testWidgets('Reschedule Now applies collision resolution guilt-free', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientDashboardScreen(forceShowReschedule: true),
          ),
        ),
      );

      // Tap Reschedule Now
      await tester.ensureVisible(find.text('Reschedule Now'));
      await tester.tap(find.text('Reschedule Now'));
      await tester.pumpAndSettle();

      // Card turns into calm resolved message
      expect(find.textContaining("Today's schedule is calm and collision-free"), findsOneWidget);
    });

    testWidgets('Quick Add Task form validates and adds task to dashboard', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
          ],
          child: const MaterialApp(
            home: FocientDashboardScreen(forceShowReschedule: true),
          ),
        ),
      );

      // Initial empty state: 0 Tasks, 0% - Empty Plan
      expect(find.text('0 Tasks'), findsAtLeastNWidgets(1));
      expect(find.text('0% - Empty Plan'), findsOneWidget);

      // Scroll to Quick Add Task
      await tester.ensureVisible(find.text('Confirm New Task'));

      // Enter task name
      final inputField = find.byType(TextField);
      await tester.enterText(inputField, 'Design Mobile Dashboard');

      // Tap Confirm New Task
      await tester.tap(find.text('Confirm New Task'));
      await tester.pumpAndSettle();

      // Total tasks increments to 1 Task
      expect(find.text('1 Tasks'), findsAtLeastNWidgets(1));
    });
  });

  group('FoCient Today Plan Screen Widget Tests', () {
    testWidgets('Renders all Planning screen elements matching mockup specifications', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            planningProvider.overrideWith((ref) {
              final notifier = PlanningNotifier(PlanningState.populatedSample());
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Top App Bar
      expect(find.text('Your Plan'), findsOneWidget);
      expect(find.text('60%'), findsNWidgets(2)); // Both bell pill and Monday bar are 60%

      // Section 1: Task Categories
      expect(find.text('Task Categories'), findsOneWidget);
      expect(find.text('All Task'), findsOneWidget);
      expect(find.text('Total: 10h'), findsOneWidget);
      expect(find.text('Project'), findsAtLeastNWidgets(1));
      expect(find.text('2h / max 6h'), findsOneWidget);
      expect(find.text('Personal'), findsOneWidget);
      expect(find.text('30min / max 2h'), findsOneWidget);

      // Section 2: Weekly Workload Distribution
      expect(find.text('Weekly Workload Distribution'), findsOneWidget);
      expect(find.text('Monday, October 5th 2026'), findsOneWidget);
      expect(find.text('80%'), findsOneWidget);
      expect(find.text('85%'), findsOneWidget);
      expect(find.text('56%'), findsOneWidget);
      expect(find.text('62%'), findsOneWidget);
      expect(find.text('88%'), findsOneWidget);
      expect(find.text('41%'), findsOneWidget);

      // Metrics
      expect(find.text('Active Hours Allocated'), findsOneWidget);
      expect(find.text('5.5 Hours'), findsOneWidget);
      expect(find.text('Buffer Hours Allocated'), findsOneWidget);
      expect(find.text('45 Minutes'), findsOneWidget);
      expect(find.text('On Scheduled Task'), findsOneWidget);
      expect(find.text('54 Task'), findsOneWidget);

      // Section 3: Smart Rebalancer
      expect(find.text('Smart Rebalancer'), findsOneWidget);
      expect(find.textContaining('Your workload at Wednesday reach 85%'), findsOneWidget);
      expect(find.text('Show More'), findsOneWidget);
      expect(find.text('Implement Typography Token'), findsOneWidget);
      expect(find.text('Implement Color Palette Token'), findsOneWidget);
      expect(find.text('Reschedule Task'), findsOneWidget);
      expect(find.text('Keep The Schedule'), findsOneWidget);

      // Section 4: Backlog Scheduler
      await tester.ensureVisible(find.text('Backlog Scheduler'));
      expect(find.text('Backlog Scheduler'), findsOneWidget);
      expect(find.text('Draw and Visualize the Architecture'), findsOneWidget);
      expect(find.text('Make the DFD and ERD'), findsOneWidget);
      expect(find.text('Not yet scheduled'), findsAtLeastNWidgets(2));

      // Bottom Navigation Bar
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Plan'), findsOneWidget);
      expect(find.text('Add Task'), findsOneWidget);
      expect(find.text('Task List'), findsOneWidget);
      expect(find.text('Insights'), findsOneWidget);
    });

    testWidgets('Toggles Smart Rebalancer between compact view (Image 1) and detailed cards (Image 2)', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            planningProvider.overrideWith((ref) {
              final notifier = PlanningNotifier(PlanningState.populatedSample());
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Starts in compact view (Show More)
      expect(find.text('Show More'), findsOneWidget);
      expect(find.text('Previous Schedule'), findsNothing);

      // Tap Show More to toggle to detailed cards (Image 2)
      await tester.ensureVisible(find.text('Show More'));
      await tester.tap(find.text('Show More'));
      await tester.pumpAndSettle();

      expect(find.text('Show Less'), findsOneWidget);
      expect(find.text('Previous Schedule'), findsAtLeastNWidgets(1));
      expect(find.text('Wednesday, 12:00'), findsOneWidget);
      expect(find.text('Thursday, 10:30'), findsOneWidget);
      expect(find.text('45" Task'), findsAtLeastNWidgets(2));
      expect(find.text('10" Rest'), findsAtLeastNWidgets(2));

      // Tap Show Less to return to compact bullet view (Image 1)
      await tester.tap(find.text('Show Less'));
      await tester.pumpAndSettle();

      expect(find.text('Show More'), findsOneWidget);
      expect(find.text('Previous Schedule'), findsNothing);
    });

    testWidgets('Reschedule Task applies rebalancing and updates Wednesday workload from 85% to 65%', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            planningProvider.overrideWith((ref) {
              final notifier = PlanningNotifier(PlanningState.populatedSample());
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Initial Wednesday is 85%
      expect(find.text('85%'), findsOneWidget);

      // Tap Reschedule Task
      await tester.ensureVisible(find.text('Reschedule Task'));
      await tester.tap(find.text('Reschedule Task'));
      await tester.pumpAndSettle();

      // Wednesday updated to 65%, Thursday updated to 75%
      expect(find.text('65%'), findsOneWidget);
      expect(find.text('75%'), findsOneWidget);
      expect(find.text('85%'), findsNothing);
      expect(find.textContaining('Schedule rebalanced successfully!'), findsAtLeastNWidgets(1));
    });

    testWidgets('Backlog Scheduler modal schedules task into active day', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            planningProvider.overrideWith((ref) {
              final notifier = PlanningNotifier(PlanningState.populatedSample());
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Initial scheduled tasks count: 54 Task
      expect(find.text('54 Task'), findsOneWidget);

      // Tap on backlog item
      await tester.ensureVisible(find.text('Draw and Visualize the Architecture'));
      await tester.tap(find.text('Draw and Visualize the Architecture'));
      await tester.pumpAndSettle();

      // Bottom sheet appears
      expect(find.text('Schedule Backlog Task'), findsOneWidget);
      expect(find.text('Schedule for Today (15:00)'), findsOneWidget);

      // Tap schedule option
      await tester.tap(find.text('Schedule for Today (15:00)'));
      await tester.pumpAndSettle();

      // On Scheduled Task increments to 55 Task
      await tester.ensureVisible(find.text('55 Task'));
      expect(find.text('55 Task'), findsOneWidget);
    });

    testWidgets('Empty state renders gracefully with empty allocations and guidance', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.empty())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Renders with 0% and empty guidance
      expect(find.text('Your Plan'), findsOneWidget);
      expect(find.text('0%'), findsAtLeastNWidgets(1));
      expect(find.text('0.0 Hours'), findsOneWidget);
      expect(find.text('0 Task'), findsOneWidget);
      expect(find.textContaining('No tasks in backlog yet.'), findsOneWidget);
    });
  });

  group('FoCient Task List, Add Task, and Task Detail Feature Tests', () {
    testWidgets('Task List renders October 2026 calendar and October 3rd schedule items', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTaskListScreen(initialSelectedDay: 3),
          ),
        ),
      );

      // Top bar & month navigation
      expect(find.text('Your Task List'), findsOneWidget);
      expect(find.text('October 2026'), findsOneWidget);
      expect(find.text('October, 3rd 2026'), findsOneWidget);

      // Tasks on October 3rd
      expect(find.text('30min Incline Walking Cardio'), findsOneWidget);
      expect(find.text('45min Leg Day - Strength'), findsOneWidget);
      expect(find.text('Have a Brunch'), findsOneWidget);
      expect(find.text('Project Progress Discussion'), findsOneWidget);

      // Resting buffers
      expect(find.textContaining('Resting After "30min Incline'), findsOneWidget);
      expect(find.textContaining('Resting After "45min Leg Da'), findsOneWidget);
    });

    testWidgets('Flow 1: Task List -> Task Detail when selecting a task', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientTaskListScreen(initialSelectedDay: 3),
          ),
        ),
      );

      // Scroll to and tap on "Project Progress Discussion"
      await tester.ensureVisible(find.text('Project Progress Discussion'));
      await tester.tap(find.text('Project Progress Discussion'));
      await tester.pumpAndSettle();

      // Task Detail screen opens!
      expect(find.text('Task Detail'), findsOneWidget);
      expect(find.text('Project Progress Discussion'), findsOneWidget);
      expect(find.text('Meeting'), findsOneWidget);
      expect(find.text('Deep Focus'), findsOneWidget);
      expect(find.text('Task Date'), findsOneWidget);
      expect(find.text('October, 3rd 2026'), findsOneWidget);
      expect(find.text('Task Start'), findsOneWidget);
      expect(find.text('11:40'), findsOneWidget);
      expect(find.text('Duration'), findsOneWidget);
      expect(find.text('60 Minutes'), findsOneWidget);
      expect(find.text('Rest Time'), findsOneWidget);
      expect(find.text('10 Minutes'), findsOneWidget);
      expect(find.text('Cancel Task'), findsOneWidget);
      expect(find.text('Edit Task'), findsOneWidget);
    });

    testWidgets('Flow 2: Dashboard -> Task List and Add Task via bottom navbar', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.seedSampleTasks();
              return notifier;
            }),
          ],
          child: const MaterialApp(
            home: FocientDashboardScreen(forceShowReschedule: true),
          ),
        ),
      );

      // Currently on Dashboard
      expect(find.text('My Dashboard'), findsOneWidget);

      // Tap Task List tab (tab 3) in bottom navbar
      await tester.tap(find.text('Task List'));
      await tester.pumpAndSettle();

      // Navigated to Task List!
      expect(find.text('Your Task List'), findsOneWidget);
      expect(find.text('October 2026'), findsOneWidget);

      // Tap Add Task tab (tab 2) in bottom navbar
      await tester.tap(find.text('Add Task').last);
      await tester.pumpAndSettle();

      // Navigated to Add Task!
      expect(find.text('Add Your Task'), findsOneWidget);
      expect(find.text('Task Name'), findsOneWidget);
      expect(find.text('Task Categories'), findsOneWidget);
      expect(find.text('Task Duration'), findsOneWidget);
      expect(find.text('Focus Type'), findsOneWidget);
      expect(find.text('Time Slot'), findsOneWidget);
      expect(find.text('Backlog Task'), findsOneWidget);
      expect(find.text('Need to Rest After Task?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Add New Task'), findsOneWidget);
    });

    testWidgets('Add Task form fills fields and saves new task', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
          ],
          child: const MaterialApp(
            home: FocientAddTaskScreen(),
          ),
        ),
      );

      // Verify initial empty state
      expect(find.text('Add Your Task'), findsOneWidget);
      expect(find.text('Input in here!'), findsAtLeastNWidgets(2));

      // Enter Task Name
      final nameField = find.byType(TextField).first;
      await tester.enterText(nameField, 'Finalize Security Audit');

      // Select category
      await tester.tap(find.text('Execution'));
      await tester.pumpAndSettle();

      // Select duration
      await tester.tap(find.text('20 Minute'));
      await tester.pumpAndSettle();

      // Tap Add New Task
      await tester.ensureVisible(find.text('Add New Task'));
      await tester.tap(find.text('Add New Task'));
      await tester.pumpAndSettle();

      // Snackbar confirmation
      expect(find.textContaining('added to schedule successfully!'), findsOneWidget);
    });

    testWidgets('Task Detail allows Edit Task and Cancel Task', (tester) async {
      final sampleTask = MobileTask(
        id: 't-test-1',
        title: 'Project Progress Discussion',
        durationMinutes: 60,
        priority: TaskPriorityEnum.top3,
        energyLevel: EnergyLevelEnum.high,
        categoryName: 'Meeting',
        categoryColor: const Color(0xFFD97706),
        restMinutes: 10,
        dateDisplay: 'October, 3rd 2026',
        startHourDisplay: '11:40',
        focusType: 'Deep Focus',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) {
              final notifier = TaskListNotifier([]);
              notifier.addTask(sampleTask);
              return notifier;
            }),
          ],
          child: MaterialApp(
            home: FocientTaskDetailScreen(task: sampleTask),
          ),
        ),
      );

      expect(find.text('Project Progress Discussion'), findsOneWidget);

      // Tap Edit Task opens Add/Edit screen
      await tester.ensureVisible(find.text('Edit Task'));
      await tester.tap(find.text('Edit Task'));
      await tester.pumpAndSettle();

      expect(find.text('Edit Your Task'), findsOneWidget);
      expect(find.text('Save Changes'), findsOneWidget);

      // Tap Cancel on edit screen returns to detail
      await tester.ensureVisible(find.text('Cancel'));
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(find.text('Task Detail'), findsOneWidget);

      // Tap Cancel Task opens confirm dialog
      await tester.ensureVisible(find.text('Cancel Task'));
      await tester.tap(find.text('Cancel Task'));
      await tester.pumpAndSettle();

      expect(find.text('Cancel Task?'), findsOneWidget);
      expect(find.text('Delete Task'), findsOneWidget);
    });
  });

  group('FoCient Insight Screen (Image 1 Specifications)', () {
    testWidgets('Renders all Insight elements, switches period data, and displays metric overviews', (tester) async {
      int navigatedTab = -1;

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: FocientInsightScreen(
              onNavigateTab: (tab) => navigatedTab = tab,
            ),
          ),
        ),
      );

      // 1. Top Bar
      expect(find.text('Insight'), findsOneWidget);
      expect(find.text('60%'), findsOneWidget);

      // 2. Section 1: Workload Overview & Period Pills
      expect(find.text('Workload Overview'), findsOneWidget);
      expect(find.text('3 days'), findsOneWidget);
      expect(find.text('7 days'), findsOneWidget);
      expect(find.text('30 days'), findsOneWidget);
      expect(find.text('90 days'), findsOneWidget);

      // Default: 3 days data matching Image 1
      expect(find.text('Avg. Workload'), findsOneWidget);
      expect(find.text('67.4%'), findsOneWidget);
      expect(find.text('Overload Day'), findsOneWidget);
      expect(find.text('2 Days'), findsAtLeastNWidgets(2)); // Overload & Light day
      expect(find.text('Optimal Day'), findsOneWidget);
      expect(find.text('3 Days'), findsOneWidget);

      // 3. Section 2: Metric Overview
      expect(find.text('Metric Overview'), findsOneWidget);
      expect(find.text('Task Completion Rate'), findsOneWidget);
      expect(find.text('86%'), findsOneWidget);
      expect(find.text('Top 3 Task Alignment'), findsAtLeastNWidgets(1));
      expect(find.text('100%'), findsOneWidget);

      // Detailed Metric Card
      expect(find.text('Detailed Metric'), findsOneWidget);
      expect(find.text('Buffer Retention Rate'), findsOneWidget);
      expect(find.text('65%'), findsOneWidget);
      expect(find.text('84%'), findsOneWidget);
      expect(find.text('Peak Hour Focus'), findsOneWidget);
      expect(find.text('08:30 - 12:30'), findsOneWidget);

      // 4. Section 3: Time Allocation
      await tester.ensureVisible(find.text('Time Allocation'));
      expect(find.text('Time Allocation'), findsOneWidget);
      expect(find.text('Total Time'), findsOneWidget);
      expect(find.text('100 Hours'), findsOneWidget);
      expect(find.text('Project'), findsOneWidget);
      expect(find.text('36 / 50 Hours'), findsOneWidget);
      expect(find.text('Personal'), findsOneWidget);
      expect(find.text('15 / 30 Hours'), findsOneWidget);
      expect(find.text('Relationship'), findsOneWidget);
      expect(find.text('12 / 20 Hours'), findsOneWidget);

      // 5. Test dynamic period pill tap: tap '7 days'
      await tester.ensureVisible(find.text('7 days'));
      await tester.tap(find.text('7 days'));
      await tester.pumpAndSettle();

      expect(find.text('71.2%'), findsOneWidget);
      expect(find.text('88%'), findsOneWidget);

      // 6. Bottom navigation
      await tester.tap(find.text('Home'));
      await tester.pumpAndSettle();
      expect(navigatedTab, 0);
    });
  });

  group('FoCient Settings Screen (Image 2 Specifications)', () {
    testWidgets('Renders all 6 grouped settings sections and interactive sheets', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const FocientSettingsScreen(),
          ),
        ),
      );

      // Top Bar
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('60%'), findsOneWidget);

      // Section 1: User Profile
      expect(find.text('User Profile'), findsOneWidget);
      expect(find.text('Username and Identity'), findsOneWidget);
      expect(find.text('Main Role'), findsOneWidget);
      expect(find.text('Connected Account'), findsOneWidget);

      // Section 2: Workload Engine
      expect(find.text('Workload Engine'), findsOneWidget);
      expect(find.text('Daily Active Hour'), findsOneWidget);
      expect(find.text('Maximum Focus Hour'), findsOneWidget);
      expect(find.text('Guilt-Free Buffer Hour'), findsOneWidget);
      expect(find.text('Working Rhythm'), findsOneWidget);

      // Section 3: Preferences
      await tester.ensureVisible(find.text('Preferences'));
      expect(find.text('Preferences'), findsOneWidget);
      expect(find.text('Reschedule Setup'), findsOneWidget);
      expect(find.text('Advice and Recommendation'), findsOneWidget);
      expect(find.text('Overload Detection'), findsOneWidget);

      // Section 4: Notification
      await tester.ensureVisible(find.text('Notification').first);
      expect(find.text('Notification'), findsNWidgets(2)); // Section header & row item
      expect(find.text('Buffer Alert'), findsOneWidget);
      expect(find.text('Quiet Hour'), findsOneWidget);

      // Section 5: Tools Integration
      await tester.ensureVisible(find.text('Tools Integration'));
      expect(find.text('Tools Integration'), findsOneWidget);
      expect(find.text('Google Calendar'), findsOneWidget);
      expect(find.text('Synchronize'), findsOneWidget);

      // Section 6: Data, Privacy and Account
      await tester.ensureVisible(find.text('Data, Privacy and Account'));
      expect(find.text('Data, Privacy and Account'), findsOneWidget);
      expect(find.text('Export Data'), findsOneWidget);
      expect(find.text('Data Privacy Terms'), findsOneWidget);
      expect(find.text('Term and Conditions'), findsOneWidget);
      expect(find.text('History'), findsOneWidget);
      expect(find.text('Delete Account'), findsOneWidget);
      expect(find.text('Sign out'), findsOneWidget);

      // Tap Sign out opens confirmation
      await tester.ensureVisible(find.text('Sign out'));
      await tester.tap(find.text('Sign out'));
      await tester.pumpAndSettle();

      expect(find.text('Are you sure you want to sign out from your FoCient account?'), findsOneWidget);
    });
  });

  group('FoCient Create Task Modal Enhancements', () {
    testWidgets('Deep Focus badge is horizontally scrollable and Backlog toggle hides Time Slot', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () {
                  CreateTaskBottomSheet.show(
                    ctx,
                    availableCategories: const [
                      WorkspaceCategory(name: 'Strategic', color: Color(0xFF7C3AED), colorHex: '#7C3AED'),
                    ],
                  );
                },
                child: const Text('Open Modal'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Modal'));
      await tester.pumpAndSettle();

      // Deep Focus badge is rendered with full text
      expect(find.text('Deep Focus'), findsOneWidget);
      expect(find.text('Time Slot'), findsOneWidget);

      // Tap Backlog Task toggle switch
      await tester.ensureVisible(find.text('Backlog Task'));
      final switchFinder = find.byType(Switch);
      await tester.tap(switchFinder.first);
      await tester.pumpAndSettle();

      // Time Slot is hidden when backlog task is on
      expect(find.text('Time Slot'), findsNothing);
    });
  });
}

void _dummyBack() {}
