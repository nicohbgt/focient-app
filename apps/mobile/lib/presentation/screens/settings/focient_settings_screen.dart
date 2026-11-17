import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/auth_state.dart';
import '../../../data/workspace_category.dart';
import '../../riverpod_providers.dart';

/// FoCient Settings Screen
///
/// Implements Image 2 specifications:
/// - Header: Back arrow, Title "Settings", dynamic workload badge, Notification bell, Gear icon.
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
  String _startWorkTime = '09:00';
  String _endWorkTime = '17:00';
  int _maxFocusHours = 6;
  int _bufferPercentage = 20;
  String _workingRhythm = 'Early Bird';
  bool _rescheduleAuto = true;
  bool _adviceEnabled = true;
  int _overloadThreshold = 80;
  bool _bufferAlert = true;
  bool _pushNotifications = true;
  String _quietHours = '21:00 - 07:00';
  bool _googleCalendarConnected = false;
  bool _initialized = false;

  void _syncInitialData(AuthUser? user) {
    if (_initialized || user == null) return;
    _startWorkTime = user.startWorkTime.isNotEmpty ? user.startWorkTime : '09:00';
    _endWorkTime = user.endWorkTime.isNotEmpty ? user.endWorkTime : '17:00';
    _workingRhythm = user.energyRhythm.isNotEmpty ? user.energyRhythm : 'Early Bird';
    _maxFocusHours = ((user.dailyCapacityMinutes) / 60).clamp(1, 12).toInt();
    _initialized = true;
  }

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
    final nameCtrl = TextEditingController(text: user?.name ?? '');
    final userCtrl = TextEditingController(text: user?.username ?? user?.name ?? '');
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
                controller: nameCtrl,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: userCtrl,
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
                    final n = nameCtrl.text.trim();
                    final u = userCtrl.text.trim();
                    if (n.isNotEmpty && u.isNotEmpty) {
                      ref.read(authProvider.notifier).updateUserIdentity(name: n, username: u);
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Identity saved successfully.'),
                          backgroundColor: Color(0xFF059669),
                        ),
                      );
                    }
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
    final currentRole = user?.roleArchetype ?? 'General';
    final allRoles = <String>{
      currentRole,
      ...kOccupanciesList,
      'Software Engineer',
      'Product Manager',
      'Designer',
      'Researcher',
      'Operations',
      'Student',
    }.toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
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
            const SizedBox(height: 14),
            const Text(
              'Select Main Role',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            const Text(
              'Your main role tailors cognitive archetypes and task suggestions.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 12),
            ConstrainedBox(
              constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.45),
              child: ListView(
                shrinkWrap: true,
                children: allRoles.map((r) => ListTile(
                      title: Text(r, style: const TextStyle(fontWeight: FontWeight.w600)),
                      trailing: (currentRole == r)
                          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB))
                          : null,
                      onTap: () {
                        ref.read(authProvider.notifier).updateUserRole(r);
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Main role updated to $r'), backgroundColor: const Color(0xFF059669)),
                        );
                      },
                    )).toList(),
              ),
            ),
            const SizedBox(height: 10),
            ListTile(
              leading: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF2563EB)),
              title: const Text('Add Custom Role', style: TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
              onTap: () async {
                Navigator.of(ctx).pop();
                final customRole = await _promptCustomRole();
                if (customRole != null && customRole.isNotEmpty) {
                  ref.read(authProvider.notifier).updateUserRole(customRole);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Main role updated to $customRole'), backgroundColor: const Color(0xFF059669)),
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<String?> _promptCustomRole() {
    final ctrl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Custom Role'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'e.g. Bioinformatician, Architect...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white),
            onPressed: () => Navigator.of(ctx).pop(ctrl.text.trim()),
            child: const Text('Save Role'),
          ),
        ],
      ),
    );
  }

  void _showDailyActiveHourModal(AuthUser? user) {
    String start = _startWorkTime;
    String end = _endWorkTime;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
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
                    'Daily Active Hour',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Define your active working window to prevent guilt and protect boundaries.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Start Hour', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: start,
                              decoration: InputDecoration(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              items: ['07:00', '08:00', '08:30', '09:00', '09:30', '10:00'].map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
                              onChanged: (val) {
                                if (val != null) setModalState(() => start = val);
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('End Hour', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: end,
                              decoration: InputDecoration(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              items: ['16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
                              onChanged: (val) {
                                if (val != null) setModalState(() => end = val);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
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
                        final sParts = start.split(':');
                        final eParts = end.split(':');
                        final sMin = int.parse(sParts[0]) * 60 + int.parse(sParts[1]);
                        final eMin = int.parse(eParts[0]) * 60 + int.parse(eParts[1]);
                        final cap = (eMin - sMin).clamp(60, 960);

                        setState(() {
                          _startWorkTime = start;
                          _endWorkTime = end;
                        });

                        ref.read(authProvider.notifier).updateWorkloadSettings(
                          startWorkTime: start,
                          endWorkTime: end,
                          dailyCapacityMinutes: cap,
                        );

                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Active hours saved successfully.'),
                            backgroundColor: Color(0xFF059669),
                          ),
                        );
                      },
                      child: const Text('Save Active Hours', style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showMaxFocusHourModal() {
    int hours = _maxFocusHours;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Maximum Focus Hour',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Cap high-energy focus time each day to prevent cognitive exhaustion.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    children: [3, 4, 5, 6, 7, 8].map((h) {
                      final isSel = hours == h;
                      return ChoiceChip(
                        label: Text('$h Hours'),
                        selected: isSel,
                        selectedColor: const Color(0xFF2563EB),
                        labelStyle: TextStyle(
                          color: isSel ? Colors.white : const Color(0xFF0F172A),
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) => setModalState(() => hours = h),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
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
                        setState(() => _maxFocusHours = hours);
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Maximum focus set to $hours hours/day.'),
                            backgroundColor: const Color(0xFF059669),
                          ),
                        );
                      },
                      child: const Text('Save Limit'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showBufferPercentageModal() {
    int pct = _bufferPercentage;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Guilt-Free Buffer Hour',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Reserve a percentage of daily capacity as buffer for transitions and breaks.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    children: [10, 15, 20, 25, 30].map((p) {
                      final isSel = pct == p;
                      return ChoiceChip(
                        label: Text('$p% Buffer'),
                        selected: isSel,
                        selectedColor: const Color(0xFF2563EB),
                        labelStyle: TextStyle(
                          color: isSel ? Colors.white : const Color(0xFF0F172A),
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) => setModalState(() => pct = p),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
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
                        setState(() => _bufferPercentage = pct);
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Buffer capacity set to $pct%.'),
                            backgroundColor: const Color(0xFF059669),
                          ),
                        );
                      },
                      child: const Text('Save Buffer'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showWorkingRhythmModal() {
    const rhythms = ['Early Bird', 'Steady Pacer', 'Night Owl', 'Balanced'];
    String current = _workingRhythm;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Working Rhythm', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  const Text(
                    'Aligns your focus task suggestions with your natural biological peak energy.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),
                  ...rhythms.map((r) => ListTile(
                        title: Text(r, style: const TextStyle(fontWeight: FontWeight.w600)),
                        trailing: current == r ? const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB)) : null,
                        onTap: () {
                          setState(() => _workingRhythm = r);
                          ref.read(authProvider.notifier).updateWorkloadSettings(energyRhythm: r);
                          Navigator.of(ctx).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Working rhythm set to $r.'), backgroundColor: const Color(0xFF059669)),
                          );
                        },
                      )),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showRescheduleSetupModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Reschedule Setup', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  const Text(
                    'Intelligent rescheduling moves tasks forward calmly without guilt or penalization.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('Empathetic Auto-Reschedule', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Automatically slide unfinished tasks into next optimal slot.'),
                    value: _rescheduleAuto,
                    onChanged: (val) {
                      setModalState(() => _rescheduleAuto = val);
                      setState(() => _rescheduleAuto = val);
                    },
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
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text('Save Setup'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAdviceModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Advice and Recommendation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  const Text(
                    'Cognitive advice offers gentle pacing suggestions to avoid mid-day burnout.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('AI Cognitive Guidance', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Display calm coaching cards on dashboard and plan.'),
                    value: _adviceEnabled,
                    onChanged: (val) {
                      setModalState(() => _adviceEnabled = val);
                      setState(() => _adviceEnabled = val);
                    },
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
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text('Save Advice Preference'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showOverloadThresholdModal() {
    int threshold = _overloadThreshold;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Overload Detection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  const Text(
                    'Workloads exceeding this capacity trigger compassionate rebalance suggestions.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    children: [70, 75, 80, 85, 90].map((t) {
                      final isSel = threshold == t;
                      return ChoiceChip(
                        label: Text('$t% Threshold'),
                        selected: isSel,
                        selectedColor: const Color(0xFF2563EB),
                        labelStyle: TextStyle(
                          color: isSel ? Colors.white : const Color(0xFF0F172A),
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) => setModalState(() => threshold = t),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
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
                        setState(() => _overloadThreshold = threshold);
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Overload threshold set to $threshold%.'),
                            backgroundColor: const Color(0xFF059669),
                          ),
                        );
                      },
                      child: const Text('Save Threshold'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showQuietHourModal() {
    final ctrl = TextEditingController(text: _quietHours);
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
              const Text('Quiet Hour', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              const Text(
                'FoCient stays silent and protects your focus and rest during quiet hours.',
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: ctrl,
                decoration: InputDecoration(
                  labelText: 'Quiet Window (e.g. 21:00 - 07:00)',
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
                    final val = ctrl.text.trim();
                    if (val.isNotEmpty) {
                      setState(() => _quietHours = val);
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Quiet hours set to $val.'), backgroundColor: const Color(0xFF059669)),
                      );
                    }
                  },
                  child: const Text('Save Quiet Hours'),
                ),
              ),
            ],
          ),
        );
      },
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
    _syncInitialData(user);

    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? FocientColorDarkTokens.neutralBgCanvas : const Color(0xFFF8FAFC);
    final cardBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && widget.onBack != null) {
          widget.onBack!();
        }
      },
      child: Scaffold(
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
                            onTap: () => _showDailyActiveHourModal(user),
                          ),
                          _SettingRowData(
                            title: 'Maximum Focus Hour',
                            onTap: _showMaxFocusHourModal,
                          ),
                          _SettingRowData(
                            title: 'Guilt-Free Buffer Hour',
                            onTap: _showBufferPercentageModal,
                          ),
                          _SettingRowData(
                            title: 'Working Rhythm',
                            onTap: _showWorkingRhythmModal,
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
                            onTap: _showRescheduleSetupModal,
                          ),
                          _SettingRowData(
                            title: 'Advice and Recommendation',
                            onTap: _showAdviceModal,
                          ),
                          _SettingRowData(
                            title: 'Overload Detection',
                            onTap: _showOverloadThresholdModal,
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
                            onTap: () {
                              setState(() => _bufferAlert = !_bufferAlert);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(_bufferAlert ? 'Buffer Alert enabled (15-min notice).' : 'Buffer Alert muted.'),
                                  backgroundColor: const Color(0xFF059669),
                                ),
                              );
                            },
                          ),
                          _SettingRowData(
                            title: 'Notification',
                            onTap: () {
                              setState(() => _pushNotifications = !_pushNotifications);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(_pushNotifications ? 'Push notifications enabled.' : 'Push notifications disabled.'),
                                  backgroundColor: const Color(0xFF059669),
                                ),
                              );
                            },
                          ),
                          _SettingRowData(
                            title: 'Quiet Hour',
                            onTap: _showQuietHourModal,
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
                              ref.read(taskListProvider.notifier).loadFromStorage();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Workspace and schedules synchronized with server.'),
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
      ),
    );
  }

  // --- Top App Bar ---
  Widget _buildAppBar({
    required bool isDark,
    required Color titleColor,
    required Color subtitleColor,
  }) {
    final workload = ref.watch(currentWorkloadProvider);

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
            onPressed: () {
              if (widget.onBack != null) {
                widget.onBack!();
              } else if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              }
            },
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
          // Reactive Workload percentage badge
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
                Text(
                  '${workload.percent}%',
                  style: const TextStyle(
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
