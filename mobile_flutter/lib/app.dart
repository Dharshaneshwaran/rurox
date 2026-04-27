import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/services/auth_service.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/substitutions/screens/substitutions_screen.dart';
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

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(user: widget.user),
      const TimetableScreen(),
      SubstitutionsScreen(currentTeacherId: widget.user.teacherId),
      ProfileScreen(user: widget.user, onLogout: widget.onLogout),
    ];

    return Scaffold(
      body: SafeArea(child: screens[_index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
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
        ],
      ),
    );
  }
}
