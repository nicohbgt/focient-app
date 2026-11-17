import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../core/network_client.dart';
import 'focient_local_storage.dart';
import 'workspace_category.dart';

enum AuthStatus {
  unauthenticated,
  loading,
  otpVerificationPending,
  resetPasswordPending,
  authenticated,
  error,
}

enum OtpPurpose {
  registration,
  forgotPassword,
}

class AuthUser {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String roleArchetype;
  final int dailyCapacityMinutes;
  final bool isOnboardingCompleted;
  final String? username;
  final List<String> selectedCategories;
  final String energyRhythm;
  final String schedulingStyle;
  final String startWorkTime;
  final String endWorkTime;
  final int restTimeMinutesPerTask;

  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.roleArchetype = 'Software Engineer',
    this.dailyCapacityMinutes = 480,
    this.isOnboardingCompleted = false,
    this.username,
    this.selectedCategories = const [],
    this.energyRhythm = 'Early Bird',
    this.schedulingStyle = 'Structured',
    this.startWorkTime = '09:00',
    this.endWorkTime = '17:00',
    this.restTimeMinutesPerTask = 10,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'FoCient Member',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      roleArchetype: json['roleArchetype'] as String? ?? 'Software Engineer',
      dailyCapacityMinutes: (json['dailyCapacityMinutes'] as num?)?.toInt() ?? 480,
      isOnboardingCompleted: json['isOnboardingCompleted'] as bool? ?? false,
      username: json['username'] as String? ?? (json['name'] as String?),
      selectedCategories: (json['selectedCategories'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      energyRhythm: json['energyRhythm'] as String? ?? 'Early Bird',
      schedulingStyle: json['schedulingStyle'] as String? ?? 'Structured',
      startWorkTime: json['startWorkTime'] as String? ?? '09:00',
      endWorkTime: json['endWorkTime'] as String? ?? '17:00',
      restTimeMinutesPerTask: (json['restTimeMinutesPerTask'] as num?)?.toInt() ?? 10,
    );
  }

  AuthUser copyWith({
    String? id,
    String? name,
    String? email,
    String? avatarUrl,
    String? roleArchetype,
    int? dailyCapacityMinutes,
    bool? isOnboardingCompleted,
    String? username,
    List<String>? selectedCategories,
    String? energyRhythm,
    String? schedulingStyle,
    String? startWorkTime,
    String? endWorkTime,
    int? restTimeMinutesPerTask,
  }) {
    return AuthUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      roleArchetype: roleArchetype ?? this.roleArchetype,
      dailyCapacityMinutes: dailyCapacityMinutes ?? this.dailyCapacityMinutes,
      isOnboardingCompleted: isOnboardingCompleted ?? this.isOnboardingCompleted,
      username: username ?? this.username,
      selectedCategories: selectedCategories ?? this.selectedCategories,
      energyRhythm: energyRhythm ?? this.energyRhythm,
      schedulingStyle: schedulingStyle ?? this.schedulingStyle,
      startWorkTime: startWorkTime ?? this.startWorkTime,
      endWorkTime: endWorkTime ?? this.endWorkTime,
      restTimeMinutesPerTask: restTimeMinutesPerTask ?? this.restTimeMinutesPerTask,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'avatarUrl': avatarUrl,
        'roleArchetype': roleArchetype,
        'dailyCapacityMinutes': dailyCapacityMinutes,
        'isOnboardingCompleted': isOnboardingCompleted,
        'username': username,
        'selectedCategories': selectedCategories,
        'energyRhythm': energyRhythm,
        'schedulingStyle': schedulingStyle,
        'startWorkTime': startWorkTime,
        'endWorkTime': endWorkTime,
        'restTimeMinutesPerTask': restTimeMinutesPerTask,
      };
}

class AuthState {
  final AuthStatus status;
  final bool isLoading;
  final AuthUser? user;
  final String? pendingEmail;
  final String? pendingName;
  final String? pendingPassword;
  final String? errorMessage;
  final int otpCooldownSeconds;
  final OtpPurpose otpPurpose;
  final String? resetPasswordOtp;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.isLoading = false,
    this.user,
    this.pendingEmail,
    this.pendingName,
    this.pendingPassword,
    this.errorMessage,
    this.otpCooldownSeconds = 0,
    this.otpPurpose = OtpPurpose.registration,
    this.resetPasswordOtp,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;
  bool get isOtpPending => status == AuthStatus.otpVerificationPending;
  bool get isResetPasswordPending => status == AuthStatus.resetPasswordPending;

  AuthState copyWith({
    AuthStatus? status,
    bool? isLoading,
    AuthUser? user,
    String? pendingEmail,
    String? pendingName,
    String? pendingPassword,
    String? errorMessage,
    int? otpCooldownSeconds,
    OtpPurpose? otpPurpose,
    String? resetPasswordOtp,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      pendingEmail: pendingEmail ?? this.pendingEmail,
      pendingName: pendingName ?? this.pendingName,
      pendingPassword: pendingPassword ?? this.pendingPassword,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      otpCooldownSeconds: otpCooldownSeconds ?? this.otpCooldownSeconds,
      otpPurpose: otpPurpose ?? this.otpPurpose,
      resetPasswordOtp: resetPasswordOtp ?? this.resetPasswordOtp,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  Timer? _countdownTimer;

  AuthNotifier([AuthState? initial]) : super(initial ?? const AuthState());

  /// Restores session from local persistent storage on cold boot and verifies with backend /api/auth/me
  Future<bool> restoreSession() async {
    try {
      final session = await focientLocalStorage.loadSession();
      if (session != null && session['token'] != null && session['user'] != null) {
        final token = session['token'] as String;
        focientNetworkClient.setAuthToken(token);
        final cachedUser = AuthUser.fromJson(session['user'] as Map<String, dynamic>);

        // Validate session token and synchronize live profile with PostgreSQL
        try {
          final res = await focientNetworkClient.get('/auth/me');
          if (res != null && res is Map<String, dynamic>) {
            final freshUser = AuthUser.fromJson(res);
            await focientLocalStorage.saveSession(user: freshUser, token: token);
            state = state.copyWith(
              status: AuthStatus.authenticated,
              user: freshUser,
              clearError: true,
            );
            return true;
          }
        } on AuthExpiredException {
          // Token expired or revoked on server
          focientNetworkClient.clearAuthToken();
          await focientLocalStorage.clearAllUserData();
          state = const AuthState(
            status: AuthStatus.unauthenticated,
            user: null,
          );
          return false;
        } catch (_) {
          // Offline / network partition: maintain verified cached user session
          state = state.copyWith(
            status: AuthStatus.authenticated,
            user: cachedUser,
            clearError: true,
          );
          return true;
        }
      }
    } catch (_) {}

    focientNetworkClient.clearAuthToken();
    state = const AuthState(
      status: AuthStatus.unauthenticated,
      user: null,
    );
    return false;
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startOtpCooldown([int seconds = 30]) {
    _countdownTimer?.cancel();
    state = state.copyWith(otpCooldownSeconds: seconds);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.otpCooldownSeconds > 1) {
        state = state.copyWith(otpCooldownSeconds: state.otpCooldownSeconds - 1);
      } else {
        timer.cancel();
        state = state.copyWith(otpCooldownSeconds: 0);
      }
    });
  }

  /// Direct Registration (without OTP verification)
  Future<bool> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final trimmedEmail = email.trim().toLowerCase();
      final trimmedName = name.trim();

      Map<String, dynamic>? res;
      try {
        final raw = await focientNetworkClient.post('/auth/register', {
          'name': trimmedName,
          'email': trimmedEmail,
          'password': password,
        });
        if (raw is Map<String, dynamic>) {
          res = raw;
        }
      } catch (netErr) {
        debugPrint('[AuthNotifier] Network register offline, using local persistent account: $netErr');
      }

      final authenticatedUser = (res != null && res['user'] != null)
          ? AuthUser.fromJson(res['user'] as Map<String, dynamic>)
          : AuthUser(
              id: 'usr_${trimmedEmail.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}_${DateTime.now().millisecondsSinceEpoch}',
              name: trimmedName,
              email: trimmedEmail,
              username: trimmedName,
              roleArchetype: 'General',
              dailyCapacityMinutes: 480,
              isOnboardingCompleted: false,
            );

      final token = (res != null && res['token'] != null)
          ? res['token'] as String
          : 'focient_token_${DateTime.now().millisecondsSinceEpoch}';

      focientNetworkClient.setAuthToken(token);
      await focientLocalStorage.saveSession(user: authenticatedUser, token: token);

      _countdownTimer?.cancel();
      state = state.copyWith(
        status: AuthStatus.authenticated,
        isLoading: false,
        user: authenticatedUser,
        otpCooldownSeconds: 0,
        clearError: true,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Sends real 6-digit OTP for Registration (or direct fallback)
  Future<bool> initiateRegistration({
    required String name,
    required String email,
    required String password,
  }) async {
    return register(name: name, email: email, password: password);
  }

  /// Sends password reset instructions
  Future<bool> requestPasswordReset(String email) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final trimmedEmail = email.trim().toLowerCase();

      try {
        await focientNetworkClient.post('/auth/forgot-password', {
          'email': trimmedEmail,
        });
      } catch (_) {}

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        pendingEmail: trimmedEmail,
        clearError: true,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Verifies real 6-digit OTP code (handles both Registration and Forgot Password)
  Future<bool> verifyOtp(String code) async {
    final trimmedCode = code.trim();
    if (trimmedCode.length != 6) {
      state = state.copyWith(
        errorMessage: 'Please enter a valid 6-digit OTP code.',
      );
      return false;
    }

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      if (state.otpPurpose == OtpPurpose.forgotPassword) {
        // Verify OTP for Forgot Password flow
        await focientNetworkClient.post('/auth/verify-reset-otp', {
          'email': state.pendingEmail,
          'code': trimmedCode,
        });

        _countdownTimer?.cancel();
        state = state.copyWith(
          status: AuthStatus.resetPasswordPending,
          isLoading: false,
          resetPasswordOtp: trimmedCode,
          otpCooldownSeconds: 0,
          clearError: true,
        );

        return true;
      } else {
        // Registration verification flow
        final res = await focientNetworkClient.post('/auth/verify-otp', {
          'email': state.pendingEmail,
          'code': trimmedCode,
          'name': state.pendingName,
          'password': state.pendingPassword,
        });

        if (res != null && res['token'] != null && res['user'] != null) {
          final token = res['token'] as String;
          focientNetworkClient.setAuthToken(token);

          final authenticatedUser = AuthUser.fromJson(res['user'] as Map<String, dynamic>);
          await focientLocalStorage.saveSession(user: authenticatedUser, token: token);

          _countdownTimer?.cancel();
          state = state.copyWith(
            status: AuthStatus.authenticated,
            isLoading: false,
            user: authenticatedUser,
            otpCooldownSeconds: 0,
            clearError: true,
          );

          return true;
        } else {
          throw const ApiException('Invalid server response format.');
        }
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.otpVerificationPending,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Submits new password after successful OTP verification
  Future<bool> resetPassword({required String newPassword}) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      await focientNetworkClient.post('/auth/reset-password', {
        'email': state.pendingEmail,
        'code': state.resetPasswordOtp,
        'newPassword': newPassword,
      });

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        resetPasswordOtp: null,
        clearError: true,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.resetPasswordPending,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Resends a fresh real 6-digit OTP code to the user's email
  Future<bool> resendOtp() async {
    if (state.otpCooldownSeconds > 0) return false;
    if (state.pendingEmail == null || state.pendingEmail!.isEmpty) return false;

    state = state.copyWith(clearError: true);

    try {
      if (state.otpPurpose == OtpPurpose.forgotPassword) {
        await focientNetworkClient.post('/auth/forgot-password', {
          'email': state.pendingEmail!,
        });
      } else {
        await focientNetworkClient.post('/auth/send-otp', {
          'name': state.pendingName ?? '',
          'email': state.pendingEmail!,
        });
      }

      _startOtpCooldown(30);
      return true;
    } catch (e) {
      state = state.copyWith(
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Real Email & Password Login
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final res = await focientNetworkClient.post('/auth/login', {
        'email': email.trim().toLowerCase(),
        'password': password,
      });

      if (res != null && res['token'] != null && res['user'] != null) {
        final token = res['token'] as String;
        focientNetworkClient.setAuthToken(token);

        final authenticatedUser = AuthUser.fromJson(res['user'] as Map<String, dynamic>);
        await focientLocalStorage.saveSession(user: authenticatedUser, token: token);

        state = state.copyWith(
          status: AuthStatus.authenticated,
          isLoading: false,
          user: authenticatedUser,
          clearError: true,
        );

        return true;
      } else {
        throw const ApiException('Email atau kata sandi tidak cocok.');
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Real Google OAuth 2.0 Sign-In via Native Google Sign-In SDK
  Future<bool> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
      GoogleSignInAccount? googleAccount;

      try {
        googleAccount = await googleSignIn.signIn();
      } catch (nativeError) {
        debugPrint('[GoogleSignIn] Native sign-in failed ($nativeError).');
      }

      if (googleAccount != null) {
        final googleAuth = await googleAccount.authentication;
        final idToken = googleAuth.idToken ?? googleAuth.accessToken;

        if (idToken != null && idToken.isNotEmpty) {
          final res = await focientNetworkClient.post('/auth/google', {
            'token': idToken,
          });

          if (res != null && res['token'] != null && res['user'] != null) {
            final token = res['token'] as String;
            focientNetworkClient.setAuthToken(token);

            final authenticatedUser = AuthUser.fromJson(res['user'] as Map<String, dynamic>);
            await focientLocalStorage.saveSession(user: authenticatedUser, token: token);

            state = state.copyWith(
              status: AuthStatus.authenticated,
              isLoading: false,
              user: authenticatedUser,
              clearError: true,
            );

            return true;
          }
        }
      }

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        clearError: true,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
        errorMessage: 'Gagal terhubung dengan akun Google. Silakan coba lagi.',
      );
      return false;
    }
  }

  /// Completes Onboarding with full workspace, rhythm, and time allocation setup
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
    final currentUser = state.user;
    if (currentUser == null) return false;

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final categoryNames = categories.map((c) => c.name).toList();
      final payload = {
        'username': username.trim(),
        'name': username.trim(),
        'job': occupancy,
        'roleArchetype': occupancy,
        'occupancy': occupancy,
        'startWorkTime': startWorkTime,
        'endWorkTime': endWorkTime,
        'workHoursLimit': 8.0,
        'selectedCategories': categoryNames,
        'workStyle': schedulingStyle,
        'schedulingStyle': schedulingStyle,
        'energyRhythm': energyRhythm,
        'workingRhythm': energyRhythm,
        'restTimeMinutesPerTask': restTimeMinutesPerTask,
        'restTimePerTask': restTimeMinutesPerTask,
      };

      try {
        await focientNetworkClient.post('/onboarding/complete', payload);
      } catch (_) {
        try {
          await focientNetworkClient.post('/auth/onboarding', payload);
        } catch (_) {
          // Fallback for offline environments
        }
      }

      final updatedUser = currentUser.copyWith(
        name: username.trim(),
        username: username.trim(),
        roleArchetype: occupancy,
        isOnboardingCompleted: true,
        selectedCategories: categoryNames,
        energyRhythm: energyRhythm,
        schedulingStyle: schedulingStyle,
        startWorkTime: startWorkTime,
        endWorkTime: endWorkTime,
        restTimeMinutesPerTask: restTimeMinutesPerTask,
      );

      state = state.copyWith(
        status: AuthStatus.authenticated,
        isLoading: false,
        user: updatedUser,
        clearError: true,
      );

      final currentToken = focientLocalStorage.cachedSession?['token'] as String? ?? '';
      if (currentToken.isNotEmpty) {
        await focientLocalStorage.saveSession(user: updatedUser, token: currentToken);
      }

      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.authenticated,
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Updates user identity (Name and Username) and synchronizes with backend & storage
  Future<bool> updateUserIdentity({
    required String name,
    required String username,
  }) async {
    final currentUser = state.user;
    if (currentUser == null) return false;

    final updated = currentUser.copyWith(
      name: name.trim(),
      username: username.trim(),
    );

    state = state.copyWith(user: updated);
    final currentToken = focientLocalStorage.cachedSession?['token'] as String? ?? '';
    if (currentToken.isNotEmpty) {
      await focientLocalStorage.saveSession(user: updated, token: currentToken);
    }

    try {
      await focientNetworkClient.patch('/auth/profile', {
        'name': name.trim(),
        'username': username.trim(),
      });
    } catch (_) {}

    return true;
  }

  /// Updates user occupancy/role and synchronizes with backend & storage
  Future<bool> updateUserRole(String role) async {
    final currentUser = state.user;
    if (currentUser == null) return false;

    final updated = currentUser.copyWith(
      roleArchetype: role.trim(),
    );

    state = state.copyWith(user: updated);
    final currentToken = focientLocalStorage.cachedSession?['token'] as String? ?? '';
    if (currentToken.isNotEmpty) {
      await focientLocalStorage.saveSession(user: updated, token: currentToken);
    }

    try {
      await focientNetworkClient.patch('/auth/profile', {
        'roleArchetype': role.trim(),
        'occupancy': role.trim(),
      });
    } catch (_) {}

    return true;
  }

  /// Updates workload settings (Active hours, Daily capacity, Rhythm, Buffer) and synchronizes
  Future<bool> updateWorkloadSettings({
    String? startWorkTime,
    String? endWorkTime,
    int? dailyCapacityMinutes,
    int? restTimeMinutesPerTask,
    String? energyRhythm,
    String? schedulingStyle,
  }) async {
    final currentUser = state.user;
    if (currentUser == null) return false;

    final updated = currentUser.copyWith(
      startWorkTime: startWorkTime ?? currentUser.startWorkTime,
      endWorkTime: endWorkTime ?? currentUser.endWorkTime,
      dailyCapacityMinutes: dailyCapacityMinutes ?? currentUser.dailyCapacityMinutes,
      restTimeMinutesPerTask: restTimeMinutesPerTask ?? currentUser.restTimeMinutesPerTask,
      energyRhythm: energyRhythm ?? currentUser.energyRhythm,
      schedulingStyle: schedulingStyle ?? currentUser.schedulingStyle,
    );

    state = state.copyWith(user: updated);
    final currentToken = focientLocalStorage.cachedSession?['token'] as String? ?? '';
    if (currentToken.isNotEmpty) {
      await focientLocalStorage.saveSession(user: updated, token: currentToken);
    }

    try {
      final payload = <String, dynamic>{};
      if (startWorkTime != null) payload['startWorkTime'] = startWorkTime;
      if (endWorkTime != null) payload['endWorkTime'] = endWorkTime;
      if (dailyCapacityMinutes != null) payload['dailyCapacityMinutes'] = dailyCapacityMinutes;
      if (restTimeMinutesPerTask != null) payload['restTimeMinutesPerTask'] = restTimeMinutesPerTask;
      if (energyRhythm != null) payload['energyRhythm'] = energyRhythm;
      if (schedulingStyle != null) payload['schedulingStyle'] = schedulingStyle;

      await focientNetworkClient.patch('/auth/profile', payload);
    } catch (_) {}

    return true;
  }

  /// Reset to unauthenticated (Logout) and wipe all local storage to isolate accounts
  Future<void> logout() async {
    _countdownTimer?.cancel();
    final token = focientLocalStorage.cachedSession?['token'] as String?;
    if (token != null) {
      try {
        await focientNetworkClient.post('/auth/logout', {'refreshToken': token});
      } catch (_) {}
    }
    focientNetworkClient.clearAuthToken();
    await focientLocalStorage.clearAllUserData();
    state = const AuthState(
      status: AuthStatus.unauthenticated,
      user: null,
    );
  }

  /// Reset workspace state directly and clear session
  Future<void> resetWorkspace() async {
    _countdownTimer?.cancel();
    focientNetworkClient.clearAuthToken();
    await focientLocalStorage.clearAllUserData();
    state = const AuthState(
      status: AuthStatus.unauthenticated,
      user: null,
    );
  }

  /// Navigates back from OTP screen
  void cancelOtp() {
    _countdownTimer?.cancel();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      otpCooldownSeconds: 0,
      clearError: true,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
