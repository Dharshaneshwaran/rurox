import '../../../core/network/api_client.dart';

class TimetableEntry {
  TimetableEntry({
    required this.day,
    required this.period,
    required this.subject,
    this.id,
    this.className,
    this.room,
  });

  final String? id;
  final String day;
  final int period;
  final String subject;
  final String? className;
  final String? room;

  factory TimetableEntry.fromJson(Map<String, dynamic> json) => TimetableEntry(
    id: json['id']?.toString(),
    day: json['day']?.toString() ?? '',
    period: int.tryParse(json['period'].toString()) ?? 0,
    subject: json['subject']?.toString() ?? 'Class',
    className: json['className']?.toString(),
    room: json['room']?.toString(),
  );
}

class TimetableService {
  TimetableService({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<TimetableEntry>> mine() async {
    final data =
        await _apiClient.get('/api/timetables/mine') as Map<String, dynamic>;
    final items = data['timetables'] as List<dynamic>? ?? [];
    return items
        .map((item) => TimetableEntry.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
