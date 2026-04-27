import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../storage/secure_storage_service.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({SecureStorageService? storage, http.Client? httpClient})
    : _storage = storage ?? SecureStorageService(),
      _httpClient = httpClient ?? http.Client();

  final SecureStorageService _storage;
  final http.Client _httpClient;

  Future<dynamic> get(String path) => _send('GET', path);

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) =>
      _send('POST', path, body: body);

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    try {
      final token = await _storage.readToken();
      final headers = <String, String>{
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = switch (method) {
        'GET' => await _httpClient.get(uri, headers: headers),
        'POST' => await _httpClient.post(
          uri,
          headers: headers,
          body: body == null ? null : jsonEncode(body),
        ),
        _ => throw ApiException('Unsupported method $method'),
      };

      final text = response.body;
      final data = text.isEmpty ? null : jsonDecode(text);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final message = data is Map<String, dynamic>
            ? _extractMessage(data)
            : 'Request failed with status ${response.statusCode}';
        throw ApiException(message, statusCode: response.statusCode);
      }
      return data;
    } on ApiException {
      rethrow;
    } catch (error) {
      throw ApiException('Could not reach $uri. $error');
    }
  }

  String _extractMessage(Map<String, dynamic> data) {
    final message = data['message'];
    if (message is String) return message;
    if (message is List) return message.join(' ');
    return data['error']?.toString() ?? 'Request failed';
  }
}
