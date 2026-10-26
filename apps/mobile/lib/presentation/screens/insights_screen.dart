import 'package:flutter/material.dart';
import '../../core/inter_theme.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Refleksi & Wawasan'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          Text('Wawasan Produktivitas Mingguan', style: FocientTheme.heading2),
          const SizedBox(height: 8),
          Text(
            'Pendekatan guilt-free memastikan evaluasi mingguan tetap memotivasi dan tidak membebani.',
            style: FocientTheme.bodyLarge.copyWith(color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 24),
          _buildMetricCard(
            title: 'WAKTU FOKUS UTAMA',
            value: '28.5 Jam',
            subtitle: 'Ritme stabil tercapai tanpa kelelahan kognitif.',
            color: FocientTheme.primaryBlue,
          ),
          const SizedBox(height: 12),
          _buildMetricCard(
            title: 'TOP 3 SELESAI',
            value: '85%',
            subtitle: 'Isolasi 3 tugas harian berjalan konsisten.',
            color: FocientTheme.secondaryTeal,
          ),
          const SizedBox(height: 12),
          _buildMetricCard(
            title: 'PENYESUAIAN ADAPTIF',
            value: '4 Kali',
            subtitle: 'Pergeseran linimasa downstream berjalan tenang.',
            color: FocientTheme.warningAmber,
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
  }) {
    return Card(
      color: FocientTheme.neutralCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: FocientTheme.neutralBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: FocientTheme.micro.copyWith(color: color)),
            const SizedBox(height: 6),
            Text(value, style: FocientTheme.heading1),
            const SizedBox(height: 4),
            Text(subtitle, style: FocientTheme.caption),
          ],
        ),
      ),
    );
  }
}
