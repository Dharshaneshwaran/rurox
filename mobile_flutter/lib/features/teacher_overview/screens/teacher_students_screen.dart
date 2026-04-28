import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_view.dart';
import '../services/teacher_overview_service.dart';

class TeacherStudentsScreen extends StatefulWidget {
  const TeacherStudentsScreen({super.key});

  @override
  State<TeacherStudentsScreen> createState() => _TeacherStudentsScreenState();
}

class _TeacherStudentsScreenState extends State<TeacherStudentsScreen>
    with AutomaticKeepAliveClientMixin {
  final _service = TeacherOverviewService();
  List<TeacherStudent> _students = [];
  bool _loading = true;
  String? _error;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _students = await _service.students();
      _students.sort((a, b) {
        final classCompare = (a.className ?? '').compareTo(b.className ?? '');
        if (classCompare != 0) return classCompare;
        return a.name.compareTo(b.name);
      });
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (_loading) {
      return const LoadingView(message: 'Loading students...');
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const _PageHeader(
            title: 'Students',
            subtitle: 'Your assigned students grouped by class.',
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger)),
          ],
          const SizedBox(height: 18),
          _SummaryCard(
            value: '${_students.length}',
            label: 'students linked',
            detail:
                '${_students.map((item) => item.className).whereType<String>().toSet().length} classes',
          ),
          const SizedBox(height: 18),
          if (_students.isEmpty)
            const _EmptyCard(message: 'No students are linked to this teacher yet.')
          else
            ..._buildGroups(),
        ],
      ),
    );
  }

  List<Widget> _buildGroups() {
    final groups = <String, List<TeacherStudent>>{};
    for (final student in _students) {
      final key = student.className ?? 'Unassigned';
      groups.putIfAbsent(key, () => []).add(student);
    }

    return groups.entries.map((entry) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        entry.key,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    _CountPill(count: entry.value.length),
                  ],
                ),
                const SizedBox(height: 12),
                ...entry.value.map(
                  (student) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: AppTheme.primarySoft,
                          foregroundColor: AppTheme.primary,
                          child: Text(
                            student.name.isNotEmpty
                                ? student.name[0].toUpperCase()
                                : 'S',
                            style: const TextStyle(fontWeight: FontWeight.w900),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                student.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                'Roll No. ${student.rollNumber}',
                                style: const TextStyle(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }).toList();
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

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.value,
    required this.label,
    required this.detail,
  });

  final String value;
  final String label;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: AppTheme.primarySoft,
                borderRadius: BorderRadius.circular(16),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.groups_2_outlined, color: AppTheme.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(label, style: const TextStyle(color: AppTheme.muted)),
                ],
              ),
            ),
            Text(
              detail,
              style: const TextStyle(
                color: AppTheme.primary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CountPill extends StatelessWidget {
  const _CountPill({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primarySoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$count students',
        style: const TextStyle(
          color: AppTheme.primary,
          fontWeight: FontWeight.w900,
        ),
      ),
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
