import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/task_state.dart';
import '../../riverpod_providers.dart';

/// FoCient Add / Edit Task Screen
///
/// Implements:
/// - Top Bar: Back button, "Add Your Task" (or "Edit Your Task"), workload bell pill (e.g. 60%), notification bell & settings gear.
/// - Task Name: Input field with placeholder "Input in here!".
/// - Task Categories: Selectable category chips with dismissable cross affordance (e.g. Strategic, Execution, Meeting ✕, Operation, Personal).
/// - Task Duration: Chips (10 Minute, 15 Minute, 20 Minute, 25 Minute, 30 Minute, 45 Minute, 60 Minute).
/// - Focus Type: Light, Medium, Deep Focus pills with calendar icons.
/// - Time Slot: Side-by-side Date and Start Hour input fields.
/// - Backlog Task toggle switch.
/// - Need to Rest After Task toggle switch with system suggestion subtitle.
/// - Bottom Buttons: Cancel (Crimson Red) & Add New Task / Save Changes (Emerald Green).
class FocientAddTaskScreen extends ConsumerStatefulWidget {
  final MobileTask? taskToEdit;
  final VoidCallback? onBack;
  final ValueChanged<MobileTask>? onTaskSaved;

  const FocientAddTaskScreen({
    super.key,
    this.taskToEdit,
    this.onBack,
    this.onTaskSaved,
  });

  @override
  ConsumerState<FocientAddTaskScreen> createState() => _FocientAddTaskScreenState();
}

class _FocientAddTaskScreenState extends ConsumerState<FocientAddTaskScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _dateController;
  late final TextEditingController _startHourController;

  late String _selectedCategory;
  late int _selectedDurationMinutes;
  late String _selectedFocusType;
  late bool _isBacklog;
  late bool _needRestAfter;

  final List<String> _categories = const [
    'Strategic',
    'Execution',
    'Meeting',
    'Operation',
    'Personal',
  ];

  final Map<String, Color> _categoryColors = const {
    'Strategic': Color(0xFF7C3AED),
    'Execution': Color(0xFF0284C7),
    'Meeting': Color(0xFFD97706),
    'Operation': Color(0xFF0D9488),
    'Personal': Color(0xFF059669),
  };

  final List<int> _durations = const [10, 15, 20, 25, 30, 45, 60];

  final List<(String, Color, Color, Color)> _focusTypes = const [
    ('Light', Color(0xFFD1FAE5), Color(0xFFA7F3D0), Color(0xFF065F46)),
    ('Medium', Color(0xFFFEF3C7), Color(0xFFFDE68A), Color(0xFF92400E)),
    ('Deep Focus', Color(0xFFFFE4E6), Color(0xFFFECDD3), Color(0xFF9F1239)),
  ];

  @override
  void initState() {
    super.initState();
    final task = widget.taskToEdit;
    _nameController = TextEditingController(text: task?.title ?? '');
    _dateController = TextEditingController(text: task?.dateDisplay ?? 'October, 3rd 2026');
    _startHourController = TextEditingController(text: task?.startHourDisplay ?? '11:40');

    _selectedCategory = task?.categoryName ?? 'Meeting';
    _selectedDurationMinutes = task?.durationMinutes ?? 60;
    _selectedFocusType = task?.focusType ?? 'Deep Focus';
    _isBacklog = task?.isBacklog ?? false;
    _needRestAfter = task?.needRestAfter ?? true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dateController.dispose();
    _startHourController.dispose();
    super.dispose();
  }

  void _onSaveTask() {
    final title = _nameController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Beri nama tugas sebelum menyimpannya.'),
          backgroundColor: Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final isEdit = widget.taskToEdit != null;
    final categoryColor = _categoryColors[_selectedCategory] ?? const Color(0xFF7C3AED);

    final EnergyLevelEnum energyLevel = _selectedFocusType == 'Deep Focus'
        ? EnergyLevelEnum.high
        : (_selectedFocusType == 'Light' ? EnergyLevelEnum.low : EnergyLevelEnum.medium);

    final TaskPriorityEnum priority = _selectedFocusType == 'Deep Focus'
        ? TaskPriorityEnum.top3
        : TaskPriorityEnum.normal;

    final savedTask = MobileTask(
      id: widget.taskToEdit?.id ?? 'task-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      durationMinutes: _selectedDurationMinutes,
      priority: priority,
      energyLevel: energyLevel,
      status: widget.taskToEdit?.status ?? TaskStatusEnum.todo,
      categoryName: _selectedCategory,
      categoryColor: categoryColor,
      restMinutes: _needRestAfter ? 10 : 0,
      dateDisplay: _dateController.text.trim().isEmpty ? 'October, 3rd 2026' : _dateController.text.trim(),
      startHourDisplay: _startHourController.text.trim().isEmpty ? '11:40' : _startHourController.text.trim(),
      focusType: _selectedFocusType,
      isBacklog: _isBacklog,
      needRestAfter: _needRestAfter,
    );

    if (isEdit) {
      ref.read(taskListProvider.notifier).updateTask(savedTask);
    } else {
      ref.read(taskListProvider.notifier).addTask(savedTask);
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isEdit
              ? 'Tugas "$title" berhasil diperbarui!'
              : 'Tugas "$title" berhasil ditambahkan ke jadwal!',
        ),
        backgroundColor: const Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
      ),
    );

    if (widget.onTaskSaved != null) {
      widget.onTaskSaved!(savedTask);
    } else if (widget.onBack != null) {
      widget.onBack!();
    } else if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop(savedTask);
    }
  }

  void _onCancel() {
    if (widget.onBack != null) {
      widget.onBack!();
    } else if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralBgCanvas
        : const Color(0xFFF8FAFC);

    final cardBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final borderColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFCBD5E1);

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final isEdit = widget.taskToEdit != null;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(
              isDark: isDark,
              titleColor: titleColor,
              title: isEdit ? 'Edit Your Task' : 'Add Your Task',
            ),

            // Form Body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Task Name
                    _buildSectionHeader('Task Name', titleColor),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _nameController,
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        color: titleColor,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Input in here!',
                        hintStyle: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 13,
                          color: subtitleColor,
                        ),
                        filled: true,
                        fillColor: cardBg,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // 2. Task Categories
                    _buildSectionHeader('Task Categories', titleColor),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 38,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final category = _categories[index];
                          final isSelected = _selectedCategory == category;

                          return InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              setState(() {
                                _selectedCategory = category;
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFF7C3AED)
                                    : const Color(0xFFEDE9FE),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    category,
                                    style: TextStyle(
                                      fontFamily: FocientTypographyTokens.fontFamily,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected ? Colors.white : const Color(0xFF6B21A8),
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
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 20),

                    // 3. Task Duration
                    _buildSectionHeader('Task Duration', titleColor),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 38,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _durations.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final dur = _durations[index];
                          final isSelected = _selectedDurationMinutes == dur;

                          return InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              setState(() {
                                _selectedDurationMinutes = dur;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFF2563EB)
                                    : const Color(0xFFDBEAFE),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                '$dur Minute',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected ? Colors.white : const Color(0xFF1D4ED8),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 20),

                    // 4. Focus Type
                    _buildSectionHeader('Focus Type', titleColor),
                    const SizedBox(height: 8),
                    Row(
                      children: _focusTypes.map((item) {
                        final (label, unselectedBg, borderColorType, textColor) = item;
                        final isSelected = _selectedFocusType == label;

                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                setState(() {
                                  _selectedFocusType = label;
                                });
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? unselectedBg : unselectedBg.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected ? textColor : borderColorType,
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.calendar_month_outlined,
                                      size: 14,
                                      color: textColor,
                                    ),
                                    const SizedBox(width: 4),
                                    Flexible(
                                      child: Text(
                                        label,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontFamily: FocientTypographyTokens.fontFamily,
                                          fontSize: 12,
                                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                          color: textColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 20),

                    // 5. Time Slot
                    _buildSectionHeader('Time Slot', titleColor),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        // Date Field
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Date',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: titleColor,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: _dateController,
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  color: titleColor,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Input in here!',
                                  hintStyle: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 12,
                                    color: subtitleColor,
                                  ),
                                  filled: true,
                                  fillColor: cardBg,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(color: borderColor),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(color: borderColor),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Start Hour Field
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Start Hour',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: titleColor,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: _startHourController,
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 13,
                                  color: titleColor,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Input in here!',
                                  hintStyle: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 12,
                                    color: subtitleColor,
                                  ),
                                  filled: true,
                                  fillColor: cardBg,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(color: borderColor),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(color: borderColor),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // 6. Switches
                    // Backlog Task Switch
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Backlog Task',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: titleColor,
                          ),
                        ),
                        Switch.adaptive(
                          value: _isBacklog,
                          activeTrackColor: const Color(0xFF2563EB),
                          onChanged: (val) {
                            setState(() {
                              _isBacklog = val;
                            });
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Need to Rest After Task Switch
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                                  fontWeight: FontWeight.w700,
                                  color: titleColor,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'System suggested to have the rest after this task',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 12,
                                  color: subtitleColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch.adaptive(
                          value: _needRestAfter,
                          activeTrackColor: const Color(0xFF2563EB),
                          onChanged: (val) {
                            setState(() {
                              _needRestAfter = val;
                            });
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 36),

                    // 7. Action Buttons (Cancel & Add New Task)
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 44,
                            child: ElevatedButton(
                              onPressed: _onCancel,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE11D48),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                'Cancel',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: SizedBox(
                            height: 44,
                            child: ElevatedButton(
                              onPressed: _onSaveTask,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF059669),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                isEdit ? 'Save Changes' : 'Add New Task',
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Text(
      title,
      style: TextStyle(
        fontFamily: FocientTypographyTokens.fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: color,
      ),
    );
  }

  Widget _buildTopAppBar({
    required bool isDark,
    required Color titleColor,
    required String title,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: titleColor,
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: _onCancel,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFBFDBFE), width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.notifications_none_rounded, size: 14, color: Color(0xFF2563EB)),
                const SizedBox(width: 4),
                Text(
                  '60%',
                  style: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1E40AF),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, size: 22),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {},
          ),
          const SizedBox(width: 6),
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            color: const Color(0xFF64748B),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
