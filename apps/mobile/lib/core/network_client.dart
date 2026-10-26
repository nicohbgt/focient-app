import 'dart:convert';
import 'package:http/http.dart' as http;

class FocientNetworkClient {
  final String baseUrl;
  String? _jwtToken;

  FocientNetworkClient({this.baseUrl = 'http://10.0.2.2:4000'}); // Android emulator host alias

  void setAuthToken(String token) {
    _jwtToken = token;
  }

  void clearAuthToken() {
    _jwtToken = null;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      };

  Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
    );
    return _handleResponse(response);
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      throw Exception('HTTP ${response.statusCode}: ${response.body}');
    }
  }
}

final focientNetworkClient = FocientNetworkClient();
