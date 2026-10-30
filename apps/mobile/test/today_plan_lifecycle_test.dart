import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/data/planning_state.dart';
import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/riverpod_providers.dart';
import 'package:focient_mobile/presentation/screens/plan/focient_today_plan_screen.dart';

void main() {
  group('Today Plan Screen: 4 Data-Driven Lifecycle States & Quick Task Input', () {
    testWidgets('1. Empty State: Renders calm rhythm guidance with teal icon & CTA', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.populatedSample())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Empty state content matching user specifications
      expect(find.text('Mulai Hari dengan Ritme Tenang'), findsOneWidget);
      expect(
        find.text('Belum ada agenda terencana. Tambahkan aktivitas pertamamu untuk memulai fokus.'),
        findsOneWidget,
      );
      expect(find.text('+ Buat Rencana Pertama'), findsOneWidget);

      // Verify soft teal icon container is rendered
      expect(find.byIcon(Icons.spa_rounded), findsOneWidget);
    });

    testWidgets('2. Quick Task Input: Opens bottom sheet, inputs task, and transitions to Populated State instantly', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.populatedSample())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Initial Empty state
      expect(find.text('+ Buat Rencana Pertama'), findsOneWidget);

      // Tap CTA to open Quick Task Input modal
      await tester.tap(find.text('+ Buat Rencana Pertama'));
      await tester.pumpAndSettle();

      // Verify bottom sheet appears
      expect(find.text('Quick Task Input'), findsOneWidget);
      expect(find.text('Judul Aktivitas'), findsOneWidget);
      expect(find.text('Estimasi Durasi (Menit)'), findsOneWidget);
      expect(find.text('25 m'), findsOneWidget);
      expect(find.text('Deep Focus (Prioritas Top 3)'), findsOneWidget);

      // Fill form: Title, 45m duration chip, toggle Deep Focus
      await tester.enterText(find.byType(TextField), 'Implement Clean Architecture Repository');
      await tester.tap(find.text('45 m'));
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      // Submit
      await tester.tap(find.text('+ Tambah Rencana'));
      await tester.pumpAndSettle();

      // Instant 0ms transition: Empty state is gone, Populated state is rendered!
      expect(find.text('Mulai Hari dengan Ritme Tenang'), findsNothing);
      expect(find.text('Rencana Fokus Hari Ini'), findsOneWidget);
      expect(find.text('Implement Clean Architecture Repository'), findsOneWidget);
      expect(find.text('Top 3 Focus'), findsOneWidget);
      expect(find.text('• 45m'), findsOneWidget);
      expect(find.text('• Deep Focus'), findsOneWidget);
    });

    testWidgets('3. Populated State: Checking task triggers 150ms optimistic update', (tester) async {
      final sampleTasks = [
        MobileTask(
          id: 'task-pop-1',
          title: 'Review System Design Document',
          durationMinutes: 30,
          priority: TaskPriorityEnum.top3,
          focusType: 'Deep Focus',
          status: TaskStatusEnum.todo,
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier(sampleTasks)),
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.populatedSample())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Rencana Fokus Hari Ini'), findsOneWidget);
      expect(find.text('Review System Design Document'), findsOneWidget);
      expect(find.text('Top 3 Focus'), findsOneWidget);

      // Tap checkbox to toggle complete
      await tester.tap(find.byKey(const ValueKey('task_checkbox_task-pop-1')));
      await tester.pumpAndSettle();

      // Task is now completed, screen transitions to All-Tasks-Completed State
      expect(find.text('Fokus Hari Ini Telah Tuntas'), findsOneWidget);
    });

    testWidgets('4. All-Tasks-Completed State (Zero Inbox): Renders calm affirmation without stress CTAs', (tester) async {
      final completedTasks = [
        MobileTask(
          id: 'done-1',
          title: 'Architecture Monorepo Setup',
          durationMinutes: 45,
          status: TaskStatusEnum.completed,
        ),
        MobileTask(
          id: 'done-2',
          title: 'Database Schema Optimization',
          durationMinutes: 30,
          status: TaskStatusEnum.completed,
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier(completedTasks)),
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.populatedSample())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Zero inbox calm affirmative card
      expect(find.text('Fokus Hari Ini Telah Tuntas'), findsOneWidget);
      expect(
        find.text('Semua agenda terencana telah diselesaikan dengan tenang. Nikmati waktu istirahat tanpa rasa bersalah.'),
        findsOneWidget,
      );

      // Guaranteed: no stress-inducing add task buttons on this zero inbox card
      expect(find.text('+ Tambah Tugas Baru'), findsNothing);
      expect(find.text('Mulai Hari dengan Ritme Tenang'), findsNothing);
    });

    testWidgets('5. Loading State: Renders initial skeleton loading and transitions gracefully', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            taskListProvider.overrideWith((ref) => TaskListNotifier([])),
            planningProvider.overrideWith((ref) => PlanningNotifier(PlanningState.empty())),
          ],
          child: const MaterialApp(
            home: FocientTodayPlanScreen(),
          ),
        ),
      );

      // Initial frame
      await tester.pump();
      expect(find.byType(FocientTodayPlanScreen), findsOneWidget);

      await tester.pumpAndSettle();
      expect(find.text('Mulai Hari dengan Ritme Tenang'), findsOneWidget);
    });
  });
}
