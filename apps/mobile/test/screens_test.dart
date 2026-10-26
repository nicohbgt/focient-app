import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_mobile/presentation/screens/today_screen.dart';

void main() {
  testWidgets('TodayScreen renders Top 3 priorities and capacity meter', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: TodayScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Rencana Hari Ini'), findsOneWidget);
    expect(find.text('Top 3 Prioritas Utama'), findsOneWidget);
    expect(find.text('Workload Capacity'), findsOneWidget);
  });
}
