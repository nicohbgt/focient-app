import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:focient_mobile/main.dart';

void main() {
  testWidgets('FoCient Mobile App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FocientMobileApp()));
    expect(find.byType(FocientMobileApp), findsOneWidget);
  });
}
