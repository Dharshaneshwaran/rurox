import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/utils/date_utils.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/loading_view.dart';
import '../services/substitution_service.dart';

class SubstitutionsScreen extends StatefulWidget {
  const SubstitutionsScreen({super.key, required this.currentTeacherId});

  final String? currentTeacherId;

  @override
  State<SubstitutionsScreen> createState() => _SubstitutionsScreenState();
}

class _SubstitutionsScreenState extends State<SubstitutionsScreen> {
  final _service = SubstitutionService();
  List<SubstitutionItem> _items = [];
  bool _loading = true;
  String? _error;
  String? _loadingId;

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
      _items = await _service.mine();
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _accept(String id) async {
    await _act(id, () => _service.accept(id));
  }

  Future<void> _reject(String id) async {
    await _act(id, () => _service.reject(id));
  }

  Future<void> _act(String id, Future<void> Function() action) async {
    setState(() {
      _loadingId = id;
      _error = null;
    });
    try {
      await action();
      await _load();
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loadingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const LoadingView(message: 'Loading substitutions...');

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Substitutions',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          const Text(
            'Assigned cover requests from /api/substitutions.',
            style: TextStyle(color: AppTheme.muted),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger)),
          ],
          const SizedBox(height: 18),
          if (_items.isEmpty)
            const _EmptyState()
          else
            ..._items.map(
              (item) => _SubstitutionCard(
                item: item,
                currentTeacherId: widget.currentTeacherId,
                loading: _loadingId == item.id,
                onAccept: () => _accept(item.id),
                onReject: () => _reject(item.id),
              ),
            ),
        ],
      ),
    );
  }
}

class _SubstitutionCard extends StatelessWidget {
  const _SubstitutionCard({
    required this.item,
    required this.currentTeacherId,
    required this.loading,
    required this.onAccept,
    required this.onReject,
  });

  final SubstitutionItem item;
  final String? currentTeacherId;
  final bool loading;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    final canAct =
        item.status == 'PENDING' &&
        item.replacementTeacherId == currentTeacherId;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${item.day} / Period ${item.period}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                _Status(status: item.status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              formatApiDate(item.date),
              style: const TextStyle(
                color: AppTheme.muted,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Divider(height: 24),
            Text('Absent: ${item.absentTeacher?.name ?? 'Unknown'}'),
            const SizedBox(height: 4),
            Text('Cover: ${item.replacementTeacher?.name ?? 'Searching...'}'),
            if (canAct) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Reject',
                      secondary: true,
                      loading: loading,
                      onPressed: onReject,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: 'Accept',
                      icon: Icons.check,
                      loading: loading,
                      onPressed: onAccept,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Status extends StatelessWidget {
  const _Status({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'ACCEPTED' => AppTheme.success,
      'REJECTED' => AppTheme.danger,
      'REASSIGNED' => AppTheme.muted,
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

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Text(
          'No substitutions scheduled.',
          style: TextStyle(color: AppTheme.muted),
        ),
      ),
    );
  }
}
