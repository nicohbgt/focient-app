import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/auth_state.dart';
import '../../../data/workspace_category.dart';
import '../../primitive/focient_button.dart';
import '../../primitive/focient_input_field.dart';
import 'add_task_category_sheet.dart';

/// FoCient Onboarding Step 1: Personalize your Workspace Screen
///
/// Implements:
/// - Step indicator: "1 of 5 steps" with 20% progress bar
/// - Title & Subtitle: "Personalize your Workspace"
/// - Username field: to make the personal identity for dashboard & user privacy
/// - Occupancies: horizontal scrollable chips template switcher with active 'x'
/// - Task Category: dynamic classification list with colored dots + Add Category sheet
/// - Next CTA with validation
class FocientOnboardingWorkspaceScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final void Function(String username, String occupancy, List<WorkspaceCategory> categories)?
      onWorkspaceConfigured;
  final String? initialUsername;
  final String? initialOccupancy;
  final List<WorkspaceCategory>? initialCategories;

  const FocientOnboardingWorkspaceScreen({
    super.key,
    this.onBack,
    this.onNext,
    this.onWorkspaceConfigured,
    this.initialUsername,
    this.initialOccupancy,
    this.initialCategories,
  });

  @override
  ConsumerState<FocientOnboardingWorkspaceScreen> createState() =>
      _FocientOnboardingWorkspaceScreenState();
}

class _FocientOnboardingWorkspaceScreenState
    extends ConsumerState<FocientOnboardingWorkspaceScreen> {
  late final TextEditingController _usernameController;
  String? _selectedOccupancy;
  late List<WorkspaceCategory> _categories;

  String? _usernameError;
  String? _categoryError;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final currentUser = ref.read(authProvider).user;
    final usernameText = widget.initialUsername ??
        currentUser?.username ??
        currentUser?.name ??
        ref.read(authProvider).pendingName ??
        '';

    _usernameController = TextEditingController(text: usernameText);
    _selectedOccupancy = widget.initialOccupancy;

    if (widget.initialCategories != null) {
      _categories = List<WorkspaceCategory>.from(widget.initialCategories!);
    } else if (widget.initialOccupancy != null) {
      _categories = List<WorkspaceCategory>.from(
        kOccupancyCategoryTemplates[widget.initialOccupancy] ?? const [],
      );
    } else {
      _categories = [];
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    super.dispose();
  }

  void _onOccupancySelected(String occupancy) {
    setState(() {
      if (_selectedOccupancy == occupancy) {
        // Toggle off if already selected
        _selectedOccupancy = null;
      } else {
        _selectedOccupancy = occupancy;
        final template = kOccupancyCategoryTemplates[occupancy];
        if (template != null) {
          _categories = List<WorkspaceCategory>.from(template);
          _categoryError = null;
        }
      }
    });
  }

  Future<void> _openAddCategorySheet() async {
    if (_categories.length >= 5) {
      setState(() {
        _categoryError = 'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus.';
      });
      return;
    }

    final newCategory = await AddTaskCategorySheet.show(context);
    if (newCategory != null && mounted) {
      setState(() {
        _categories.add(newCategory);
        _categoryError = null;
      });
    }
  }

  void _removeCategory(int index) {
    setState(() {
      _categories.removeAt(index);
      if (_categories.isEmpty) {
        _categoryError = 'Select or add at least 1 category.';
      }
    });
  }

  Future<void> _onNextPressed() async {
    final username = _usernameController.text.trim();
    bool hasError = false;

    if (username.isEmpty || username.length < 2) {
      setState(() {
        _usernameError = 'Username must be at least 2 characters.';
      });
      hasError = true;
    }

    if (_categories.isEmpty) {
      setState(() {
        _categoryError = 'Select or add at least 1 category.';
      });
      hasError = true;
    }

    if (hasError) return;

    if (widget.onWorkspaceConfigured != null) {
      widget.onWorkspaceConfigured!(
        username,
        _selectedOccupancy ?? 'General',
        _categories,
      );
      widget.onNext?.call();
      return;
    }

    setState(() {
      _isSubmitting = true;
      _usernameError = null;
      _categoryError = null;
    });

    final success = await ref
        .read(authProvider.notifier)
        .completeWorkspaceOnboarding(
          username: username,
          occupancy: _selectedOccupancy ?? 'General',
          categories: _categories,
        );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        widget.onNext?.call();
      }
    }
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                        color: sectionLabelColor,
                        onPressed: widget.onBack ??
                            () {
                              ref.read(authProvider.notifier).logout();
                            },
                        tooltip: 'Back',
                      ),
                      const Spacer(),
                      Text(
                        '1 of 5 steps',
                        style: TextStyle(
                          fontFamily: FocientTypographyTokens.fontFamily,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: subtitleColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // 20% Linear Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: 0.2, // Step 1 of 5
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
                    const SizedBox(height: 8),
                    // Header Title
                    Text(
                      'Personalize your Workspace',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Subtitle
                    Text(
                      'enter your nickname and occupancies for setup your personal task categories',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: subtitleColor,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Section 1: Username
                    Text(
                      'Username',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    FocientInputField(
                      controller: _usernameController,
                      hintText: 'Enter your username here',
                      errorText: _usernameError,
                      isInvalid: _usernameError != null,
                      onChanged: (_) {
                        if (_usernameError != null) {
                          setState(() => _usernameError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 24),

                    // Section 2: Occupancies
                    Text(
                      'Occupancies',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: sectionLabelColor,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Horizontal scrollable chips
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      clipBehavior: Clip.none,
                      child: Row(
                        children: kOccupanciesList.map((occupancy) {
                          final isSelected = _selectedOccupancy == occupancy;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () => _onOccupancySelected(occupancy),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF2563EB)
                                      : (isDark
                                          ? const Color(0xFF1E293B)
                                          : const Color(0xFFEFF6FF)),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF2563EB)
                                        : const Color(0xFFBFDBFE),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      occupancy,
                                      style: TextStyle(
                                        fontFamily: FocientTypographyTokens.fontFamily,
                                        fontSize: 13,
                                        fontWeight: isSelected
                                            ? FontWeight.w600
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? Colors.white
                                            : const Color(0xFF2563EB),
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
                    const SizedBox(height: 28),

                    // Section 3: Task Category
                    Row(
                      children: [
                        Text(
                          'Task Category',
                          style: TextStyle(
                            fontFamily: FocientTypographyTokens.fontFamily,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: sectionLabelColor,
                          ),
                        ),
                        const Spacer(),
                        if (_categories.isNotEmpty)
                          Text(
                            '${_categories.length}/5',
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 12,
                              color: subtitleColor,
                            ),
                          ),
                      ],
                    ),
                    if (_categoryError != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        _categoryError!,
                        style: const TextStyle(
                          color: Color(0xFFE11D48),
                          fontSize: 12,
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    if (_categories.isEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.category_outlined,
                              size: 26,
                              color: subtitleColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'No Categories Configured',
                              style: TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: titleColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Select an occupancy above or tap + Add Category to configure your focus taxonomy.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: FocientTypographyTokens.fontFamily,
                                fontSize: 12,
                                color: subtitleColor,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                    // Category Chips Wrap
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ..._categories.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final cat = entry.value;
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
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
                                // Colored Dot Indicator
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
                                        ? FocientColorDarkTokens.neutralTextBold
                                        : const Color(0xFF1E293B),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                InkWell(
                                  onTap: () => _removeCategory(idx),
                                  child: Icon(
                                    Icons.close_rounded,
                                    size: 14,
                                    color: subtitleColor,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                        // "+ Add Category" button chip
                        InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: _openAddCategorySheet,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: const Color(0xFF93C5FD),
                                style: BorderStyle.solid,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.add_rounded,
                                  size: 16,
                                  color: Color(0xFF2563EB),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '+ Add Category',
                                  style: TextStyle(
                                    fontFamily: FocientTypographyTokens.fontFamily,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF2563EB),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
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
                  onPressed: _isSubmitting ? null : _onNextPressed,
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
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
