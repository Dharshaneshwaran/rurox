import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/services/auth_service.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/substitutions/screens/substitutions_screen.dart';
import 'features/teacher_overview/screens/teacher_attendance_screen.dart';
import 'features/teacher_overview/screens/teacher_classes_screen.dart';
import 'features/teacher_overview/screens/teacher_exams_screen.dart';
import 'features/teacher_overview/screens/teacher_leaves_screen.dart';
import 'features/teacher_overview/screens/teacher_students_screen.dart';
import 'features/timetable/screens/timetable_screen.dart';
import 'shared/widgets/loading_view.dart';

class RuroxApp extends StatelessWidget {
  const RuroxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Rurox Teacher',
      theme: AppTheme.light(),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final _authService = AuthService();
  AppUser? _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _restore();
  }

  Future<void> _restore() async {
    try {
      if (await _authService.hasToken()) {
        _user = await _authService.me() ?? await _authService.storedUser();
      }
    } catch (_) {
      await _authService.logout();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: LoadingView());
    if (_user == null) {
      return LoginScreen(onLoggedIn: (user) => setState(() => _user = user));
    }
    return MainShell(
      user: _user!,
      onLogout: () async {
        await _authService.logout();
        if (mounted) setState(() => _user = null);
      },
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key, required this.user, required this.onLogout});

  final AppUser user;
  final Future<void> Function() onLogout;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;
  late final List<_ShellDestination> _destinations;

  @override
  void initState() {
    super.initState();
    _destinations = [
      _ShellDestination(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        screen: DashboardScreen(user: widget.user),
      ),
      _ShellDestination(
        label: 'Students',
        icon: Icons.groups_2_outlined,
        screen: const TeacherStudentsScreen(),
      ),
      _ShellDestination(
        label: 'Exams & Marks',
        icon: Icons.assignment_outlined,
        screen: const TeacherExamsScreen(),
      ),
      _ShellDestination(
        label: 'Attendance',
        icon: Icons.fact_check_outlined,
        screen: const TeacherAttendanceScreen(),
      ),
      _ShellDestination(
        label: 'Leave Approvals',
        icon: Icons.event_note_outlined,
        screen: const TeacherLeavesScreen(),
      ),
      _ShellDestination(
        label: 'Classes',
        icon: Icons.class_outlined,
        screen: const TeacherClassesScreen(),
      ),
      _ShellDestination(
        label: 'My Timetable',
        icon: Icons.calendar_month_outlined,
        screen: const TimetableScreen(),
      ),
      _ShellDestination(
        label: 'Substitutions',
        icon: Icons.swap_horiz_outlined,
        screen: SubstitutionsScreen(currentTeacherId: widget.user.teacherId),
      ),
      _ShellDestination(
        label: 'Profile',
        icon: Icons.person_outline,
        screen: ProfileScreen(user: widget.user, onLogout: widget.onLogout),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_destinations[_index].label),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                widget.user.name ?? widget.user.email,
                style: const TextStyle(
                  color: AppTheme.muted,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppTheme.border)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.user.name ?? 'Teacher',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.user.email,
                      style: const TextStyle(color: AppTheme.muted),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _destinations.length,
                  itemBuilder: (context, index) {
                    final destination = _destinations[index];
                    final selected = index == _index;
                    return ListTile(
                      leading: Icon(
                        destination.icon,
                        color: selected ? AppTheme.primary : AppTheme.muted,
                      ),
                      title: Text(
                        destination.label,
                        style: TextStyle(
                          fontWeight: selected
                              ? FontWeight.w900
                              : FontWeight.w700,
                          color: selected ? AppTheme.primary : AppTheme.text,
                        ),
                      ),
                      selected: selected,
                      selectedTileColor: AppTheme.primarySoft,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        setState(() => _index = index);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _index,
          children: _destinations.map((item) => item.screen).toList(),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _bottomIndex,
        onDestinationSelected: _onBottomSelected,
        destinations: _bottomDestinations,
      ),
    );
  }

  int get _bottomIndex {
    const shellIndexes = [0, 6, 7, 8];
    final position = shellIndexes.indexOf(_index);
    return position == -1 ? 0 : position;
  }

  List<NavigationDestination> get _bottomDestinations => const [
    NavigationDestination(
      icon: Icon(Icons.dashboard_outlined),
      label: 'Dashboard',
    ),
    NavigationDestination(
      icon: Icon(Icons.calendar_month_outlined),
      label: 'Timetable',
    ),
    NavigationDestination(
      icon: Icon(Icons.swap_horiz_outlined),
      label: 'Substitutions',
    ),
    NavigationDestination(
      icon: Icon(Icons.person_outline),
      label: 'Profile',
    ),
  ];

  void _onBottomSelected(int value) {
    const shellIndexes = [0, 6, 7, 8];
    setState(() => _index = shellIndexes[value]);
  }
}

class _ShellDestination {
  const _ShellDestination({
    required this.label,
    required this.icon,
    required this.screen,
  });

  final String label;
  final IconData icon;
  final Widget screen;
}
