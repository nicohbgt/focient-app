import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'core/inter_theme.dart';
import 'presentation/screens/onboarding/focient_screen_inspector.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );
  runApp(const ProviderScope(child: FocientMobileApp()));
}

class FocientMobileApp extends StatelessWidget {
  const FocientMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FoCient',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: FocientTheme.fontFamily,
        fontFamilyFallback: FocientTheme.fontFamilyFallbacks,
        scaffoldBackgroundColor: FocientColorTokens.neutralBgCanvas,
        colorScheme: ColorScheme.fromSeed(
          seedColor: FocientColorTokens.primaryActionBase,
          primary: FocientColorTokens.primaryActionBase,
          surface: FocientColorTokens.neutralSurfaceCard,
          error: FocientColorTokens.dangerActionBase,
        ),
      ),
      home: const FocientScreenInspector(),
    );
  }
}
