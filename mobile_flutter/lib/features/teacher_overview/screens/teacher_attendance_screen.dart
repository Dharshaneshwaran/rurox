import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_view.dart';
import '../services/teacher_overview_service.dart';

class TeacherAttendanceScreen extends StatefulWidget {
  const TeacherAttendanceScreen({super.key});

  @override
  State<TeacherAttendanceScreen> createState() => _TeacherAttendanceScreenState();
}

class _TeacherAttendanceScreenState extends State<TeacherAttendanceScreen>
    with AutomaticKeepAliveClientMixin {
  final _service = TeacherOverviewService();
  final _dateController = TextEditingController();
  List<SchoolClassItem> _classes = [];
  TeacherAttendanceSnapshot? _snapshot;
  bool _loading = true;
  String? _error;
  String? _selectedClass;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _dateController.text = _todayIso();
    _load();
  }

  @override
  void dispose() {
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _classes = await _service.classes();
      _classes.sort((a, b) => a.name.compareTo(b.name));
      _selectedClass ??= _classes.isNotEmpty ? _classes.first.name : null;
      if (_selectedClass != null) {
        _snapshot = await _service.attendance(
          className: _selectedClass!,
          date: _dateController.text,
        );
      }
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _pickDate() async {
    final initialDate = DateTime.tryParse(_dateController.text) ?? DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked == null) return;
    _dateController.text = _iso(picked);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (_loading) {
      return const LoadingView(message: 'Loading attendance...');
    }

    final snapshot = _snapshot;
    final presentIds = snapshot == null
        ? <String>{}
        : snapshot.records
              .where((record) => record.status == 'PRESENT')
              .map((record) => record.studentId)
              .toSet();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const _PageHeader(
            title: 'Attendance',
            subtitle: 'Quick class snapshot for a selected date.',
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger)),
          ],
          const SizedBox(height: 18),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedClass,
                    decoration: const InputDecoration(labelText: 'Class'),
                    items: _classes
                        .map(
                          (item) => DropdownMenuItem(
                            value: item.name,
                            child: Text(item.name),
                          ),
                        )
                        .toList(),
                    onChanged: (value) async {
                      if (value == null) return;
                      setState(() => _selectedClass = value);
                      await _load();
                    },
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: _pickDate,
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Date',
                        suffixIcon: Icon(Icons.calendar_month_outlined),
                      ),
                      child: Text(_dateController.text),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          if (snapshot == null)
            const _EmptyCard(message: 'Select a class to view attendance.')
          else ...[
            _SummaryCard(
              total: snapshot.students.length,
              present: presentIds.length,
            ),
            const SizedBox(height: 16),
            ...snapshot.students.map(
              (student) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: presentIds.contains(student.id)
                          ? AppTheme.primarySoft
                          : AppTheme.surfaceSubtle,
                      foregroundColor: presentIds.contains(student.id)
                          ? AppTheme.primary
                          : AppTheme.muted,
                      child: Icon(
                        presentIds.contains(student.id)
                            ? Icons.check_circle_outline
                            : Icons.remove_circle_outline,
                      ),
                    ),
                    title: Text(
                      student.name,
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    subtitle: Text(
                      'Roll No. ${student.rollNumber}',
                      style: const TextStyle(color: AppTheme.muted),
                    ),
                    trailing: Text(
                      presentIds.contains(student.id) ? 'Present' : 'Pending',
                      style: TextStyle(
                        color: presentIds.contains(student.id)
                            ? AppTheme.success
                            : AppTheme.warning,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _todayIso() => _iso(DateTime.now());

  String _iso(DateTime value) => value.toIso8601String().split('T').first;
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.total, required this.present});

  final int total;
  final int present;

  @override
  Widget build(BuildContext context) {
    final absent = total - present;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Expanded(child: _Metric(label: 'Total', value: '$total')),
            Expanded(child: _Metric(label: 'Present', value: '$present')),
            Expanded(child: _Metric(label: 'Open', value: '$absent')),
          ],
        ),
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
        ),
        Text(label, style: const TextStyle(color: AppTheme.muted)),
      ],
    );
  }
}

class _PageHeader extends StatelessWidget {
  const _PageHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        Text(subtitle, style: const TextStyle(color: AppTheme.muted)),
      ],
    );
  }
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Text(message, style: const TextStyle(color: AppTheme.muted)),
      ),
    );
  }
}
