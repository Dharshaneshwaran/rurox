import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:mobile_flutter/features/auth/screens/login_screen.dart';

void main() {
  testWidgets('shows teacher login entry point', (tester) async {
    await tester.pumpWidget(MaterialApp(home: LoginScreen(onLoggedIn: (_) {})));
    await tester.pump();

    expect(find.text('Timeassignment@ruroxz'), findsOneWidget);
    expect(find.text('INITIALIZE ACCESS'), findsOneWidget);
  });
}
