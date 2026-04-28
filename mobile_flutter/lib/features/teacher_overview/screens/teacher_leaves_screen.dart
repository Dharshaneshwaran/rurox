import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/loading_view.dart';
import '../services/teacher_overview_service.dart';

class TeacherLeavesScreen extends StatefulWidget {
  const TeacherLeavesScreen({super.key});

  @override
  State<TeacherLeavesScreen> createState() => _TeacherLeavesScreenState();
}

class _TeacherLeavesScreenState extends State<TeacherLeavesScreen>
    with AutomaticKeepAliveClientMixin {
  final _service = TeacherOverviewService();
  List<TeacherLeaveRequest> _leaves = [];
  bool _loading = true;
  String? _error;
  String? _activeLeaveId;

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
      _leaves = await _service.leaves();
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _updateStatus(String leaveId, String status) async {
    setState(() {
      _activeLeaveId = leaveId;
      _error = null;
    });
    try {
      await _service.updateLeaveStatus(leaveId, status);
      await _load();
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _activeLeaveId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (_loading) {
      return const LoadingView(message: 'Loading leave approvals...');
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const _PageHeader(
            title: 'Leave Approvals',
            subtitle: 'Review leave requests from students assigned to you.',
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger)),
          ],
          const SizedBox(height: 18),
          if (_leaves.isEmpty)
            const _EmptyCard(message: 'No leave requests are pending or recorded.')
          else
            ..._leaves.map(
              (leave) => _LeaveCard(
                leave: leave,
                loading: _activeLeaveId == leave.id,
                onApprove: () => _updateStatus(leave.id, 'APPROVED'),
                onReject: () => _updateStatus(leave.id, 'REJECTED'),
              ),
            ),
        ],
      ),
    );
  }
}

class _LeaveCard extends StatelessWidget {
  const _LeaveCard({
    required this.leave,
    required this.loading,
    required this.onApprove,
    required this.onReject,
  });

  final TeacherLeaveRequest leave;
  final bool loading;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    final color = switch (leave.status) {
      'APPROVED' => AppTheme.success,
      'REJECTED' => AppTheme.danger,
      _ => AppTheme.warning,
    };

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
                      leave.student?.name ?? 'Student request',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: .12),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      leave.status,
                      style: TextStyle(color: color, fontWeight: FontWeight.w900),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${leave.student?.className ?? 'Class'} - Roll ${leave.student?.rollNumber ?? '-'}',
                style: const TextStyle(color: AppTheme.muted),
              ),
              const SizedBox(height: 12),
              Text(
                _rangeLabel(leave.startDate, leave.endDate),
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(leave.reason, style: const TextStyle(color: AppTheme.muted)),
              if (leave.status == 'PENDING') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: loading ? null : onReject,
                        child: const Text('Reject'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: loading ? null : onApprove,
                        child: Text(loading ? 'Saving...' : 'Approve'),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _rangeLabel(DateTime? start, DateTime? end) {
    String format(DateTime? value) {
      if (value == null) return '--';
      return '${value.day.toString().padLeft(2, '0')}/${value.month.toString().padLeft(2, '0')}/${value.year}';
    }

    return '${format(start)} to ${format(end)}';
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
