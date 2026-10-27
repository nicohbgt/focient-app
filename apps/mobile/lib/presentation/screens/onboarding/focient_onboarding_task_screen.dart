import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/onboarding_task.dart';
import '../../../data/workspace_category.dart';
import '../../organism/focient_onboarding_task_card.dart';
import '../../primitive/focient_button.dart';
import 'create_task_bottom_sheet.dart';

/// FoCient Onboarding Step 4: Enter your first task Screen
///
/// Implements:
/// - Step indicator: "4 of 5 steps" with 80% linear progress bar
/// - Title & Subtitle: "Enter your first task"
/// - Your Task Category: UI consistency with Page 1 (colored dots & pill border)
/// - First Task Section:
///   - (A) Add Task Card: (+ icon) (title)
///   - (B) Task Added Card: title, timestamp, badges (category + focus + duration)
/// - Next CTA with at-least-1-task validation
class FocientOnboardingTaskScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final ValueChanged<List<OnboardingTask>>? onNext;
  final List<WorkspaceCategory> categories;
  final int defaultRestMinutes;
  final List<OnboardingTask>? initialTasks;

  const FocientOnboardingTaskScreen({
    super.key,
    this.onBack,
    this.onNext,
    required this.categories,
    this.defaultRestMinutes = 20,
    this.initialTasks,
  });

  @override
  State<FocientOnboardingTaskScreen> createState() =>
      _FocientOnboardingTaskScreenState();
}

class _FocientOnboardingTaskScreenState
    extends State<FocientOnboardingTaskScreen> {
  late List<OnboardingTask> _tasks;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tasks = List<OnboardingTask>.from(widget.initialTasks ?? []);
  }

  Future<void> _openCreateTaskSheet() async {
    final newTask = await CreateTaskBottomSheet.show(
      context,
      availableCategories: widget.categories,
      defaultRestMinutes: widget.defaultRestMinutes,
    );

    if (newTask != null && mounted) {
      setState(() {
        _tasks.add(newTask);
        _errorMessage = null;
      });
    }
  }

  void _removeTask(int index) {
    setState(() {
      _tasks.removeAt(index);
    });
  }

  void _onNextPressed() {
    if (_tasks.isEmpty) {
      setState(() {
        _errorMessage = 'Tambahkan minimal 1 task prioritas utama Anda.';
      });
      return;
    }

    widget.onNext?.call(_tasks);
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
                            '4 of 5 steps',
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
                  // 80% Linear Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: 0.8, // Step 4 of 5
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
                        'Enter your first task',
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
                        'Start with your most important task, the\nsystem will prioritize the execution',
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

                    // Section 1: Your Task Category (Strict Page 1 UI Consistency)
                    Text(
                      'Your Task Category',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Horizontal scrollable categories with Page 1 consistent dot styling
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      clipBehavior: Clip.none,
                      child: Row(
                        children: widget.categories.map((cat) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFF1E293B)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isDark
                                      ? const Color(0xFF334155)
                                      : const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: cat.color,
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
                                      color: isDark
                                          ? Colors.white
                                          : const Color(0xFF1E293B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Section 2: First Task
                    Text(
                      'First Task',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Empty State when no tasks added yet
                    if (_tasks.isEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.assignment_outlined,
                              size: 24,
                              color: subtitleColor,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'No Tasks Planned Yet',
                                    style: TextStyle(
                                      fontFamily: FocientTypographyTokens.fontFamily,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: titleColor,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Add your first priority task to establish your single-task focus schedule.',
                                    style: TextStyle(
                                      fontFamily: FocientTypographyTokens.fontFamily,
                                      fontSize: 12,
                                      color: subtitleColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Render Added Tasks (B)
                    if (_tasks.isNotEmpty) ...[
                      ..._tasks.asMap().entries.map((entry) {
                        final index = entry.key;
                        final task = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: FocientTaskAddedCard(
                            task: task,
                            onDelete: () => _removeTask(index),
                          ),
                        );
                      }),
                      const SizedBox(height: 4),
                    ],

                    // Render Add Task Card (A)
                    FocientAddTaskCard(
                      title: 'Add your Task',
                      onTap: _openCreateTaskSheet,
                    ),

                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(
                          color: Color(0xFFE11D48),
                          fontSize: 13,
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
