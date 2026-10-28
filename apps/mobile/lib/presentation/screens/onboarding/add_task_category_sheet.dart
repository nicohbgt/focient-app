import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../../data/workspace_category.dart';
import '../../primitive/focient_input_field.dart';

/// FoCient Add Task Category Bottom Sheet Modal
///
/// Matches the design specs:
/// - Category Name textfield
/// - 10-swatch Label Color selector
/// - 3-state Focus Type selector (Light, Medium, Deep Focus with calendar icons)
/// - Red Cancel button & Green Confirm button
class AddTaskCategorySheet extends StatefulWidget {
  final WorkspaceCategory? initialCategory;
  final ValueChanged<WorkspaceCategory>? onCategoryConfirmed;

  const AddTaskCategorySheet({
    super.key,
    this.initialCategory,
    this.onCategoryConfirmed,
  });

  static Future<WorkspaceCategory?> show(
    BuildContext context, {
    WorkspaceCategory? initialCategory,
  }) {
    return showModalBottomSheet<WorkspaceCategory>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddTaskCategorySheet(initialCategory: initialCategory),
    );
  }

  @override
  State<AddTaskCategorySheet> createState() => _AddTaskCategorySheetState();
}

class _AddTaskCategorySheetState extends State<AddTaskCategorySheet> {
  late final TextEditingController _nameController;
  late Color _selectedColor;
  late FocusType _selectedFocusType;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialCategory?.name ?? '');
    _selectedColor = widget.initialCategory?.color ?? kCategoryColorSwatches.first;
    _selectedFocusType = widget.initialCategory?.focusType ?? FocusType.medium;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _onConfirm() {
    final text = _nameController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _errorMessage = 'Category name cannot be empty';
      });
      return;
    }

    final category = WorkspaceCategory(
      id: widget.initialCategory?.id ?? 'cat_${DateTime.now().millisecondsSinceEpoch}',
      name: text,
      color: _selectedColor,
      colorHex: WorkspaceCategory.colorToHex(_selectedColor),
      focusType: _selectedFocusType,
      isDefault: false,
    );

    widget.onCategoryConfirmed?.call(category);
    Navigator.of(context).pop(category);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sheetBg = isDark
        ? FocientColorDarkTokens.neutralSurfaceCard
        : Colors.white;

    final labelColor = isDark
        ? FocientColorDarkTokens.neutralTextBold
        : const Color(0xFF0F172A);

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
            const SizedBox(height: 20),

            // 1. Category Name
            Text(
              'Category Name',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 8),
            FocientInputField(
              controller: _nameController,
              hintText: 'Enter category name',
              errorText: _errorMessage,
              isInvalid: _errorMessage != null,
              onChanged: (_) {
                if (_errorMessage != null) {
                  setState(() => _errorMessage = null);
                }
              },
            ),
            const SizedBox(height: 20),

            // 2. Label Color
            Text(
              'Label Color',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: kCategoryColorSwatches.map((color) {
                final isSelected = color.toARGB32() == _selectedColor.toARGB32();
                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedColor = color);
                  },
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? Colors.white : Colors.transparent,
                        width: 2.5,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: color.withValues(alpha: 0.6),
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                    alignment: Alignment.center,
                    child: isSelected
                        ? const Icon(
                            Icons.check_rounded,
                            size: 18,
                            color: Colors.white,
                          )
                        : null,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // 3. Focus Type
            Text(
              'Focus Type',
              style: TextStyle(
                fontFamily: FocientTypographyTokens.fontFamily,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: FocusType.values.map((type) {
                final isSelected = _selectedFocusType == type;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        setState(() => _selectedFocusType = type);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                        decoration: BoxDecoration(
                          color: type.backgroundColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? type.borderColor : type.borderColor.withValues(alpha: 0.35),
                            width: isSelected ? 2.0 : 1.0,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.calendar_today_outlined,
                              size: 14,
                              color: type.textColor,
                            ),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                type.label,
                                style: TextStyle(
                                  fontFamily: FocientTypographyTokens.fontFamily,
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                  color: type.textColor,
                                ),
                                overflow: TextOverflow.ellipsis,
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
            const SizedBox(height: 32),

            // 4. Action Buttons (Cancel Red, Confirm Green)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444), // Crimson Red
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
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
                      backgroundColor: const Color(0xFF059669), // Emerald Green
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'Confirm',
                      style: TextStyle(
                        fontFamily: FocientTypographyTokens.fontFamily,
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
