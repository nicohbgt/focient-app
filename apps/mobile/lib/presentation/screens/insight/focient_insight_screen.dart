import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../settings/focient_settings_screen.dart';

/// FoCient Insight Screen
///
/// Implements Image 1 specifications:
/// - Top Bar: Back arrow, "Insight", 60% workload badge, Notification bell, Gear icon.
/// - Section 1: Workload Overview
///   - Dynamic period pills: [3 days], [7 days], [30 days], [90 days]
///   - Avg. Workload card with large percentage (e.g. 67.4%), progress bar,
///     and day breakdown (Overload Day, Optimal Day, Light Day).
/// - Section 2: Metric Overview
///   - Task Completion Rate (86%) & Top 3 Task Alignment (100%) side-by-side cards.
///   - Detailed Metric card (Buffer Retention Rate 65%, Top 3 Alignment 84%, Peak Focus 08:30 - 12:30).
/// - Section 3: Time Allocation
///   - Card with Total Time (100 Hours), Project (36 / 50), Personal (15 / 30), Relationship (12 / 20).
/// - Bottom Navigation Bar (Tab 4 active).
class FocientInsightScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final ValueChanged<int>? onNavigateTab;

  const FocientInsightScreen({
    super.key,
    this.onBack,
    this.onNavigateTab,
  });

  @override
  ConsumerState<FocientInsightScreen> createState() => _FocientInsightScreenState();
}

class _FocientInsightScreenState extends ConsumerState<FocientInsightScreen> {
  String _selectedPeriod = '3 days';

  // Data-driven state per period
  Map<String, dynamic> get _periodData {
    switch (_selectedPeriod) {
      case '7 days':
        return {
          'avgWorkload': 71.2,
          'overloadDays': 3,
          'optimalDays': 4,
          'lightDays': 1,
          'completionRate': 88,
          'top3Alignment': 95,
          'bufferRetention': 70,
          'top3DetailAlignment': 86,
          'peakHours': '09:00 - 13:00',
          'totalHours': 120,
          'projectHours': 48,
          'projectMax': 60,
          'personalHours': 20,
          'personalMax': 35,
          'relationshipHours': 16,
          'relationshipMax': 25,
        };
      case '30 days':
        return {
          'avgWorkload': 64.5,
          'overloadDays': 5,
          'optimalDays': 18,
          'lightDays': 7,
          'completionRate': 84,
          'top3Alignment': 92,
          'bufferRetention': 68,
          'top3DetailAlignment': 82,
          'peakHours': '08:30 - 12:00',
          'totalHours': 380,
          'projectHours': 150,
          'projectMax': 200,
          'personalHours': 65,
          'personalMax': 100,
          'relationshipHours': 50,
          'relationshipMax': 80,
        };
      case '90 days':
        return {
          'avgWorkload': 68.0,
          'overloadDays': 12,
          'optimalDays': 56,
          'lightDays': 22,
          'completionRate': 89,
          'top3Alignment': 94,
          'bufferRetention': 72,
          'top3DetailAlignment': 85,
          'peakHours': '08:30 - 12:30',
          'totalHours': 960,
          'projectHours': 420,
          'projectMax': 520,
          'personalHours': 180,
          'personalMax': 240,
          'relationshipHours': 140,
          'relationshipMax': 200,
        };
      case '3 days':
      default:
        // Exact numbers from Image 1 mockup
        return {
          'avgWorkload': 67.4,
          'overloadDays': 2,
          'optimalDays': 3,
          'lightDays': 2,
          'completionRate': 86,
          'top3Alignment': 100,
          'bufferRetention': 65,
          'top3DetailAlignment': 84,
          'peakHours': '08:30 - 12:30',
          'totalHours': 100,
          'projectHours': 36,
          'projectMax': 50,
          'personalHours': 15,
          'personalMax': 30,
          'relationshipHours': 12,
          'relationshipMax': 20,
        };
    }
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FocientSettingsScreen(
          onBack: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? FocientColorDarkTokens.neutralBgCanvas : const Color(0xFFF8FAFC);
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);

    final data = _periodData;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildAppBar(isDark: isDark, titleColor: titleColor, subtitleColor: subtitleColor),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1: Workload Overview
                    Text(
                      'Workload Overview',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Period Selector Pills (3 days, 7 days, 30 days, 90 days)
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      clipBehavior: Clip.none,
                      child: Row(
                        children: ['3 days', '7 days', '30 days', '90 days'].map((period) {
                          final isSelected = _selectedPeriod == period;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () => setState(() => _selectedPeriod = period),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFFEFF6FF) : cardBg,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF2563EB) : borderColor,
                                    width: isSelected ? 1.5 : 1.0,
                                  ),
                                ),
                                child: Text(
                                  period,
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    color: isSelected ? const Color(0xFF2563EB) : subtitleColor,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Avg Workload Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Avg. Workload',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: subtitleColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${data['avgWorkload']}%',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 12),
                          // Linear Capacity Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: (data['avgWorkload'] as num).toDouble() / 100.0,
                              minHeight: 8,
                              backgroundColor: const Color(0xFFEFF6FF),
                              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Day Count Legend Breakdown
                          _buildLegendRow(
                            dotColor: const Color(0xFFF97316),
                            label: 'Overload Day',
                            value: '${data['overloadDays']} Days',
                            titleColor: titleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildLegendRow(
                            dotColor: const Color(0xFF0284C7),
                            label: 'Optimal Day',
                            value: '${data['optimalDays']} Days',
                            titleColor: titleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildLegendRow(
                            dotColor: const Color(0xFF10B981),
                            label: 'Light Day',
                            value: '${data['lightDays']} Days',
                            titleColor: titleColor,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Section 2: Metric Overview
                    Text(
                      'Metric Overview',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // 2 Side-by-side Metric Cards
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: borderColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Task Completion Rate',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: subtitleColor,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  '${data['completionRate']}%',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                    color: titleColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: borderColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Top 3 Task Alignment',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: subtitleColor,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  '${data['top3Alignment']}%',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                    color: titleColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Detailed Metric Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: borderColor),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Detailed Metric',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _buildDetailMetricRow(
                            label: 'Buffer Retention Rate',
                            value: '${data['bufferRetention']}%',
                            titleColor: titleColor,
                            subtitleColor: subtitleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildDetailMetricRow(
                            label: 'Top 3 Task Alignment',
                            value: '${data['top3DetailAlignment']}%',
                            titleColor: titleColor,
                            subtitleColor: subtitleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildDetailMetricRow(
                            label: 'Peak Hour Focus',
                            value: '${data['peakHours']}',
                            titleColor: titleColor,
                            subtitleColor: subtitleColor,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Section 3: Time Allocation
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Time Allocation',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 12),
                          // Linear Capacity Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: 0.63,
                              minHeight: 8,
                              backgroundColor: const Color(0xFFEFF6FF),
                              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Total Time
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total Time',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: titleColor,
                                ),
                              ),
                              Text(
                                '${data['totalHours']} Hours',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: titleColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Category Breakdown
                          _buildTimeAllocationRow(
                            label: 'Project',
                            value: '${data['projectHours']} / ${data['projectMax']} Hours',
                            titleColor: titleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildTimeAllocationRow(
                            label: 'Personal',
                            value: '${data['personalHours']} / ${data['personalMax']} Hours',
                            titleColor: titleColor,
                          ),
                          const SizedBox(height: 8),
                          _buildTimeAllocationRow(
                            label: 'Relationship',
                            value: '${data['relationshipHours']} / ${data['relationshipMax']} Hours',
                            titleColor: titleColor,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Bottom Navigation Bar
            _buildBottomNavBar(isDark: isDark),
          ],
        ),
      ),
    );
  }

  // --- Top App Bar ---
  Widget _buildAppBar({
    required bool isDark,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            color: titleColor,
            onPressed: widget.onBack ?? () => widget.onNavigateTab?.call(0),
            tooltip: 'Back',
          ),
          const SizedBox(width: 4),
          Text(
            'Insight',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const Spacer(),
          // Workload 60% pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.notifications_none_rounded, size: 14, color: Color(0xFF2563EB)),
                const SizedBox(width: 4),
                const Text(
                  '60%',
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2563EB),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, size: 22),
            color: subtitleColor,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All systems calm. No notifications pending.'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            color: subtitleColor,
            onPressed: _openSettings,
            tooltip: 'Settings',
          ),
        ],
      ),
    );
  }

  Widget _buildLegendRow({
    required Color dotColor,
    required String label,
    required String value,
    required Color titleColor,
  }) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: titleColor,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailMetricRow({
    required String label,
    required String value,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: subtitleColor,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
      ],
    );
  }

  Widget _buildTimeAllocationRow({
    required String label,
    required String value,
    required Color titleColor,
  }) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(color: Color(0xFF2563EB), shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: titleColor,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: titleColor,
          ),
        ),
      ],
    );
  }

  // --- Bottom Navigation Bar ---
  Widget _buildBottomNavBar({required bool isDark}) {
    final navItems = [
      (Icons.home_outlined, Icons.home_rounded, 'Home'),
      (Icons.calendar_today_outlined, Icons.calendar_month_rounded, 'Plan'),
      (Icons.add_rounded, Icons.add_rounded, 'Add Task'),
      (Icons.format_list_bulleted_rounded, Icons.format_list_bulleted_rounded, 'Task List'),
      (Icons.insert_chart_outlined_rounded, Icons.insert_chart_rounded, 'Insights'),
    ];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: navItems.asMap().entries.map((entry) {
              final idx = entry.key;
              final (iconOutlined, iconFilled, label) = entry.value;
              final isActive = idx == 4; // Insights active
              final isCenterAdd = idx == 2;

              if (isCenterAdd) {
                return InkWell(
                  onTap: () => widget.onNavigateTab?.call(2),
                  borderRadius: BorderRadius.circular(24),
                  child: Transform.translate(
                    offset: const Offset(0, -6),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.add_rounded,
                            color: Colors.white,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          label,
                          style: const TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return InkWell(
                onTap: () => widget.onNavigateTab?.call(idx),
                borderRadius: BorderRadius.circular(8),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isActive ? iconFilled : iconOutlined,
                          size: 20,
                          color: isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          label,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 11,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                            color: isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
