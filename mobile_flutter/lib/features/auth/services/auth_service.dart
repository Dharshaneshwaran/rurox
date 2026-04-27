import 'dart:convert';

import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage_service.dart';

class AppUser {
  AppUser({
    required this.id,
    required this.email,
    required this.role,
    this.name,
    this.teacherId,
    this.studentId,
  });

  final String id;
  final String? name;
  final String email;
  final String role;
  final String? teacherId;
  final String? studentId;

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    id: json['id']?.toString() ?? '',
    name: json['name']?.toString(),
    email: json['email']?.toString() ?? '',
    role: json['role']?.toString() ?? '',
    teacherId: json['teacherId']?.toString(),
    studentId: json['studentId']?.toString(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'teacherId': teacherId,
    'studentId': studentId,
  };
}

class AuthService {
  AuthService({ApiClient? apiClient, SecureStorageService? storage})
    : _apiClient = apiClient ?? ApiClient(storage: storage),
      _storage = storage ?? SecureStorageService();

  final ApiClient _apiClient;
  final SecureStorageService _storage;

  Future<AppUser?> storedUser() async {
    final raw = await _storage.readUserJson();
    if (raw == null) return null;
    return AppUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<AppUser> login(String email, String password) async {
    final data =
        await _apiClient.post(
              '/api/auth/login',
              body: {'email': email, 'password': password},
            )
            as Map<String, dynamic>;
    final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
    if (user.role != 'TEACHER') {
      throw ApiException('This mobile app is for teacher accounts.');
    }
    await _storage.saveAuth(
      token: data['token'].toString(),
      userJson: jsonEncode(user.toJson()),
    );
    return user;
  }

  Future<AppUser?> me() async {
    final data = await _apiClient.get('/api/auth/me') as Map<String, dynamic>;
    final rawUser = data['user'];
    if (rawUser == null) return null;
    final user = AppUser.fromJson(rawUser as Map<String, dynamic>);
    await _storage.saveUserJson(jsonEncode(user.toJson()));
    return user;
  }

  Future<bool> hasToken() async => (await _storage.readToken()) != null;

  Future<void> logout() => _storage.clear();
}
