import '../../../core/network/api_client.dart';

class TeacherStudent {
  TeacherStudent({
    required this.id,
    required this.name,
    required this.rollNumber,
    this.className,
    this.teacherNames = const [],
  });

  final String id;
  final String name;
  final String rollNumber;
  final String? className;
  final List<String> teacherNames;

  factory TeacherStudent.fromJson(Map<String, dynamic> json) {
    final teachers = (json['teachers'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map((teacher) => teacher['name']?.toString() ?? 'Teacher')
        .toList();

    return TeacherStudent(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Student',
      rollNumber: json['rollNumber']?.toString() ?? '-',
      className: json['className']?.toString(),
      teacherNames: teachers,
    );
  }
}

class TeacherExam {
  TeacherExam({
    required this.id,
    required this.name,
    required this.className,
    required this.subject,
    required this.maxMarks,
    required this.examDate,
    this.resultCount,
  });

  final String id;
  final String name;
  final String className;
  final String subject;
  final int maxMarks;
  final DateTime? examDate;
  final int? resultCount;

  factory TeacherExam.fromJson(Map<String, dynamic> json) => TeacherExam(
    id: json['id']?.toString() ?? '',
    name: json['name']?.toString() ?? 'Exam',
    className: json['className']?.toString() ?? 'Class',
    subject: json['subject']?.toString() ?? 'Subject',
    maxMarks: (json['maxMarks'] as num?)?.toInt() ?? 0,
    examDate: DateTime.tryParse(json['examDate']?.toString() ?? ''),
    resultCount:
        (json['_count'] as Map<String, dynamic>?)?['results'] as int?,
  );
}

class AttendanceStudent {
  AttendanceStudent({
    required this.id,
    required this.name,
    required this.rollNumber,
  });

  final String id;
  final String name;
  final String rollNumber;

  factory AttendanceStudent.fromJson(Map<String, dynamic> json) =>
      AttendanceStudent(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Student',
        rollNumber: json['rollNumber']?.toString() ?? '-',
      );
}

class AttendanceRecordItem {
  AttendanceRecordItem({
    required this.studentId,
    required this.status,
    this.subject,
  });

  final String studentId;
  final String status;
  final String? subject;

  factory AttendanceRecordItem.fromJson(Map<String, dynamic> json) =>
      AttendanceRecordItem(
        studentId: json['studentId']?.toString() ?? '',
        status: json['status']?.toString() ?? 'UNKNOWN',
        subject: json['subject']?.toString(),
      );
}

class TeacherAttendanceSnapshot {
  TeacherAttendanceSnapshot({
    required this.date,
    required this.students,
    required this.records,
  });

  final String date;
  final List<AttendanceStudent> students;
  final List<AttendanceRecordItem> records;

  factory TeacherAttendanceSnapshot.fromJson(Map<String, dynamic> json) =>
      TeacherAttendanceSnapshot(
        date: json['date']?.toString() ?? '',
        students: (json['students'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(AttendanceStudent.fromJson)
            .toList(),
        records: (json['attendance'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(AttendanceRecordItem.fromJson)
            .toList(),
      );
}

class LeaveStudent {
  LeaveStudent({
    required this.name,
    required this.rollNumber,
    this.className,
  });

  final String name;
  final String rollNumber;
  final String? className;

  factory LeaveStudent.fromJson(Map<String, dynamic> json) => LeaveStudent(
    name: json['name']?.toString() ?? 'Student',
    rollNumber: json['rollNumber']?.toString() ?? '-',
    className: json['className']?.toString(),
  );
}

class TeacherLeaveRequest {
  TeacherLeaveRequest({
    required this.id,
    required this.startDate,
    required this.endDate,
    required this.reason,
    required this.status,
    this.student,
  });

  final String id;
  final DateTime? startDate;
  final DateTime? endDate;
  final String reason;
  final String status;
  final LeaveStudent? student;

  factory TeacherLeaveRequest.fromJson(Map<String, dynamic> json) =>
      TeacherLeaveRequest(
        id: json['id']?.toString() ?? '',
        startDate: DateTime.tryParse(json['startDate']?.toString() ?? ''),
        endDate: DateTime.tryParse(json['endDate']?.toString() ?? ''),
        reason: json['reason']?.toString() ?? '',
        status: json['status']?.toString() ?? 'PENDING',
        student: json['student'] is Map<String, dynamic>
            ? LeaveStudent.fromJson(json['student'] as Map<String, dynamic>)
            : null,
      );
}

class SchoolClassItem {
  SchoolClassItem({
    required this.id,
    required this.name,
    this.classTeacherName,
    this.studentCount,
  });

  final String id;
  final String name;
  final String? classTeacherName;
  final int? studentCount;

  factory SchoolClassItem.fromJson(Map<String, dynamic> json) =>
      SchoolClassItem(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Class',
        classTeacherName:
            (json['classTeacher'] as Map<String, dynamic>?)?['name']?.toString(),
        studentCount:
            (json['_count'] as Map<String, dynamic>?)?['students'] as int?,
      );
}

class TeacherOverviewService {
  TeacherOverviewService({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<TeacherStudent>> students() async {
    final data = await _apiClient.get('/api/students') as Map<String, dynamic>;
    return (data['students'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(TeacherStudent.fromJson)
        .toList();
  }

  Future<List<TeacherExam>> exams() async {
    final data = await _apiClient.get('/api/exams') as List<dynamic>;
    return data
        .whereType<Map<String, dynamic>>()
        .map(TeacherExam.fromJson)
        .toList();
  }

  Future<List<SchoolClassItem>> classes() async {
    final data = await _apiClient.get('/api/school-classes') as List<dynamic>;
    return data
        .whereType<Map<String, dynamic>>()
        .map(SchoolClassItem.fromJson)
        .toList();
  }

  Future<List<TeacherLeaveRequest>> leaves() async {
    final data = await _apiClient.get('/api/leaves/teacher') as List<dynamic>;
    return data
        .whereType<Map<String, dynamic>>()
        .map(TeacherLeaveRequest.fromJson)
        .toList();
  }

  Future<void> updateLeaveStatus(String leaveId, String status) async {
    await _apiClient.put(
      '/api/leaves/$leaveId/status',
      body: {'status': status},
    );
  }

  Future<TeacherAttendanceSnapshot> attendance({
    required String className,
    required String date,
  }) async {
    final queryClass = Uri.encodeQueryComponent(className);
    final queryDate = Uri.encodeQueryComponent(date);
    final data =
        await _apiClient.get(
              '/api/attendance/class?className=$queryClass&date=$queryDate',
            )
            as Map<String, dynamic>;
    return TeacherAttendanceSnapshot.fromJson(data);
  }
}
