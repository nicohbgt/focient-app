import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/working_rhythm.dart';
import '../../primitive/focient_button.dart';

/// FoCient Onboarding Step 2: Working Rhythm Setup Screen
///
/// Implements:
/// - Step indicator: "2 of 5 steps" with 40% linear progress bar
/// - Title & Subtitle: "Working Rhythm Setup"
/// - Daily Energy Rhythm: Horizontal card structure with title, peak energy badge, and description
/// - Scheduling Style: Structured vs Flexible toggle
/// - Next CTA with state capture
class FocientOnboardingRhythmScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final void Function(String rhythm, String style)? onNext;
  final String? initialRhythm;
  final String? initialStyle;

  const FocientOnboardingRhythmScreen({
    super.key,
    this.onBack,
    this.onNext,
    this.initialRhythm,
    this.initialStyle,
  });

  @override
  State<FocientOnboardingRhythmScreen> createState() =>
      _FocientOnboardingRhythmScreenState();
}

class _FocientOnboardingRhythmScreenState
    extends State<FocientOnboardingRhythmScreen> {
  String? _selectedRhythm;
  String? _selectedStyle;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedRhythm = widget.initialRhythm;
    _selectedStyle = widget.initialStyle;
  }

  void _onNextPressed() {
    if (_selectedRhythm == null || _selectedStyle == null) {
      setState(() {
        _errorMessage = 'Pilih ritme energi harian dan gaya penjadwalan Anda.';
      });
      return;
    }
    widget.onNext?.call(_selectedRhythm!, _selectedStyle!);
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
                            '2 of 5 steps',
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
                  // 40% Linear Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: 0.4, // Step 2 of 5
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
                        'Working Rhythm Setup',
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
                        'Setup your daily energy rhythms and\nscheduling style',
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

                    // Section 1: Daily Energy Rhythm
                    Text(
                      'Daily Energy Rhythm',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Daily Energy Rhythm Cards (Horizontal Scrollable)
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      clipBehavior: Clip.none,
                      child: Row(
                        children: kDailyEnergyRhythms.map((rhythm) {
                          final isSelected = _selectedRhythm == rhythm.title;
                          return Padding(
                            padding: const EdgeInsets.only(right: 12.0),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(14),
                              onTap: () {
                                setState(() {
                                  _selectedRhythm = rhythm.title;
                                  _errorMessage = null;
                                });
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                width: 175,
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? (isSelected
                                          ? const Color(0xFF1E293B)
                                          : FocientColorDarkTokens.neutralSurfaceCard)
                                      : (isSelected
                                          ? const Color(0xFFF8FAFC)
                                          : Colors.white),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF2563EB)
                                        : (isDark
                                            ? const Color(0xFF334155)
                                            : const Color(0xFFE2E8F0)),
                                    width: isSelected ? 2.0 : 1.0,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                                            blurRadius: 8,
                                            offset: const Offset(0, 3),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // 1. Card Title
                                    Text(
                                      rhythm.title,
                                      style: TextStyle(
                                        fontFamily: FocientTypographyTokens.fontFamily,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: titleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 8),

                                    // 2. Badge (Peak Energy Category)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEFF6FF),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        rhythm.badge,
                                        style: const TextStyle(
                                          fontFamily: FocientTypographyTokens.fontFamily,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF2563EB),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 12),

                                    // 3. Card Description
                                    Text(
                                      rhythm.description,
                                      style: TextStyle(
                                        fontFamily: FocientTypographyTokens.fontFamily,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w400,
                                        color: subtitleColor,
                                        height: 1.35,
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
                    const SizedBox(height: 32),

                    // Section 2: Scheduling Style
                    Text(
                      'Scheduling Style',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Two Buttons side by side: Structured & Flexible
                    Row(
                      children: kSchedulingStyles.map((style) {
                        final isSelected = _selectedStyle == style;
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () {
                                setState(() {
                                  _selectedStyle = style;
                                  _errorMessage = null;
                                });
                              },
                              child: Container(
                                height: 48,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF2563EB)
                                      : (isDark
                                          ? const Color(0xFF1E293B)
                                          : const Color(0xFFEFF6FF)),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF2563EB)
                                        : const Color(0xFFBFDBFE),
                                    width: 1,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  style,
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? Colors.white
                                        : const Color(0xFF2563EB),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(
                          color: Color(0xFFE11D48),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
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
