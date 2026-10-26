import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/inter_theme.dart';
import 'presentation/screens/today_screen.dart';
import 'presentation/screens/onboarding_screen.dart';
import 'presentation/screens/tasks_screen.dart';
import 'presentation/screens/insights_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: FocientMobileApp(),
    ),
  );
}

class FocientMobileApp extends StatelessWidget {
  const FocientMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FoCient',
      debugShowCheckedModeBanner: false,
      theme: FocientTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const TodayScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/tasks': (context) => const TasksScreen(),
        '/insights': (context) => const InsightsScreen(),
      },
    );
  }
}
