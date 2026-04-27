import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/utils/date_utils.dart';
import '../../../shared/widgets/loading_view.dart';
import '../services/timetable_service.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  final _service = TimetableService();
  List<TimetableEntry> _entries = [];
  bool _loading = true;
  String? _error;
  String _selectedDay = todaySchoolDay();

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
      _entries = await _service.mine();
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading timetable...');
    final selectedEntries =
        _entries.where((entry) => entry.day == _selectedDay).toList()
          ..sort((a, b) => a.period.compareTo(b.period));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'My Timetable',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          const Text(
            'Today and weekly periods from /api/timetables/mine.',
            style: TextStyle(color: AppTheme.muted),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger)),
          ],
          const SizedBox(height: 18),
          SizedBox(
            height: 42,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: schoolDays.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final day = schoolDays[index];
                final active = day == _selectedDay;
                return ChoiceChip(
                  selected: active,
                  label: Text(day),
                  onSelected: (_) => setState(() => _selectedDay = day),
                  selectedColor: AppTheme.primary,
                  labelStyle: TextStyle(
                    color: active ? Colors.white : AppTheme.muted,
                    fontWeight: FontWeight.w900,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 18),
          Text(
            dayLabels[_selectedDay] ?? _selectedDay,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          if (selectedEntries.isEmpty)
            const _EmptyState(message: 'No classes in this day.')
          else
            ...List.generate(8, (index) {
              final period = index + 1;
              final entry = selectedEntries
                  .where((item) => item.period == period)
                  .firstOrNull;
              return _PeriodRow(period: period, entry: entry);
            }),
        ],
      ),
    );
  }
}

class _PeriodRow extends StatelessWidget {
  const _PeriodRow({required this.period, required this.entry});
  final int period;
  final TimetableEntry? entry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: entry == null
                    ? AppTheme.surfaceSubtle
                    : AppTheme.primarySoft,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'P$period',
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: entry == null
                  ? const Text(
                      'Free Slot',
                      style: TextStyle(
                        color: AppTheme.muted,
                        fontWeight: FontWeight.w700,
                      ),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          entry!.subject,
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${entry!.className ?? 'Class'}${entry!.room == null ? '' : ' / RM ${entry!.room}'}',
                          style: const TextStyle(color: AppTheme.muted),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Text(message, style: const TextStyle(color: AppTheme.muted)),
      ),
    );
  }
}
