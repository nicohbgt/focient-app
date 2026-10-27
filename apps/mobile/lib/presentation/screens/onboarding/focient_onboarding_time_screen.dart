import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_rest_time_slider.dart';

/// FoCient Onboarding Step 3: Time Allocation Setup Screen
///
/// Implements:
/// - Step indicator: "3 of 5 steps" with 60% progress bar
/// - Title & Subtitle: "Time Allocation Setup"
/// - Daily Active Hour: Start Hour and End Hour with interactive Time Picker
/// - Rest Time per Task: Dynamic "$n Minutes / Task" with 0-30 min interval slider
/// - Next CTA with validation
class FocientOnboardingTimeScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final void Function(String startHour24, String endHour24, int restMinutes)? onNext;
  final String initialStartHour;
  final String initialEndHour;
  final int initialRestMinutes;

  const FocientOnboardingTimeScreen({
    super.key,
    this.onBack,
    this.onNext,
    this.initialStartHour = '09:00 AM',
    this.initialEndHour = '05:00 PM',
    this.initialRestMinutes = 20,
  });

  @override
  State<FocientOnboardingTimeScreen> createState() =>
      _FocientOnboardingTimeScreenState();
}

class _FocientOnboardingTimeScreenState
    extends State<FocientOnboardingTimeScreen> {
  late String _startHourDisplay;
  late String _endHourDisplay;
  late int _restMinutes;

  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);

  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startHourDisplay = widget.initialStartHour;
    _endHourDisplay = widget.initialEndHour;
    _restMinutes = widget.initialRestMinutes;
  }

  String _formatTimeOfDay(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? 'AM' : 'PM';
    final hourStr = hour.toString().padLeft(2, '0');
    return '$hourStr:$minute $period';
  }

  String _to24HourFormat(TimeOfDay time) {
    final hourStr = time.hour.toString().padLeft(2, '0');
    final minuteStr = time.minute.toString().padLeft(2, '0');
    return '$hourStr:$minuteStr';
  }

  Future<void> _pickStartTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _startTime,
    );
    if (picked != null) {
      setState(() {
        _startTime = picked;
        _startHourDisplay = _formatTimeOfDay(picked);
        _errorMessage = null;
      });
    }
  }

  Future<void> _pickEndTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _endTime,
    );
    if (picked != null) {
      setState(() {
        _endTime = picked;
        _endHourDisplay = _formatTimeOfDay(picked);
        _errorMessage = null;
      });
    }
  }

  void _onNextPressed() {
    final startMinutes = _startTime.hour * 60 + _startTime.minute;
    final endMinutes = _endTime.hour * 60 + _endTime.minute;

    if (endMinutes <= startMinutes) {
      setState(() {
        _errorMessage = 'Jam selesai kerja harus lebih besar dari jam mulai.';
      });
      return;
    }

    final start24 = _to24HourFormat(_startTime);
    final end24 = _to24HourFormat(_endTime);

    widget.onNext?.call(start24, end24, _restMinutes);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : FocientColorTokens.neutralBgCanvas;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final sectionLabelColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final fieldBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final fieldBorder = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFCBD5E1);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation & Step Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (widget.onBack != null)
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                          color: sectionLabelColor,
                          onPressed: widget.onBack,
                          tooltip: 'Back',
                        )
                      else
                        const SizedBox(width: 40),
                      Expanded(
                        child: Center(
                          child: Text(
                            '3 of 5 steps',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: subtitleColor,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 40),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // 60% Linear Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: 0.6, // Step 3 of 5
                      minHeight: 6,
                      backgroundColor: isDark
                          ? const Color(0xFF1E293B)
                          : const Color(0xFFE2E8F0),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xFF2563EB),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    // Header Title (Centered)
                    Center(
                      child: Text(
                        'Time Allocation Setup',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                          height: 1.25,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Subtitle (Centered)
                    Center(
                      child: Text(
                        'Enter your daily working/active hour, rest\nhour and off hour, it’s help you to avoiding\nburnout and toxic productivity',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: subtitleColor,
                          height: 1.4,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Section 1: Daily Active Hour
                    Text(
                      'Daily Active Hour',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Start Hour & End Hour Fields side by side
                    Row(
                      children: [
                        // Start Hour Field
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Start Hour',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: sectionLabelColor,
                                ),
                              ),
                              const SizedBox(height: 8),
                              InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: _pickStartTime,
                                child: Container(
                                  height: 48,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: fieldBg,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: _errorMessage != null
                                          ? const Color(0xFFE11D48)
                                          : fieldBorder,
                                    ),
                                  ),
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    _startHourDisplay.isNotEmpty
                                        ? _startHourDisplay
                                        : 'Input here',
                                    style: TextStyle(
                                      fontFamily: FocientTypographyTokens.fontFamily,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: _startHourDisplay.isNotEmpty
                                          ? titleColor
                                          : subtitleColor,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        // End Hour Field
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'End Hour',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: sectionLabelColor,
                                ),
                              ),
                              const SizedBox(height: 8),
                              InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: _pickEndTime,
                                child: Container(
                                  height: 48,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: fieldBg,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: _errorMessage != null
                                          ? const Color(0xFFE11D48)
                                          : fieldBorder,
                                    ),
                                  ),
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    _endHourDisplay.isNotEmpty
                                        ? _endHourDisplay
                                        : 'Input here',
                                    style: TextStyle(
                                      fontFamily: FocientTypographyTokens.fontFamily,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: _endHourDisplay.isNotEmpty
                                          ? titleColor
                                          : subtitleColor,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(
                          color: Color(0xFFE11D48),
                          fontSize: 12,
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),

                    // Section 2: Rest Time per Task
                    Text(
                      'Rest Time per Task',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Dynamic Value text: "$_restMinutes Minutes / Task"
                    Text(
                      '$_restMinutes ${_restMinutes == 1 ? 'Minute' : 'Minutes'} / Task',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // 0 - 30 Minutes Slider with Segment Dots
                    FocientRestTimeSlider(
                      valueMinutes: _restMinutes,
                      minMinutes: 0,
                      maxMinutes: 30,
                      stepMinutes: 5,
                      onChanged: (newVal) {
                        setState(() {
                          _restMinutes = newVal;
                        });
                      },
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),

            // Bottom CTA "Next" Button
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: SizedBox(
                width: double.infinity,
                child: FocientButton(
                  onPressed: _onNextPressed,
                  child: const Text(
                    'Next',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
