import 'package:flutter/material.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FocientMobileApp());
}

class FocientMobileApp extends StatelessWidget {
  const FocientMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'FoCient',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Text('FoCient — Backend Core Engine Active. UI/UX screen development pending.'),
        ),
      ),
    );
  }
}
