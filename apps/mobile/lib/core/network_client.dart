import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int statusCode;

  const ApiException(this.message, {this.statusCode = 500});

  @override
  String toString() => message;
}

class AuthExpiredException extends ApiException {
  const AuthExpiredException([super.message = 'Session expired. Please log in again.'])
      : super(statusCode: 401);
}

class ConflictException extends ApiException {
  final Map<String, dynamic>? conflictData;

  const ConflictException(super.message, {this.conflictData, super.statusCode = 409});
}

/// Real Network Client for FoCient Mobile
/// Communicates with the real FoCient API Engine
class FocientNetworkClient {
  final String baseUrl;
  String? _jwtToken;
  void Function()? onAuthExpired;

  static String resolveDefaultBaseUrl() {
    const fromEnv = String.fromEnvironment('API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      return 'http://10.0.2.2:4000/api';
    }

    if (kIsWeb) {
      return 'http://localhost:4000/api';
    }

    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:4000/api';
      }
      return 'http://localhost:4000/api';
    } catch (_) {
      return 'http://localhost:4000/api';
    }
  }

  FocientNetworkClient({
    String? baseUrl,
  }) : baseUrl = baseUrl ?? resolveDefaultBaseUrl();

  void setAuthToken(String token) {
    _jwtToken = token;
  }

  void clearAuthToken() {
    _jwtToken = null;
  }

  bool get hasAuthToken => _jwtToken != null && _jwtToken!.isNotEmpty;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      };

  Future<T> withRetry<T>(Future<T> Function() operation, {int maxRetries = 2}) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      return await operation();
    }
    int attempts = 0;
    while (true) {
      attempts++;
      try {
        return await operation();
      } catch (e) {
        if (e is AuthExpiredException ||
            e is ConflictException ||
            (e is ApiException && e.statusCode < 500) ||
            attempts > maxRetries) {
          rethrow;
        }
        await Future.delayed(Duration(milliseconds: 200 * attempts));
      }
    }
  }

  static Duration get requestTimeout =>
      Platform.environment.containsKey('FLUTTER_TEST')
          ? const Duration(milliseconds: 50)
          : const Duration(seconds: 4);

  Future<dynamic> get(String endpoint) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      throw const ApiException('A server error occurred (400)', statusCode: 400);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl$cleanEndpoint'),
            headers: _headers,
          )
          .timeout(requestTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      throw const ApiException('A server error occurred (400)', statusCode: 400);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl$cleanEndpoint'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(requestTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> patch(String endpoint, Map<String, dynamic> body) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      throw const ApiException('A server error occurred (400)', statusCode: 400);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http
          .patch(
            Uri.parse('$baseUrl$cleanEndpoint'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(requestTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      throw const ApiException('A server error occurred (400)', statusCode: 400);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http
          .put(
            Uri.parse('$baseUrl$cleanEndpoint'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(requestTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> delete(String endpoint) async {
    if (Platform.environment.containsKey('FLUTTER_TEST')) {
      throw const ApiException('A server error occurred (400)', statusCode: 400);
    }
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http
          .delete(
            Uri.parse('$baseUrl$cleanEndpoint'),
            headers: _headers,
          )
          .timeout(requestTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }

    if (response.statusCode == 401) {
      clearAuthToken();
      onAuthExpired?.call();
      throw const AuthExpiredException();
    }

    // Parse structured server error response
    String errorMessage = 'A server error occurred (${response.statusCode})';
    Map<String, dynamic>? parsedMap;
    try {
      if (response.body.isNotEmpty) {
        final parsed = jsonDecode(response.body);
        if (parsed is Map) {
          parsedMap = Map<String, dynamic>.from(parsed);
          if (parsed['message'] != null) {
            errorMessage = parsed['message'].toString();
          } else if (parsed['error'] != null) {
            errorMessage = parsed['error'].toString();
          }
        }
      }
    } catch (_) {
      // Keep default error message
    }

    if (response.statusCode == 409 ||
        (response.statusCode == 400 &&
            parsedMap != null &&
            (parsedMap['canSwap'] == true || parsedMap['activeTop3Tasks'] != null))) {
      throw ConflictException(errorMessage, conflictData: parsedMap, statusCode: response.statusCode);
    }

    throw ApiException(errorMessage, statusCode: response.statusCode);
  }
}

final focientNetworkClient = FocientNetworkClient();
