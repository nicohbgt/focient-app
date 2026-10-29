import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'core/inter_theme.dart';
import 'presentation/screens/onboarding/focient_screen_inspector.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  runApp(const ProviderScope(child: FocientMobileApp()));
}

class FocientMobileApp extends StatelessWidget {
  const FocientMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FoCient',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: FocientTheme.fontFamily,
        fontFamilyFallback: FocientTheme.fontFamilyFallbacks,
        scaffoldBackgroundColor: FocientColorTokens.neutralBgCanvas,
        colorScheme: ColorScheme.fromSeed(
          seedColor: FocientColorTokens.primaryActionBase,
          brightness: Brightness.light,
          primary: FocientColorTokens.primaryActionBase,
          surface: FocientColorTokens.neutralSurfaceCard,
          error: FocientColorTokens.dangerActionBase,
        ),
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            statusBarBrightness: Brightness.light,
            systemNavigationBarColor: Colors.transparent,
            systemNavigationBarIconBrightness: Brightness.dark,
          ),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: FocientTheme.fontFamily,
        fontFamilyFallback: FocientTheme.fontFamilyFallbacks,
        scaffoldBackgroundColor: FocientColorDarkTokens.neutralBgCanvas,
        colorScheme: ColorScheme.fromSeed(
          seedColor: FocientColorDarkTokens.primaryActionBase,
          brightness: Brightness.dark,
          primary: FocientColorDarkTokens.primaryActionBase,
          surface: FocientColorDarkTokens.neutralSurfaceCard,
          error: FocientColorDarkTokens.dangerActionBase,
        ),
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.light,
            statusBarBrightness: Brightness.dark,
            systemNavigationBarColor: Colors.transparent,
            systemNavigationBarIconBrightness: Brightness.light,
          ),
        ),
      ),
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
            statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
            systemNavigationBarColor: Colors.transparent,
            systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
            systemNavigationBarDividerColor: Colors.transparent,
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: const FocientScreenInspector(),
    );
  }
}
