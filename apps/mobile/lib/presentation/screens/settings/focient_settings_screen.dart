import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/auth_state.dart';

/// FoCient Settings Screen
///
/// Implements Image 2 specifications:
/// - Header: Back arrow, Title "Settings", 60% workload badge, Notification bell, Gear icon.
/// - 6 Grouped Sections:
///   1. User Profile (Username and Identity, Main Role, Connected Account)
///   2. Workload Engine (Daily Active Hour, Maximum Focus Hour, Guilt-Free Buffer Hour, Working Rhythm)
///   3. Preferences (Reschedule Setup, Advice and Recommendation, Overload Detection)
///   4. Notification (Buffer Alert, Notification, Quiet Hour)
///   5. Tools Integration (Google Calendar, Synchronize)
///   6. Data, Privacy and Account (Export Data, Data Privacy Terms, Term and Conditions, History, Delete Account, Sign out)
class FocientSettingsScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;

  const FocientSettingsScreen({super.key, this.onBack});

  @override
  ConsumerState<FocientSettingsScreen> createState() => _FocientSettingsScreenState();
}

class _FocientSettingsScreenState extends ConsumerState<FocientSettingsScreen> {
  // Configurable local states for settings
  final String _startWorkTime = '09:00';
  final String _endWorkTime = '17:00';
  final int _maxFocusHours = 6;
  final int _bufferPercentage = 20;
  final String _workingRhythm = 'Early Bird';
  final bool _rescheduleAuto = true;
  final bool _adviceEnabled = true;
  final int _overloadThreshold = 80;
  final bool _bufferAlert = true;
  final bool _pushNotifications = true;
  final String _quietHours = '21:00 - 07:00';
  bool _googleCalendarConnected = false;

  void _showFeatureDialog({
    required String title,
    required String message,
    Widget? customContent,
    List<Widget>? actions,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          title,
          style: const TextStyle(
            fontFamily: FocientTypographyTokens.fontFamily,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        content: customContent ??
            Text(
              message,
              style: const TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                color: Color(0xFF475569),
              ),
            ),
        actions: actions ??
            [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Close', style: TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
              ),
            ],
      ),
    );
  }

  void _showUsernameModal(AuthUser? user) {
    final controller = TextEditingController(text: user?.username ?? user?.name ?? '');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: BoxDecoration(
            color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Username and Identity',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Email: ${user?.email ?? "member@focient.dev"}',
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                decoration: InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Identity saved successfully.'),
                        backgroundColor: Color(0xFF059669),
                      ),
                    );
                  },
                  child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showRoleSelector(AuthUser? user) {
    const roles = ['Software Engineer', 'Product Manager', 'Designer', 'Researcher', 'Operations', 'Student'];
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(ctx).brightness == Brightness.dark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Main Role',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            ...roles.map((r) => ListTile(
                  title: Text(r),
                  trailing: (user?.roleArchetype == r)
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB))
                      : null,
                  onTap: () {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Role set to $r'), backgroundColor: const Color(0xFF059669)),
                    );
                  },
                )),
          ],
        ),
      ),
    );
  }

  void _confirmSignOut() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out from your FoCient account?'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? FocientColorDarkTokens.neutralBgCanvas : const Color(0xFFF8FAFC);
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildAppBar(isDark: isDark, titleColor: titleColor, subtitleColor: subtitleColor),

            // Scrollable Settings Sections
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1: User Profile
                    _buildSectionHeader('User Profile', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Username and Identity',
                          onTap: () => _showUsernameModal(user),
                        ),
                        _SettingRowData(
                          title: 'Main Role',
                          onTap: () => _showRoleSelector(user),
                        ),
                        _SettingRowData(
                          title: 'Connected Account',
                          onTap: () => _showFeatureDialog(
                            title: 'Connected Account',
                            message: 'Google Account: ${user?.email ?? "member@focient.dev"} (Active)\nApple ID: Not connected\nGitHub: Not connected',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Section 2: Workload Engine
                    _buildSectionHeader('Workload Engine', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Daily Active Hour',
                          onTap: () => _showFeatureDialog(
                            title: 'Daily Active Hour',
                            message: 'Active Schedule: $_startWorkTime - $_endWorkTime (8.0 Hours Capacity). Guilt-free boundaries enforced.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Maximum Focus Hour',
                          onTap: () => _showFeatureDialog(
                            title: 'Maximum Focus Hour',
                            message: 'Current focus limit: $_maxFocusHours Hours per day to prevent cognitive fatigue.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Guilt-Free Buffer Hour',
                          onTap: () => _showFeatureDialog(
                            title: 'Guilt-Free Buffer Hour',
                            message: 'Buffer capacity: $_bufferPercentage% reserved for unexpected interruptions and restful transitions.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Working Rhythm',
                          onTap: () => _showFeatureDialog(
                            title: 'Working Rhythm',
                            message: 'Current energy rhythm: $_workingRhythm. Focus sessions are automatically prioritized during peak morning hours.',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Section 3: Preferences
                    _buildSectionHeader('Preferences', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Reschedule Setup',
                          onTap: () => _showFeatureDialog(
                            title: 'Reschedule Setup',
                            message: 'Empathetic Auto-Reschedule: ${_rescheduleAuto ? "Enabled" : "Manual confirmation"}. Unfinished tasks move forward guilt-free.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Advice and Recommendation',
                          onTap: () => _showFeatureDialog(
                            title: 'Advice and Recommendation',
                            message: 'AI Cognitive Guidance: ${_adviceEnabled ? "Active" : "Muted"}. Provides calm pacing tips.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Overload Detection',
                          onTap: () => _showFeatureDialog(
                            title: 'Overload Detection',
                            message: 'Overload threshold is set to $_overloadThreshold%. Workloads exceeding this trigger gentle rebalance suggestions.',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Section 4: Notification
                    _buildSectionHeader('Notification', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Buffer Alert',
                          onTap: () => _showFeatureDialog(
                            title: 'Buffer Alert',
                            message: 'Buffer Alert is ${_bufferAlert ? "active" : "muted"}. Alerts you 15 minutes before buffer blocks to ensure guilt-free rest.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Notification',
                          onTap: () => _showFeatureDialog(
                            title: 'Notification',
                            message: 'Gentle cognitive notifications are ${_pushNotifications ? "Enabled" : "Disabled"}.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Quiet Hour',
                          onTap: () => _showFeatureDialog(
                            title: 'Quiet Hour',
                            message: 'Quiet hours: $_quietHours. No notifications will be dispatched during this window.',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Section 5: Tools Integration
                    _buildSectionHeader('Tools Integration', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Google Calendar',
                          onTap: () {
                            setState(() => _googleCalendarConnected = !_googleCalendarConnected);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_googleCalendarConnected
                                    ? 'Google Calendar connected successfully.'
                                    : 'Google Calendar disconnected.'),
                                backgroundColor: const Color(0xFF059669),
                              ),
                            );
                          },
                        ),
                        _SettingRowData(
                          title: 'Synchronize',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Synchronizing schedules and calendar events...'),
                                backgroundColor: Color(0xFF2563EB),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Section 6: Data, Privacy and Account
                    _buildSectionHeader('Data, Privacy and Account', titleColor),
                    _buildCardGroup(
                      cardBg: cardBg,
                      borderColor: borderColor,
                      titleColor: titleColor,
                      items: [
                        _SettingRowData(
                          title: 'Export Data',
                          onTap: () => _showFeatureDialog(
                            title: 'Export Data',
                            message: 'Exporting your focus logs, tasks, and rhythm metrics as JSON format.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Data Privacy Terms',
                          onTap: () => _showFeatureDialog(
                            title: 'Data Privacy Terms',
                            message: 'FoCient values cognitive privacy. Your task descriptions and personal metrics are encrypted and never sold to third parties.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Term and Conditions',
                          onTap: () => _showFeatureDialog(
                            title: 'Term and Conditions',
                            message: 'FoCient Platform Terms of Service & Guilt-Free Cognitive Usage Agreement 2026.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'History',
                          onTap: () => _showFeatureDialog(
                            title: 'History',
                            message: 'Audit log: View past completed sessions, rebalance history, and buffer preservation logs.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Delete Account',
                          onTap: () => _showFeatureDialog(
                            title: 'Delete Account',
                            message: 'Permanent deletion requires email verification. All associated data will be removed.',
                          ),
                        ),
                        _SettingRowData(
                          title: 'Sign out',
                          onTap: _confirmSignOut,
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
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
            onPressed: widget.onBack ?? () => Navigator.of(context).maybePop(),
            tooltip: 'Back',
          ),
          const SizedBox(width: 4),
          Text(
            'Settings',
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
            onPressed: () {},
            tooltip: 'Settings',
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4.0),
      child: Text(
        title,
        style: TextStyle(
          fontFamily: FocientTypographyTokens.fontFamily,
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  Widget _buildCardGroup({
    required Color cardBg,
    required Color borderColor,
    required Color titleColor,
    required List<_SettingRowData> items,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          final isLast = idx == items.length - 1;

          return Column(
            children: [
              InkWell(
                onTap: item.onTap,
                borderRadius: BorderRadius.vertical(
                  top: idx == 0 ? const Radius.circular(14) : Radius.zero,
                  bottom: isLast ? const Radius.circular(14) : Radius.zero,
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.notifications_none_rounded,
                        size: 18,
                        color: Color(0xFF64748B),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: titleColor,
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: Color(0xFF94A3B8),
                      ),
                    ],
                  ),
                ),
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  color: borderColor,
                  indent: 16,
                  endIndent: 16,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _SettingRowData {
  final String title;
  final VoidCallback onTap;

  const _SettingRowData({required this.title, required this.onTap});
}
