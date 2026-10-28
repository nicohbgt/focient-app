import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int statusCode;

  const ApiException(this.message, {this.statusCode = 500});

  @override
  String toString() => message;
}

/// Real Network Client for FoCient Mobile
/// Communicates with the real FoCient API Engine
class FocientNetworkClient {
  final String baseUrl;
  String? _jwtToken;

  FocientNetworkClient({
    String? baseUrl,
  }) : baseUrl = baseUrl ??
            const String.fromEnvironment(
              'API_URL',
              defaultValue: 'http://10.0.2.2:4000/api',
            );

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

  Future<dynamic> get(String endpoint) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$cleanEndpoint'),
        headers: _headers,
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$cleanEndpoint'),
        headers: _headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> patch(String endpoint, Map<String, dynamic> body) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl$cleanEndpoint'),
        headers: _headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http.put(
        Uri.parse('$baseUrl$cleanEndpoint'),
        headers: _headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  Future<dynamic> delete(String endpoint) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl$cleanEndpoint'),
        headers: _headers,
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Unable to connect to FoCient server. Please check your internet connection.',
      );
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }

    // Parse structured server error response
    String errorMessage = 'A server error occurred (${response.statusCode})';
    try {
      if (response.body.isNotEmpty) {
        final parsed = jsonDecode(response.body);
        if (parsed is Map) {
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

    throw ApiException(errorMessage, statusCode: response.statusCode);
  }
}

final focientNetworkClient = FocientNetworkClient();
