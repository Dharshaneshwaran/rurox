import 'package:intl/intl.dart';

const schoolDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const dayLabels = {
  'MON': 'Monday',
  'TUE': 'Tuesday',
  'WED': 'Wednesday',
  'THU': 'Thursday',
  'FRI': 'Friday',
};

String todaySchoolDay() {
  return switch (DateTime.now().weekday) {
    DateTime.monday => 'MON',
    DateTime.tuesday => 'TUE',
    DateTime.wednesday => 'WED',
    DateTime.thursday => 'THU',
    DateTime.friday => 'FRI',
    _ => 'MON',
  };
}

String formatApiDate(String? value) {
  if (value == null || value.isEmpty) return 'No date';
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  return DateFormat('EEE, MMM d').format(parsed.toLocal());
}
