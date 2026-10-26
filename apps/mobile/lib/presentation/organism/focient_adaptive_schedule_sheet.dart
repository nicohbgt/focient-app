import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/presentation/focient_copywriting.dart';
import 'package:focient_mobile/presentation/primitive/focient_badge.dart';
import 'package:focient_mobile/presentation/primitive/focient_button.dart';
import 'package:focient_mobile/presentation/primitive/focient_input_field.dart';

class FocientAdaptiveScheduleSheet extends StatefulWidget {
  final FoCientLanguage language;
  final String taskTitle;
  final int durationMinutes;
  final DateTime? initialConfirmedTime;
  final void Function(DateTime confirmedTime)? onConfirm;
  final VoidCallback? onDismiss;

  const FocientAdaptiveScheduleSheet({
    super.key,
    this.language = FoCientLanguage.id,
    required this.taskTitle,
    required this.durationMinutes,
    this.initialConfirmedTime,
    this.onConfirm,
    this.onDismiss,
  });

  @override
  State<FocientAdaptiveScheduleSheet> createState() => _FocientAdaptiveScheduleSheetState();
}

class _FocientAdaptiveScheduleSheetState extends State<FocientAdaptiveScheduleSheet> {
  late DateTime _selectedTime;
  late final TextEditingController _timeController;
  bool _touched = false;

  @override
  void initState() {
    super.initState();
    _selectedTime = widget.initialConfirmedTime ?? DateTime.now();
    _timeController = TextEditingController(text: _selectedTime.toIso8601String());
  }

  @override
  void dispose() {
    _timeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final copy = FoCientCopywriting.of(widget.language);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final validation = FocientValidators.validateConfirmedStartTime(
      _selectedTime,
      language: widget.language,
    );
    final isPastSlot = validation.isWarning;

    return Container(
      padding: const EdgeInsets.all(FocientSpacingTokens.space4),
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(FocientBorderRadiusTokens.radiusLg)),
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
                color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Konfirmasi Penataan Waktu Adaptif',
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
                  ),
                ),
              ),
              FocientBadge(
                text: '${widget.durationMinutes}mnt',
                variant: FocientBadgeVariant.neutral,
              ),
            ],
          ),
          const SizedBox(height: FocientSpacingTokens.space2),
          Text(
            widget.taskTitle,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          // Confirmed Start Time Field
          FocientInputField(
            controller: _timeController,
            label: 'Slot Jam Mulai (ISO 8601)',
            isWarning: _touched && isPastSlot,
            warningText: (_touched && isPastSlot) ? validation.errorMessage : null,
            onChanged: (val) {
              setState(() {
                _touched = true;
                final parsed = DateTime.tryParse(val.trim());
                if (parsed != null) {
                  _selectedTime = parsed;
                }
              });
            },
          ),
          const SizedBox(height: FocientSpacingTokens.space2),

          // Quick Action: Use Current Time
          TextButton(
            onPressed: () {
              setState(() {
                _selectedTime = DateTime.now();
                _timeController.text = _selectedTime.toIso8601String();
                _touched = true;
              });
            },
            child: const Text('Gunakan Jam Saat Ini'),
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          // Actions Row
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              FocientButton(
                variant: FocientButtonVariant.ghost,
                onPressed: widget.onDismiss,
                child: Text(copy.cancel),
              ),
              const SizedBox(width: FocientSpacingTokens.space2),
              FocientButton(
                variant: FocientButtonVariant.primary,
                onPressed: isPastSlot
                    ? null
                    : () {
                        widget.onConfirm?.call(_selectedTime);
                      },
                child: Text(copy.applyNewSchedule),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
