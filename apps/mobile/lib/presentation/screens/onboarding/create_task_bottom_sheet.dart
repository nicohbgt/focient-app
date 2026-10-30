import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/onboarding_task.dart';
import '../../../data/workspace_category.dart';
import '../../primitive/focient_input_field.dart';

/// FoCient Create Task Bottom Sheet Modal (Step 4 of Onboarding)
///
/// Matches Image 3 specifications:
/// - Task Name text input
/// - Task Categories with consistent dot indicator styling
/// - Task Duration pills (10, 15, 20, 25, 30, 45, 60 minutes)
/// - Focus Type pills (Light, Medium, Deep Focus with calendar icons)
/// - Time Slot: Date and Start Hour
/// - Backlog Task toggle
/// - Need to Rest After Task? toggle with suggestion label
/// - Red Cancel & Green Confirm action buttons
class CreateTaskBottomSheet extends StatefulWidget {
  final List<WorkspaceCategory> availableCategories;
  final int defaultRestMinutes;
  final ValueChanged<OnboardingTask>? onTaskCreated;
  final OnboardingTask? initialTask;

  const CreateTaskBottomSheet({
    super.key,
    required this.availableCategories,
    this.defaultRestMinutes = 20,
    this.onTaskCreated,
    this.initialTask,
  });

  static Future<OnboardingTask?> show(
    BuildContext context, {
    required List<WorkspaceCategory> availableCategories,
    int defaultRestMinutes = 20,
    OnboardingTask? initialTask,
  }) {
    return showModalBottomSheet<OnboardingTask>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => CreateTaskBottomSheet(
        availableCategories: availableCategories,
        defaultRestMinutes: defaultRestMinutes,
        initialTask: initialTask,
      ),
    );
  }

  @override
  State<CreateTaskBottomSheet> createState() => _CreateTaskBottomSheetState();
}

class _CreateTaskBottomSheetState extends State<CreateTaskBottomSheet> {
  late final TextEditingController _nameController;
  WorkspaceCategory? _selectedCategory;
  int? _selectedDurationMinutes;
  String? _selectedFocusType;
  String? _dateDisplay;
  String? _startHourDisplay;
  bool _isBacklog = false;
  bool _needsRestAfter = false;
  String? _errorMessage;

  final List<int> _durations = [10, 15, 20, 25, 30, 45, 60];

  @override
  void initState() {
    super.initState();
    if (widget.initialTask != null) {
      final t = widget.initialTask!;
      _nameController = TextEditingController(text: t.title);
      try {
        _selectedCategory = widget.availableCategories.firstWhere((c) => c.name == t.categoryName);
      } catch (_) {
        _selectedCategory = WorkspaceCategory(
          name: t.categoryName,
          color: t.categoryColor,
          colorHex: '#7C3AED',
        );
      }
      _selectedDurationMinutes = t.durationMinutes;
      _selectedFocusType = t.focusType;
      _dateDisplay = t.dateDisplay;
      _startHourDisplay = t.startHourDisplay;
      _isBacklog = t.isBacklog;
      _needsRestAfter = t.needsRestAfter;
    } else {
      // Rule: Every new input form must start in an empty state first
      _nameController = TextEditingController();
      _selectedCategory = null;
      _selectedDurationMinutes = null;
      _selectedFocusType = null;
      _dateDisplay = null;
      _startHourDisplay = null;
      _needsRestAfter = false;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now.subtract(const Duration(days: 30)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _dateDisplay = '${_monthName(picked.month)}, ${picked.day}th ${picked.year}';
        _errorMessage = null;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: false),
        child: child!,
      ),
    );
    if (picked != null) {
      final period = picked.period == DayPeriod.am ? 'AM' : 'PM';
      final hourOfPeriod = picked.hourOfPeriod == 0 ? 12 : picked.hourOfPeriod;
      final hourStr = hourOfPeriod.toString().padLeft(2, '0');
      final minStr = picked.minute.toString().padLeft(2, '0');
      setState(() {
        _startHourDisplay = '$hourStr:$minStr $period';
        _errorMessage = null;
      });
    }
  }

  String _monthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[(month - 1).clamp(0, 11)];
  }

  void _onConfirm() {
    final title = _nameController.text.trim();
    if (title.isEmpty) {
      setState(() {
        _errorMessage = 'Task name cannot be empty';
      });
      return;
    }

    if (_selectedCategory == null) {
      setState(() {
        _errorMessage = 'Please select a task category';
      });
      return;
    }

    if (_selectedDurationMinutes == null) {
      setState(() {
        _errorMessage = 'Please select a task duration';
      });
      return;
    }

    if (_selectedFocusType == null) {
      setState(() {
        _errorMessage = 'Please select a focus type';
      });
      return;
    }

    final now = DateTime.now();
    final effectiveDate = _isBacklog
        ? 'Backlog'
        : (_dateDisplay ?? '${_monthName(now.month)}, ${now.day}th ${now.year}');
    final effectiveHour = _isBacklog
        ? '--:--'
        : (_startHourDisplay ?? '10:00 AM');

    final task = OnboardingTask(
      id: widget.initialTask?.id ?? 'task_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      categoryName: _selectedCategory!.name,
      categoryColor: _selectedCategory!.color,
      durationMinutes: _selectedDurationMinutes!,
      focusType: _selectedFocusType!,
      dateDisplay: effectiveDate.contains('Backlog') ? 'Backlog' : effectiveDate.split(' ').take(2).join(' '),
      startHourDisplay: effectiveHour,
      isBacklog: _isBacklog,
      needsRestAfter: _needsRestAfter,
      restMinutes: widget.defaultRestMinutes,
    );

    widget.onTaskCreated?.call(task);
    Navigator.of(context).pop(task);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sheetBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final fieldBg = isDark
        ? const Color(0xFF1E293B)
        : Colors.white;

    final fieldBorder = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFCBD5E1);

    return Container(
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag handle pill
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Modal Header Title
            Text(
              widget.initialTask != null ? 'Edit Your Task' : 'Create Your Task',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 20),

            // 1. Task Name
            Text(
              'Task Name',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 8),
            FocientInputField(
              controller: _nameController,
              hintText: 'Enter task name',
              errorText: _errorMessage,
              isInvalid: _errorMessage != null,
              onChanged: (_) {
                if (_errorMessage != null) {
                  setState(() => _errorMessage = null);
                }
              },
            ),
            const SizedBox(height: 18),

            // 2. Task Categories (Consistent UI with dot indicators)
            Text(
              'Task Categories',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              child: Row(
                children: widget.availableCategories.map((cat) {
                  final isSelected = _selectedCategory?.name == cat.name;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        setState(() => _selectedCategory = cat);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF7C3AED)
                              : (isDark
                                  ? const Color(0xFF1E293B)
                                  : Colors.white),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF7C3AED)
                                : (isDark
                                    ? const Color(0xFF334155)
                                    : const Color(0xFFE2E8F0)),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.white : cat.color,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              cat.name,
                              style: TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: isSelected
                                    ? Colors.white
                                    : (isDark ? Colors.white : const Color(0xFF1E293B)),
                              ),
                            ),
                            if (isSelected) ...[
                              const SizedBox(width: 6),
                              const Icon(
                                Icons.close_rounded,
                                size: 14,
                                color: Colors.white,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),

            // 3. Task Duration
            Text(
              'Task Duration',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              child: Row(
                children: _durations.map((duration) {
                  final isSelected = _selectedDurationMinutes == duration;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        setState(() => _selectedDurationMinutes = duration);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF2563EB)
                              : const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF2563EB)
                                : const Color(0xFFBFDBFE),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          '$duration Minute',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? Colors.white : const Color(0xFF2563EB),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),

            // 4. Focus Type (Horizontally scrollable with complete text visibility)
            Text(
              'Focus Type',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              child: Row(
                children: FocusType.values.map((type) {
                  final isSelected = _selectedFocusType == type.label;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        setState(() => _selectedFocusType = type.label);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 14),
                        decoration: BoxDecoration(
                          color: type.backgroundColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? type.borderColor : type.borderColor.withValues(alpha: 0.35),
                            width: isSelected ? 2.0 : 1.0,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.calendar_today_outlined,
                              size: 14,
                              color: type.textColor,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              type.label,
                              style: TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: type.textColor,
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
            const SizedBox(height: 18),

            // 5. Time Slot (Date & Start Hour) - hidden when Backlog Task is checked
            if (!_isBacklog) ...[
              Text(
                'Time Slot',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Date',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: subtitleColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: _pickDate,
                          child: Container(
                            height: 44,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: fieldBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: fieldBorder),
                            ),
                            alignment: Alignment.centerLeft,
                            child: Text(
                              _dateDisplay ?? 'Select date',
                              style: TextStyle(
                                fontSize: 13,
                                color: _dateDisplay != null ? titleColor : subtitleColor,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Start Hour',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: subtitleColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: _pickTime,
                          child: Container(
                            height: 44,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: fieldBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: fieldBorder),
                            ),
                            alignment: Alignment.centerLeft,
                            child: Text(
                              _startHourDisplay ?? 'Select hour',
                              style: TextStyle(
                                fontSize: 13,
                                color: _startHourDisplay != null ? titleColor : subtitleColor,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
            ],

            // 6. Backlog Task Toggle
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Backlog Task',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: titleColor,
                    ),
                  ),
                ),
                Switch.adaptive(
                  value: _isBacklog,
                  activeTrackColor: const Color(0xFF2563EB),
                  onChanged: (val) {
                    setState(() => _isBacklog = val);
                  },
                ),
              ],
            ),

            // 7. Need to Rest After Task Toggle
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Need to Rest After Task?',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: titleColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'System suggested to have the rest after this task',
                        style: TextStyle(
                          fontSize: 12,
                          color: subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _needsRestAfter,
                  activeTrackColor: const Color(0xFF2563EB),
                  onChanged: (val) {
                    setState(() => _needsRestAfter = val);
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Action Buttons (Cancel Red & Confirm Green)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _onConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Confirm',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ),
);
  }
}
