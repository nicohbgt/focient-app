import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../core/network_client.dart';

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

  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.roleArchetype = 'Software Engineer',
    this.dailyCapacityMinutes = 480,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'FoCient Member',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      roleArchetype: json['roleArchetype'] as String? ?? 'Software Engineer',
      dailyCapacityMinutes: (json['dailyCapacityMinutes'] as num?)?.toInt() ?? 480,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'avatarUrl': avatarUrl,
        'roleArchetype': roleArchetype,
        'dailyCapacityMinutes': dailyCapacityMinutes,
      };
}

class AuthState {
  final AuthStatus status;
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
  bool get isLoading => status == AuthStatus.loading;
  bool get isOtpPending => status == AuthStatus.otpVerificationPending;
  bool get isResetPasswordPending => status == AuthStatus.resetPasswordPending;

  AuthState copyWith({
    AuthStatus? status,
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

  AuthNotifier() : super(const AuthState());

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

  /// Sends real 6-digit OTP for Registration
  Future<bool> initiateRegistration({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);

    try {
      final trimmedEmail = email.trim().toLowerCase();
      final trimmedName = name.trim();

      await focientNetworkClient.post('/auth/send-otp', {
        'name': trimmedName,
        'email': trimmedEmail,
      });

      state = state.copyWith(
        status: AuthStatus.otpVerificationPending,
        otpPurpose: OtpPurpose.registration,
        pendingName: trimmedName,
        pendingEmail: trimmedEmail,
        pendingPassword: password,
      );

      _startOtpCooldown(30);
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Sends real 6-digit OTP for Forgot Password flow
  Future<bool> requestPasswordReset(String email) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);

    try {
      final trimmedEmail = email.trim().toLowerCase();

      await focientNetworkClient.post('/auth/forgot-password', {
        'email': trimmedEmail,
      });

      state = state.copyWith(
        status: AuthStatus.otpVerificationPending,
        otpPurpose: OtpPurpose.forgotPassword,
        pendingEmail: trimmedEmail,
      );

      _startOtpCooldown(30);
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
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
        errorMessage: 'Masukkan 6 digit kode OTP yang valid.',
      );
      return false;
    }

    state = state.copyWith(status: AuthStatus.loading, clearError: true);

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

          _countdownTimer?.cancel();
          state = state.copyWith(
            status: AuthStatus.authenticated,
            user: authenticatedUser,
            otpCooldownSeconds: 0,
            clearError: true,
          );

          return true;
        } else {
          throw ApiException('Format respons server tidak valid.');
        }
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.otpVerificationPending,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Submits new password after successful OTP verification
  Future<bool> resetPassword({required String newPassword}) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);

    try {
      await focientNetworkClient.post('/auth/reset-password', {
        'email': state.pendingEmail,
        'code': state.resetPasswordOtp,
        'newPassword': newPassword,
      });

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        resetPasswordOtp: null,
        clearError: true,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.resetPasswordPending,
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
    state = state.copyWith(status: AuthStatus.loading, clearError: true);

    try {
      final res = await focientNetworkClient.post('/auth/login', {
        'email': email.trim().toLowerCase(),
        'password': password,
      });

      if (res != null && res['token'] != null && res['user'] != null) {
        final token = res['token'] as String;
        focientNetworkClient.setAuthToken(token);

        final authenticatedUser = AuthUser.fromJson(res['user'] as Map<String, dynamic>);

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: authenticatedUser,
          clearError: true,
        );

        return true;
      } else {
        throw ApiException('Kredensial atau format respons tidak valid.');
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Real Google OAuth 2.0 Sign-In via Native Google Sign-In SDK
  Future<bool> loginWithGoogle() async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);

    try {
      final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
      final googleAccount = await googleSignIn.signIn();

      if (googleAccount == null) {
        // User dismissed Google OAuth picker
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return false;
      }

      final googleAuth = await googleAccount.authentication;
      final idToken = googleAuth.idToken ?? googleAuth.accessToken;

      if (idToken == null || idToken.isEmpty) {
        throw ApiException('Gagal memperoleh token otentikasi Google.');
      }

      final res = await focientNetworkClient.post('/auth/google', {
        'token': idToken,
      });

      if (res != null && res['token'] != null && res['user'] != null) {
        final token = res['token'] as String;
        focientNetworkClient.setAuthToken(token);

        final authenticatedUser = AuthUser.fromJson(res['user'] as Map<String, dynamic>);

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: authenticatedUser,
          clearError: true,
        );

        return true;
      } else {
        throw ApiException('Verifikasi Google OAuth di server gagal.');
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Reset to unauthenticated (Logout)
  void logout() {
    _countdownTimer?.cancel();
    focientNetworkClient.clearAuthToken();
    state = const AuthState(status: AuthStatus.unauthenticated);
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
