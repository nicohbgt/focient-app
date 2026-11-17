import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/focient_copywriting.dart';
import 'package:focient_mobile/presentation/primitive/focient_badge.dart';
import 'package:focient_mobile/presentation/primitive/focient_button.dart';
import 'package:focient_mobile/presentation/primitive/focient_input_field.dart';

class MobileCategoryItem {
  final String id;
  final String name;

  const MobileCategoryItem({required this.id, required this.name});
}

class FocientTaskValidationForm extends StatefulWidget {
  final FoCientLanguage language;
  final int currentActiveTop3Count;
  final List<MobileCategoryItem> categories;
  final void Function(Map<String, dynamic> taskData)? onSubmit;

  const FocientTaskValidationForm({
    super.key,
    this.language = FoCientLanguage.id,
    this.currentActiveTop3Count = 3,
    this.categories = const [
      MobileCategoryItem(id: '11111111-1111-4111-8111-111111111111', name: 'Pekerjaan Inti'),
      MobileCategoryItem(id: '22222222-2222-4222-8222-222222222222', name: 'Pembelajaran & Riset'),
      MobileCategoryItem(id: '33333333-3333-4333-8333-333333333333', name: 'Kebugaran & Istirahat'),
    ],
    this.onSubmit,
  });

  @override
  State<FocientTaskValidationForm> createState() => _FocientTaskValidationFormState();
}

class _FocientTaskValidationFormState extends State<FocientTaskValidationForm> {
  final _titleController = TextEditingController();
  final _durationController = TextEditingController(text: '30');
  final _startTimeController = TextEditingController();

  String? _selectedCategoryId;
  TaskPriorityEnum _priority = TaskPriorityEnum.normal;

  bool _titleTouched = false;
  bool _durationTouched = false;
  bool _categoryTouched = false;
  bool _startTimeTouched = false;

  @override
  void dispose() {
    _titleController.dispose();
    _durationController.dispose();
    _startTimeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final copy = FoCientCopywriting.of(widget.language);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // 1. Title validation
    final titleResult = FocientValidators.validateTitle(
      _titleController.text,
      language: widget.language,
    );
    final showTitleError = _titleTouched && !titleResult.isValid;

    // 2. Duration validation
    final durationInt = int.tryParse(_durationController.text);
    final durationResult = FocientValidators.validateDuration(
      durationInt,
      language: widget.language,
    );
    final showDurationError = _durationTouched && !durationResult.isValid;

    // 3. CategoryId validation
    final categoryResult = FocientValidators.validateCategoryId(
      _selectedCategoryId,
      activeCategoryIds: widget.categories.map((c) => c.id).toList(),
      language: widget.language,
    );
    final showCategoryError = _categoryTouched && !categoryResult.isValid;

    // 4. Start time validation
    final startTimeResult = FocientValidators.validateStartTime(
      _startTimeController.text.trim().isEmpty ? null : _startTimeController.text,
      language: widget.language,
    );
    final showStartTimeWarning =
        _startTimeTouched && startTimeResult.isWarning && _startTimeController.text.isNotEmpty;

    // 5. Automatic endTime calculation
    DateTime? parsedStartTime;
    DateTime? calculatedEndTime;
    if (_startTimeController.text.trim().isNotEmpty) {
      parsedStartTime = DateTime.tryParse(_startTimeController.text.trim());
      if (parsedStartTime != null && durationInt != null && durationResult.isValid) {
        calculatedEndTime = FocientValidators.calculateEndTime(parsedStartTime, durationInt);
      }
    }

    // 6. Top 3 Quota Validation
    final quotaResult = FocientValidators.validateTop3Quota(
      _priority,
      widget.currentActiveTop3Count,
      language: widget.language,
    );

    return Container(
      padding: const EdgeInsets.all(FocientSpacingTokens.space4),
      decoration: BoxDecoration(
        color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
        borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusLg),
        border: Border.all(
          color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Entri Tugas Linimasa',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
                ),
              ),
              FocientBadge(
                text: _priority == TaskPriorityEnum.top3 ? copy.topPriority : 'Regular',
                variant: _priority == TaskPriorityEnum.top3
                    ? FocientBadgeVariant.focus
                    : FocientBadgeVariant.neutral,
              ),
            ],
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          // Field 1: Title
          FocientInputField(
            controller: _titleController,
            label: 'Judul Tugas',
            hintText: 'Beri nama tugas singkat...',
            isInvalid: showTitleError,
            errorText: showTitleError ? titleResult.errorMessage : null,
            onChanged: (_) {
              setState(() => _titleTouched = true);
            },
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          // Field 2: Duration (tabular nums)
          FocientInputField(
            controller: _durationController,
            label: 'Estimasi Durasi (5 - 480 menit)',
            isNumeric: true,
            unit: copy.minutesShort,
            isInvalid: showDurationError,
            errorText: showDurationError ? durationResult.errorMessage : null,
            onChanged: (_) {
              setState(() => _durationTouched = true);
            },
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          // Field 3: Category Selector (UUID)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Pilar Kategori',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                ),
              ),
              const SizedBox(height: FocientSpacingTokens.space1),
              Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: isDark ? FocientColorDarkTokens.neutralSurfaceCard : FocientColorTokens.neutralSurfaceCard,
                  borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                  border: Border.all(
                    color: showCategoryError
                        ? (isDark ? FocientColorDarkTokens.dangerActionBase : FocientColorTokens.dangerActionBase)
                        : (isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle),
                    width: showCategoryError
                        ? FocientBorderRadiusTokens.strokeBold
                        : FocientBorderRadiusTokens.strokeRegular,
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCategoryId,
                    isExpanded: true,
                    hint: Text(
                      'Pilih satu pilar kategori...',
                      style: TextStyle(
                        color: isDark ? FocientColorDarkTokens.neutralTextSubtle : FocientColorTokens.neutralTextSubtle,
                        fontSize: 14,
                      ),
                    ),
                    items: widget.categories.map((cat) {
                      return DropdownMenuItem<String>(
                        value: cat.id,
                        child: Text(cat.name, style: const TextStyle(fontSize: 14)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedCategoryId = val;
                        _categoryTouched = true;
                      });
                    },
                  ),
                ),
              ),
              if (showCategoryError) ...[
                const SizedBox(height: 4),
                Text(
                  categoryResult.errorMessage!,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: isDark ? FocientColorDarkTokens.dangerTextBold : FocientColorTokens.dangerTextBold,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          // Field 4: Start Time (ISO 8601 Optional)
          FocientInputField(
            controller: _startTimeController,
            label: 'Jam Mulai (ISO 8601, Opsional)',
            hintText: '2026-10-23T09:00:00.000Z',
            isWarning: showStartTimeWarning,
            warningText: showStartTimeWarning ? startTimeResult.errorMessage : null,
            onChanged: (_) {
              setState(() => _startTimeTouched = true);
            },
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          // Field 5: Auto-Calculated End Time (Mandiri / No user input)
          if (calculatedEndTime != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? FocientColorDarkTokens.neutralSurfaceMuted : FocientColorTokens.neutralSurfaceMuted,
                borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                border: Border.all(
                  color: isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        copy.endTimeCalculatedNotice,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${calculatedEndTime.hour.toString().padLeft(2, '0')}:${calculatedEndTime.minute.toString().padLeft(2, '0')}',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          fontFeatures: const [FontFeature.tabularFigures()],
                          color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
                        ),
                      ),
                    ],
                  ),
                  const FocientBadge(text: 'Otomatis', variant: FocientBadgeVariant.accent),
                ],
              ),
            ),
            const SizedBox(height: FocientSpacingTokens.space3),
          ],

          // Field 6: Priority Toggle with Top-3 Quota Warning
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Prioritas Tugas',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                ),
              ),
              const SizedBox(height: FocientSpacingTokens.space1),
              Row(
                children: [
                  ChoiceChip(
                    label: const Text('Regular'),
                    selected: _priority == TaskPriorityEnum.normal,
                    onSelected: (val) {
                      if (val) setState(() => _priority = TaskPriorityEnum.normal);
                    },
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('Top 3 Fokus Utama'),
                    selected: _priority == TaskPriorityEnum.top3,
                    onSelected: (val) {
                      if (val) setState(() => _priority = TaskPriorityEnum.top3);
                    },
                  ),
                ],
              ),
              if (!quotaResult.isValid) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDark ? FocientColorDarkTokens.warningBgSubtle : FocientColorTokens.warningBgSubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase,
                    ),
                  ),
                  child: Text(
                    quotaResult.errorMessage!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? FocientColorDarkTokens.warningTextBold : FocientColorTokens.warningTextBold,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          // Submit CTA
          Align(
            alignment: Alignment.centerRight,
            child: FocientButton(
              variant: FocientButtonVariant.primary,
              onPressed: !quotaResult.isValid
                  ? null
                  : () {
                      setState(() {
                        _titleTouched = true;
                        _durationTouched = true;
                        _categoryTouched = true;
                        _startTimeTouched = true;
                      });

                      if (titleResult.isValid &&
                          durationResult.isValid &&
                          categoryResult.isValid &&
                          quotaResult.isValid) {
                        widget.onSubmit?.call({
                          'title': _titleController.text.trim(),
                          'durationMinutes': durationInt,
                          'categoryId': _selectedCategoryId,
                          'startTime': _startTimeController.text.trim().isEmpty ? null : _startTimeController.text.trim(),
                          'endTime': calculatedEndTime?.toIso8601String(),
                          'priority': _priority,
                        });
                      }
                    },
              child: Text(copy.saveToTimeline),
            ),
          ),
        ],
      ),
    );
  }
}
