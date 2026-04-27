import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/utils/date_utils.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../auth/services/auth_service.dart';
import '../../substitutions/services/substitution_service.dart';
import '../../timetable/services/timetable_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, required this.user});

  final AppUser user;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _timetableService = TimetableService();
  final _substitutionService = SubstitutionService();
  List<TimetableEntry> _timetable = [];
  List<SubstitutionItem> _substitutions = [];
  bool _loading = true;
  String? _error;

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
      final results = await Future.wait([
        _timetableService.mine(),
        _substitutionService.mine(),
      ]);
      _timetable = results[0] as List<TimetableEntry>;
      _substitutions = results[1] as List<SubstitutionItem>;
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const LoadingView(message: 'Loading teacher dashboard...');
    }
    final today = todaySchoolDay();
    final todayItems = _timetable.where((entry) => entry.day == today).toList()
      ..sort((a, b) => a.period.compareTo(b.period));
    final pending = _substitutions
        .where((item) => item.status == 'PENDING')
        .length;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          _Header(name: widget.user.name ?? 'Teacher'),
          if (_error != null) _ErrorBanner(message: _error!),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: 'Today',
                  value: '${todayItems.length}',
                  detail: 'classes',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  label: 'Alerts',
                  value: '$pending',
                  detail: 'pending',
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _SectionTitle(
            title: 'Today Timetable',
            action: dayLabels[today] ?? today,
          ),
          const SizedBox(height: 10),
          if (todayItems.isEmpty)
            const _EmptyCard(message: 'No classes scheduled for today.')
          else
            ...todayItems.map((entry) => _TimetableTile(entry: entry)),
          const SizedBox(height: 20),
          _SectionTitle(
            title: 'Substitution Alerts',
            action: '${_substitutions.length} total',
          ),
          const SizedBox(height: 10),
          if (_substitutions.isEmpty)
            const _EmptyCard(message: 'No substitutions assigned.')
          else
            ..._substitutions
                .take(3)
                .map((item) => _SubstitutionTile(item: item)),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.name});
  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppTheme.text,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Teacher dashboard',
            style: TextStyle(color: Color(0xFFCBD5E1)),
          ),
          const SizedBox(height: 8),
          Text(
            'Hello, $name',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Review your day, week, and assigned cover work.',
            style: TextStyle(color: Color(0xFFCBD5E1)),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.detail,
  });
  final String label;
  final String value;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppTheme.muted,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
            ),
            Text(detail, style: const TextStyle(color: AppTheme.muted)),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.action});
  final String title;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
        Text(
          action,
          style: const TextStyle(
            color: AppTheme.primary,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _TimetableTile extends StatelessWidget {
  const _TimetableTile({required this.entry});
  final TimetableEntry entry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primarySoft,
          foregroundColor: AppTheme.primary,
          child: Text('${entry.period}'),
        ),
        title: Text(
          entry.subject,
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
        subtitle: Text(
          '${entry.className ?? 'Class'}${entry.room == null ? '' : ' / RM ${entry.room}'}',
        ),
      ),
    );
  }
}

class _SubstitutionTile extends StatelessWidget {
  const _SubstitutionTile({required this.item});
  final SubstitutionItem item;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(
          '${item.day} / Period ${item.period}',
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
        subtitle: Text('Absent: ${item.absentTeacher?.name ?? 'Unknown'}'),
        trailing: _StatusPill(status: item.status),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'ACCEPTED' => AppTheme.success,
      'REJECTED' => AppTheme.danger,
      _ => AppTheme.warning,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Text(message, style: const TextStyle(color: AppTheme.danger)),
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
