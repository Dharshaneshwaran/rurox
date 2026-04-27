import '../../../core/network/api_client.dart';

class TeacherRef {
  TeacherRef({required this.id, required this.name});
  final String id;
  final String name;

  factory TeacherRef.fromJson(Map<String, dynamic>? json) => TeacherRef(
    id: json?['id']?.toString() ?? '',
    name: json?['name']?.toString() ?? 'Unknown',
  );
}

class SubstitutionItem {
  SubstitutionItem({
    required this.id,
    required this.day,
    required this.period,
    required this.date,
    required this.status,
    required this.autoAssigned,
    this.absentTeacherId,
    this.replacementTeacherId,
    this.absentTeacher,
    this.replacementTeacher,
  });

  final String id;
  final String day;
  final int period;
  final String date;
  final String status;
  final bool autoAssigned;
  final String? absentTeacherId;
  final String? replacementTeacherId;
  final TeacherRef? absentTeacher;
  final TeacherRef? replacementTeacher;

  factory SubstitutionItem.fromJson(Map<String, dynamic> json) =>
      SubstitutionItem(
        id: json['id']?.toString() ?? '',
        day: json['day']?.toString() ?? '',
        period: int.tryParse(json['period'].toString()) ?? 0,
        date: json['date']?.toString() ?? '',
        status: json['status']?.toString() ?? 'PENDING',
        autoAssigned: json['autoAssigned'] == true,
        absentTeacherId: json['absentTeacherId']?.toString(),
        replacementTeacherId: json['replacementTeacherId']?.toString(),
        absentTeacher: json['absentTeacher'] == null
            ? null
            : TeacherRef.fromJson(
                json['absentTeacher'] as Map<String, dynamic>,
              ),
        replacementTeacher: json['replacementTeacher'] == null
            ? null
            : TeacherRef.fromJson(
                json['replacementTeacher'] as Map<String, dynamic>,
              ),
      );
}

class SubstitutionService {
  SubstitutionService({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<SubstitutionItem>> mine() async {
    final data =
        await _apiClient.get('/api/substitutions') as Map<String, dynamic>;
    final items = data['substitutions'] as List<dynamic>? ?? [];
    return items
        .map((item) => SubstitutionItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> accept(String id) async {
    await _apiClient.post('/api/substitutions/$id/accept');
  }

  Future<void> reject(String id) async {
    await _apiClient.post('/api/substitutions/$id/reject');
  }

  // Placeholder for push notifications: backend has no device-token registration route yet.
  Future<void> registerDeviceToken(String token) async {
    throw UnimplementedError(
      'Missing backend route: POST /api/notifications/register-device',
    );
  }
}
