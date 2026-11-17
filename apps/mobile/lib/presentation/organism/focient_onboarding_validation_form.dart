import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import 'package:focient_mobile/core/validators/focient_validators.dart';
import 'package:focient_mobile/presentation/focient_copywriting.dart';
import 'package:focient_mobile/presentation/primitive/focient_button.dart';
import 'package:focient_mobile/presentation/primitive/focient_input_field.dart';

class FocientOnboardingValidationForm extends StatefulWidget {
  final FoCientLanguage language;
  final double initialWorkHoursLimit;
  final String initialStartWorkTime;
  final String initialEndWorkTime;
  final List<String> availableCategories;
  final void Function(Map<String, dynamic> data)? onSubmit;

  const FocientOnboardingValidationForm({
    super.key,
    this.language = FoCientLanguage.id,
    this.initialWorkHoursLimit = 8.0,
    this.initialStartWorkTime = '09:00',
    this.initialEndWorkTime = '17:00',
    this.availableCategories = const [
      'Pekerjaan Inti',
      'Pembelajaran Mandiri',
      'Kesehatan & Istirahat',
      'Pengembangan Karir',
      'Manajemen Pribadi',
      'Eksplorasi Kreatif',
    ],
    this.onSubmit,
  });

  @override
  State<FocientOnboardingValidationForm> createState() => _FocientOnboardingValidationFormState();
}

class _FocientOnboardingValidationFormState extends State<FocientOnboardingValidationForm> {
  late final TextEditingController _hoursLimitController;
  late final TextEditingController _startTimeController;
  late final TextEditingController _endTimeController;

  final Set<String> _selectedCategories = {'Pekerjaan Inti'};

  bool _limitTouched = false;
  bool _startTouched = false;
  bool _endTouched = false;
  bool _categoriesTouched = false;

  @override
  void initState() {
    super.initState();
    _hoursLimitController = TextEditingController(text: widget.initialWorkHoursLimit.toString());
    _startTimeController = TextEditingController(text: widget.initialStartWorkTime);
    _endTimeController = TextEditingController(text: widget.initialEndWorkTime);
  }

  @override
  void dispose() {
    _hoursLimitController.dispose();
    _startTimeController.dispose();
    _endTimeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final copy = FoCientCopywriting.of(widget.language);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // 1. workHoursLimit validation
    final hoursDouble = double.tryParse(_hoursLimitController.text);
    final limitResult = FocientValidators.validateWorkHoursLimit(
      hoursDouble,
      language: widget.language,
    );
    final showLimitError = _limitTouched && !limitResult.isValid;

    // 2. startWorkTime & endWorkTime range validation
    final rangeResult = FocientValidators.validateWorkHoursRange(
      _startTimeController.text.trim(),
      _endTimeController.text.trim(),
      language: widget.language,
    );
    final showRangeError = (_startTouched || _endTouched) && !rangeResult.isValid;

    // 3. selectedCategories validation (1 to 5)
    final categoriesResult = FocientValidators.validateSelectedCategories(
      _selectedCategories.toList(),
      language: widget.language,
    );
    final showCategoriesWarning = _categoriesTouched && !categoriesResult.isValid;

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
          Text(
            'Setup Ritme & Batasan Kerja Harian',
            style: TextStyle(
              fontFamily: FocientTypographyTokens.fontFamily,
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isDark ? FocientColorDarkTokens.neutralTextBold : FocientColorTokens.neutralTextBold,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space1),
          Text(
            'Tentukan batasan jam kerja realistis untuk menjaga ritme yang tenang.',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
            ),
          ),
          const SizedBox(height: FocientSpacingTokens.space4),

          // Field 1: Work Hours Limit
          FocientInputField(
            controller: _hoursLimitController,
            label: 'Batas Jam Kerja Harian (1 - 16 Jam)',
            isNumeric: true,
            unit: copy.hoursShort,
            isInvalid: showLimitError,
            errorText: showLimitError ? limitResult.errorMessage : null,
            onChanged: (_) {
              setState(() => _limitTouched = true);
            },
          ),
          const SizedBox(height: FocientSpacingTokens.space3),

          // Fields 2 & 3: Start Time & End Time
          Row(
            children: [
              Expanded(
                child: FocientInputField(
                  controller: _startTimeController,
                  label: 'Jam Mulai (HH:mm)',
                  hintText: '09:00',
                  isInvalid: showRangeError,
                  onChanged: (_) {
                    setState(() => _startTouched = true);
                  },
                ),
              ),
              const SizedBox(width: FocientSpacingTokens.space3),
              Expanded(
                child: FocientInputField(
                  controller: _endTimeController,
                  label: 'Jam Selesai (HH:mm)',
                  hintText: '17:00',
                  isInvalid: showRangeError,
                  onChanged: (_) {
                    setState(() => _endTouched = true);
                  },
                ),
              ),
            ],
          ),
          if (showRangeError) ...[
            const SizedBox(height: 4),
            Text(
              rangeResult.errorMessage!,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark ? FocientColorDarkTokens.dangerTextBold : FocientColorTokens.dangerTextBold,
              ),
            ),
          ],
          const SizedBox(height: FocientSpacingTokens.space3),

          // Field 4: Selected Categories (1 to 5)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Pilar Kategori Kerja (1 - 5)',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted,
                    ),
                  ),
                  Text(
                    '${_selectedCategories.length} / 5',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: _selectedCategories.length > 5
                          ? (isDark ? FocientColorDarkTokens.dangerTextBold : FocientColorTokens.dangerTextBold)
                          : (isDark ? FocientColorDarkTokens.neutralTextMuted : FocientColorTokens.neutralTextMuted),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: FocientSpacingTokens.space2),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(FocientSpacingTokens.space3),
                decoration: BoxDecoration(
                  color: showCategoriesWarning
                      ? (isDark ? FocientColorDarkTokens.warningBgSubtle : FocientColorTokens.warningBgSubtle)
                      : (isDark ? FocientColorDarkTokens.neutralSurfaceMuted : FocientColorTokens.neutralSurfaceMuted),
                  borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                  border: Border.all(
                    color: showCategoriesWarning
                        ? (isDark ? FocientColorDarkTokens.warningActionBase : FocientColorTokens.warningActionBase)
                        : (isDark ? FocientColorDarkTokens.neutralBorderSubtle : FocientColorTokens.neutralBorderSubtle),
                    width: showCategoriesWarning
                        ? FocientBorderRadiusTokens.strokeBold
                        : FocientBorderRadiusTokens.strokeRegular,
                  ),
                ),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: widget.availableCategories.map((cat) {
                    final isSelected = _selectedCategories.contains(cat);
                    return FilterChip(
                      label: Text(cat),
                      selected: isSelected,
                      onSelected: (selected) {
                        setState(() {
                          _categoriesTouched = true;
                          if (selected) {
                            _selectedCategories.add(cat);
                          } else {
                            _selectedCategories.remove(cat);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              ),
              if (showCategoriesWarning) ...[
                const SizedBox(height: 4),
                Text(
                  categoriesResult.errorMessage!,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: isDark ? FocientColorDarkTokens.warningTextBold : FocientColorTokens.warningTextBold,
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
              onPressed: () {
                setState(() {
                  _limitTouched = true;
                  _startTouched = true;
                  _endTouched = true;
                  _categoriesTouched = true;
                });

                if (limitResult.isValid && rangeResult.isValid && categoriesResult.isValid) {
                  widget.onSubmit?.call({
                    'workHoursLimit': hoursDouble,
                    'startWorkTime': _startTimeController.text.trim(),
                    'endWorkTime': _endTimeController.text.trim(),
                    'selectedCategories': _selectedCategories.toList(),
                  });
                }
              },
              child: const Text('Simpan Preferensi Ritme'),
            ),
          ),
        ],
      ),
    );
  }
}
