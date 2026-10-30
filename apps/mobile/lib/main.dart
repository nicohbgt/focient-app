import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'core/inter_theme.dart';
import 'data/auth_state.dart';
import 'data/focient_local_storage.dart';
import 'data/focient_repository.dart';
import 'presentation/screens/auth/focient_auth_flow.dart';
import 'presentation/screens/dashboard/focient_dashboard_screen.dart';
import 'presentation/screens/onboarding/focient_onboarding_flow.dart';
import 'presentation/screens/onboarding/focient_screen_inspector.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  await focientLocalStorage.init();
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
      home: const FocientAppRoot(),
    );
  }
}

/// Production Root Entry Point
/// Dynamically routes to AuthFlow, Onboarding, or Dashboard based on session state,
/// with instant offline-first persistence and an unobtrusive developer inspector option.
class FocientAppRoot extends ConsumerStatefulWidget {
  const FocientAppRoot({super.key});

  @override
  ConsumerState<FocientAppRoot> createState() => _FocientAppRootState();
}

class _FocientAppRootState extends ConsumerState<FocientAppRoot> {
  bool _showInspector = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(authProvider.notifier).restoreSession();
      ref.read(focientRepositoryProvider).syncPendingMutations();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showInspector) {
      return Stack(
        children: [
          const FocientScreenInspector(),
          Positioned(
            bottom: 24,
            right: 16,
            child: FloatingActionButton.small(
              backgroundColor: const Color(0xFF0F172A),
              foregroundColor: Colors.white,
              tooltip: 'Return to Live Flow',
              onPressed: () => setState(() => _showInspector = false),
              child: const Icon(Icons.arrow_back, size: 18),
            ),
          ),
        ],
      );
    }

    final authState = ref.watch(authProvider);

    Widget activeFlow;
    if (authState.isAuthenticated) {
      if (!(authState.user?.isOnboardingCompleted ?? false)) {
        activeFlow = FocientOnboardingFlow(
          onCancel: () {
            ref.read(authProvider.notifier).logout();
          },
        );
      } else {
        activeFlow = const FocientDashboardScreen();
      }
    } else {
      activeFlow = const FocientAuthFlow(initialView: AuthScreenView.welcome);
    }

    return Stack(
      children: [
        activeFlow,
        if (kDebugMode)
          Positioned(
            top: 40,
            right: 12,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => setState(() => _showInspector = true),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.65),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.developer_mode, size: 12, color: Colors.amber),
                      SizedBox(width: 4),
                      Text(
                        'Inspector',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
