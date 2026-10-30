import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/task_state.dart';
import '../../riverpod_providers.dart';

/// FoCient Quick Task Input Bottom Sheet
///
/// Implements a lightweight, low-friction task creation modal:
/// - Judul tugas (Text input with auto-focus)
/// - Estimasi durasi (15m, 25m, 45m, 60m chips)
/// - Toggle Deep Focus (switches to High Cognitive Load / Top 3 Focus)
/// - Optimistic 0ms state transition to Populated State
class QuickTaskInputSheet extends ConsumerStatefulWidget {
  final VoidCallback? onTaskCreated;

  const QuickTaskInputSheet({
    super.key,
    this.onTaskCreated,
  });

  @override
  ConsumerState<QuickTaskInputSheet> createState() => _QuickTaskInputSheetState();
}

class _QuickTaskInputSheetState extends ConsumerState<QuickTaskInputSheet> {
  final _titleController = TextEditingController();
  final _focusNode = FocusNode();
  int _selectedDuration = 25;
  bool _isDeepFocus = false;
  String? _validationError;

  final List<int> _durationOptions = const [15, 25, 45, 60];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _focusNode.requestFocus();
      }
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _submit() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() {
        _validationError = 'Silakan tuliskan judul aktivitas fokus.';
      });
      return;
    }

    final now = DateTime.now();
    final hourFormatted = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    final newTask = MobileTask(
      id: 'task_${now.millisecondsSinceEpoch}',
      title: title,
      durationMinutes: _selectedDuration,
      priority: _isDeepFocus ? TaskPriorityEnum.top3 : TaskPriorityEnum.normal,
      focusType: _isDeepFocus ? 'Deep Focus' : 'Medium',
      categoryName: _isDeepFocus ? 'Strategic' : 'Execution',
      categoryColor: _isDeepFocus ? const Color(0xFF7C3AED) : const Color(0xFF0284C7),
      status: TaskStatusEnum.todo,
      dateDisplay: 'Today',
      startHourDisplay: hourFormatted,
      restMinutes: _isDeepFocus ? 15 : 10,
    );

    // Instant optimistic update (0ms latency to Populated State)
    ref.read(taskListProvider.notifier).addTask(newTask);

    if (widget.onTaskCreated != null) {
      widget.onTaskCreated!();
    }

    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Aktivitas "$title" berhasil ditambahkan.',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0D9488),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    final bgColor = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final titleColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

    final subtitleColor = isDark
        ? FocientColorDarkTokens.neutralTextMuted
        : const Color(0xFF64748B);

    final borderColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFE2E8F0);

    return Container(
      padding: EdgeInsets.only(bottom: bottomInset),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F000000),
            blurRadius: 20,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.flash_on_rounded,
                      color: Color(0xFF0D9488),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Quick Task Input',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: titleColor,
                          ),
                        ),
                        Text(
                          'Mulai aktivitas baru tanpa beban jadwal berlebih',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 12,
                            color: subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: subtitleColor, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Task Title Input
              Text(
                'Judul Aktivitas',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _titleController,
                focusNode: _focusNode,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                onChanged: (_) {
                  if (_validationError != null) {
                    setState(() => _validationError = null);
                  }
                },
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
                decoration: InputDecoration(
                  hintText: 'Contoh: Review PR & Clean Code Architecture',
                  hintStyle: TextStyle(
                    fontFamily: FocientTypographyTokens.fontFamily,
                    fontSize: 14,
                    color: subtitleColor.withValues(alpha: 0.7),
                  ),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: borderColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.5),
                  ),
                ),
              ),
              if (_validationError != null) ...[
                const SizedBox(height: 6),
                Text(
                  _validationError!,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFDC2626),
                  ),
                ),
              ],
              const SizedBox(height: 18),

              // Estimated Duration Chips
              Text(
                'Estimasi Durasi (Menit)',
                style: TextStyle(
                  fontFamily: FocientTypographyTokens.fontFamily,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: _durationOptions.map((duration) {
                  final isSelected = _selectedDuration == duration;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () => setState(() => _selectedDuration = duration),
                      borderRadius: BorderRadius.circular(10),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF0D9488)
                              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF0D9488) : borderColor,
                          ),
                        ),
                        child: Text(
                          '$duration m',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF334155)),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 18),

              // Deep Focus Toggle
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _isDeepFocus
                      ? (isDark ? const Color(0xFF1E1B4B) : const Color(0xFFEEF2FF))
                      : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC)),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _isDeepFocus ? const Color(0xFF818CF8) : borderColor,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: _isDeepFocus
                            ? const Color(0xFF6366F1).withValues(alpha: 0.2)
                            : Colors.transparent,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.bolt_rounded,
                        color: _isDeepFocus ? const Color(0xFF4F46E5) : subtitleColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Deep Focus (Prioritas Top 3)',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: titleColor,
                            ),
                          ),
                          Text(
                            'Blok waktu konsentrasi intensif tanpa distraksi',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 11,
                              color: subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _isDeepFocus,
                      activeColor: const Color(0xFF0D9488),
                      activeTrackColor: const Color(0xFF99F6E4),
                      onChanged: (val) => setState(() => _isDeepFocus = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: BorderSide(color: borderColor),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Batal',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: subtitleColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        '+ Tambah Rencana',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
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
    );
  }
}
