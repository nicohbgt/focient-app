import 'package:flutter/material.dart';
import '../../core/inter_theme.dart';
import '../organism/focient_onboarding_validation_form.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Batas Kapasitas Kerja'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Atur Jam Kerja Sehat',
              style: FocientTheme.heading1,
            ),
            const SizedBox(height: 8),
            Text(
              'Batas jam kerja melindungi energi harian Anda dari kelelahan mental tanpa rasa bersalah.',
              style: FocientTheme.bodyLarge.copyWith(color: const Color(0xFF64748B)),
            ),
            const SizedBox(height: 24),
            FocientOnboardingValidationForm(
              initialWorkHoursLimit: 8.0,
              initialStartWorkTime: '09:00',
              initialEndWorkTime: '17:00',
              initialCategories: const ['Pekerjaan Inti'],
              onSubmit: (data) {
                Navigator.pushReplacementNamed(context, '/');
              },
            ),
          ],
        ),
      ),
    );
  }
}
