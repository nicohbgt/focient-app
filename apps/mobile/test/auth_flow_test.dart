import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/data/auth_state.dart';
import 'package:focient_mobile/data/workspace_category.dart';
import 'package:focient_mobile/presentation/primitive/focient_otp_input.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_auth_flow.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_forgot_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_login_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_otp_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_register_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_reset_password_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_welcome_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/add_task_category_sheet.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_workspace_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_rhythm_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_time_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_task_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_review_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/create_task_bottom_sheet.dart';
import 'package:focient_mobile/presentation/organism/focient_onboarding_task_card.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_onboarding_flow.dart';
import 'package:focient_mobile/presentation/primitive/focient_rest_time_slider.dart';
import 'package:focient_mobile/data/working_rhythm.dart';
import 'package:focient_mobile/data/onboarding_task.dart';

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

      // 4. Onboarding Step 1: Personalize your Workspace
      expect(find.text('Personalize your Workspace'), findsOneWidget);
      expect(find.text('1 of 5 steps'), findsOneWidget);
      expect(find.text('General'), findsOneWidget);
      expect(find.text('Personal'), findsOneWidget);

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 5. Onboarding Step 2: Working Rhythm Setup
      expect(find.text('Working Rhythm Setup'), findsOneWidget);
      expect(find.text('2 of 5 steps'), findsOneWidget);
      expect(find.text('Early Bird'), findsOneWidget);
      expect(find.text('Morning'), findsOneWidget);
      expect(find.text('Structured'), findsOneWidget);

      await tester.ensureVisible(find.text('Next'));
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // 6. Onboarding Step 3: Time Allocation Setup
      expect(find.text('Time Allocation Setup'), findsOneWidget);
      expect(find.text('3 of 5 steps'), findsOneWidget);
      expect(find.text('Daily Active Hour'), findsOneWidget);
      expect(find.text('Rest Time per Task'), findsOneWidget);

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

      // 5. Default General Category Template
      expect(find.text('Task Category'), findsOneWidget);
      expect(find.text('Personal'), findsOneWidget);
      expect(find.text('Deep Work'), findsOneWidget);
      expect(find.text('Communication'), findsOneWidget);
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

      // Initially General template
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
      expect(find.text('Username minimal 2 karakter.'), findsOneWidget);
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

      // Confirm
      await tester.ensureVisible(find.text('Confirm'));
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      // Verified: (B) Task Added card is rendered
      expect(find.byType(FocientTaskAddedCard), findsOneWidget);
      expect(find.text('Create the Annual OKR'), findsOneWidget);
      expect(find.text('25" Task'), findsOneWidget);
      expect(find.text('20" Rest'), findsOneWidget);
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

      // Today Workload Card
      expect(find.text('Today Workload'), findsOneWidget);
      expect(find.textContaining('Optimal'), findsOneWidget);
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
  });
}

void _dummyBack() {}
