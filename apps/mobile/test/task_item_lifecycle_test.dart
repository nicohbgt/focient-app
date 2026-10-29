import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/data/models/task_item.dart';
import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/riverpod_providers.dart';
import 'package:focient_mobile/presentation/screens/task/focient_task_list_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_welcome_screen.dart';
import 'package:focient_mobile/presentation/screens/auth/focient_register_screen.dart';
import 'package:focient_mobile/presentation/screens/onboarding/focient_screen_inspector.dart';
import 'package:focient_mobile/presentation/focient_copywriting.dart';

void main() {
  group('TaskItem Model Specifications', () {
    test('instantiates with default values', () {
      final task = TaskItem(
        id: 'task-1',
        title: 'Review System Architecture',
        durationMinutes: 45,
      );

      expect(task.id, 'task-1');
      expect(task.title, 'Review System Architecture');
      expect(task.durationMinutes, 45);
      expect(task.isDeepFocus, false);
      expect(task.isCompleted, false);
    });

    test('supports copyWith for immutability', () {
      final task = TaskItem(
        id: 'task-1',
        title: 'Initial Title',
        durationMinutes: 20,
      );

      final completedTask = task.copyWith(isCompleted: true, isDeepFocus: true);
      expect(completedTask.id, 'task-1');
      expect(completedTask.title, 'Initial Title');
      expect(completedTask.isCompleted, true);
      expect(completedTask.isDeepFocus, true);
    });

    test('serializes to and from JSON', () {
      final json = {
        'id': 'task-json-1',
        'title': 'Deploy Backend Containers',
        'durationMinutes': 30,
        'isDeepFocus': true,
        'isCompleted': false,
      };

      final task = TaskItem.fromJson(json);
      expect(task.id, 'task-json-1');
      expect(task.title, 'Deploy Backend Containers');
      expect(task.durationMinutes, 30);
      expect(task.isDeepFocus, true);
      expect(task.isCompleted, false);

      final serialized = task.toJson();
      expect(serialized['id'], 'task-json-1');
      expect(serialized['isDeepFocus'], true);
    });

    test('maps to and from MobileTask seamlessly', () {
      final mobileTask = MobileTask(
        id: 'mt-1',
        title: 'Deep Focus Coding',
        durationMinutes: 50,
        focusType: 'Deep Focus',
        status: TaskStatusEnum.completed,
      );

      final item = TaskItem.fromMobileTask(mobileTask);
      expect(item.id, 'mt-1');
      expect(item.title, 'Deep Focus Coding');
      expect(item.durationMinutes, 50);
      expect(item.isDeepFocus, true);
      expect(item.isCompleted, true);

      final backToMobile = item.toMobileTask();
      expect(backToMobile.id, 'mt-1');
      expect(backToMobile.status, TaskStatusEnum.completed);
    });
  });

  group('4 Lifecycle States on Main Screen', () {
    testWidgets('1. Empty State: Renders calm onboarding empty state when no tasks exist', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
          ],
          child: const MaterialApp(
            home: FocientTaskListScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Belum ada tugas yang dijadwalkan untuk hari ini.'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Add Task'), findsOneWidget);
    });

    testWidgets('2. Zero Inbox State: Renders calm affirmation when all tasks are completed', (tester) async {
      final completedTasks = [
        MobileTask(
          id: 'done-1',
          title: 'Morning Standup & Reflection',
          durationMinutes: 15,
          status: TaskStatusEnum.completed,
          dateDisplay: 'October, 3rd 2026',
        ),
        MobileTask(
          id: 'done-2',
          title: 'Architecture Review',
          durationMinutes: 45,
          status: TaskStatusEnum.completed,
          dateDisplay: 'October, 3rd 2026',
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier(completedTasks)),
          ],
          child: const MaterialApp(
            home: FocientTaskListScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Semua Tugas Selesai! (Zero Inbox)'), findsOneWidget);
      expect(find.text('+ Tambah Tugas Ekstra'), findsOneWidget);
    });

    testWidgets('3. Populated State: Renders schedule timeline when tasks are active', (tester) async {
      final activeTasks = [
        MobileTask(
          id: 'active-1',
          title: 'Implement Payment Gateway',
          durationMinutes: 60,
          status: TaskStatusEnum.todo,
          dateDisplay: 'October, 3rd 2026',
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier(activeTasks)),
          ],
          child: const MaterialApp(
            home: FocientTaskListScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Implement Payment Gateway'), findsOneWidget);
      expect(find.text('Semua Tugas Selesai! (Zero Inbox)'), findsNothing);
      expect(find.text('Belum ada tugas yang dijadwalkan untuk hari ini.'), findsNothing);
    });
  });

  group('User Feedback Enhancements & Responsive Layout', () {
    testWidgets('Welcome Screen header language switch & no logo emblem', (tester) async {
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
      await tester.pumpAndSettle();

      // Wordmark and header language switch are present
      expect(find.text('FoCient'), findsOneWidget);
      expect(find.text('English'), findsOneWidget);
      expect(find.text('Indonesia'), findsOneWidget);

      // Buttons are present
      expect(find.text('Get Started'), findsOneWidget);
      expect(find.text('Already have an account? Login'), findsOneWidget);

      // Logo emblem icon is removed
      expect(find.byIcon(Icons.center_focus_strong_rounded), findsNothing);
    });

    testWidgets('Register Screen helper and error text matches selected English language', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            languageProvider.overrideWith((ref) => LanguageNotifier(FoCientLanguage.en)),
          ],
          child: MaterialApp(
            home: FocientRegisterScreen(
              onNavigateToLogin: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Password helper text in English
      expect(
        find.text('Make sure include 1 Uppercase, 1 Lowercase and 1 Number'),
        findsOneWidget,
      );

      // Trigger submit with empty fields
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Error messages in English, NOT Indonesian
      expect(find.text('Name should be at least 2 characters.'), findsOneWidget);
      expect(find.text('Nama minimal 2 karakter.'), findsNothing);
    });

    testWidgets('Register Screen helper and error text matches selected Indonesian language', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            languageProvider.overrideWith((ref) => LanguageNotifier(FoCientLanguage.id)),
          ],
          child: MaterialApp(
            home: FocientRegisterScreen(
              onNavigateToLogin: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Password helper text in Indonesian
      expect(
        find.text('Pastikan menyertakan 1 huruf besar, 1 huruf kecil, dan 1 angka'),
        findsOneWidget,
      );

      // Trigger submit with empty fields
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Error messages in Indonesian
      expect(find.text('Nama minimal 2 karakter.'), findsOneWidget);
      expect(find.text('Name should be at least 2 characters.'), findsNothing);
    });

    testWidgets('Screen Inspector renders prototype dropdown and switches screens', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: FocientScreenInspector(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Prototype navigation pill is visible
      expect(find.text('Prototype Nav'), findsOneWidget);

      // Tap menu button
      await tester.tap(find.text('Prototype Nav'));
      await tester.pumpAndSettle();

      // Menu popover with categories is visible
      expect(find.text('AUTHENTICATION SCREENS'), findsOneWidget);
      expect(find.text('Welcome Screen'), findsOneWidget);
      expect(find.text('Register Screen'), findsOneWidget);
      expect(find.text('Verification (OTP) Screen'), findsOneWidget);
    });
  });
}
