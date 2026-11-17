import 'package:flutter/material.dart';

enum FocusType {
  light,
  medium,
  deepFocus,
}

extension FocusTypeExtension on FocusType {
  String get label {
    switch (this) {
      case FocusType.light:
        return 'Light';
      case FocusType.medium:
        return 'Medium';
      case FocusType.deepFocus:
        return 'Deep Focus';
    }
  }

  Color get backgroundColor {
    switch (this) {
      case FocusType.light:
        return const Color(0xFFECFDF5);
      case FocusType.medium:
        return const Color(0xFFFEF3C7);
      case FocusType.deepFocus:
        return const Color(0xFFFFE4E6);
    }
  }

  Color get textColor {
    switch (this) {
      case FocusType.light:
        return const Color(0xFF065F46);
      case FocusType.medium:
        return const Color(0xFF92400E);
      case FocusType.deepFocus:
        return const Color(0xFF9F1239);
    }
  }

  Color get borderColor {
    switch (this) {
      case FocusType.light:
        return const Color(0xFF10B981);
      case FocusType.medium:
        return const Color(0xFFF59E0B);
      case FocusType.deepFocus:
        return const Color(0xFFF43F5E);
    }
  }

  static FocusType fromString(String? val) {
    if (val == null) return FocusType.medium;
    final lower = val.toLowerCase();
    if (lower.contains('light')) return FocusType.light;
    if (lower.contains('deep')) return FocusType.deepFocus;
    return FocusType.medium;
  }
}

class WorkspaceCategory {
  final String id;
  final String name;
  final Color color;
  final String colorHex;
  final FocusType focusType;
  final bool isDefault;

  const WorkspaceCategory({
    required this.name,
    required this.color,
    required this.colorHex,
    this.id = '',
    this.focusType = FocusType.medium,
    this.isDefault = true,
  });

  WorkspaceCategory copyWith({
    String? id,
    String? name,
    Color? color,
    String? colorHex,
    FocusType? focusType,
    bool? isDefault,
  }) {
    return WorkspaceCategory(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      colorHex: colorHex ?? this.colorHex,
      focusType: focusType ?? this.focusType,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'colorHex': colorHex,
        'focusType': focusType.label,
        'isDefault': isDefault,
      };

  factory WorkspaceCategory.fromJson(Map<String, dynamic> json) {
    final hex = json['colorHex'] as String? ?? '#2563EB';
    return WorkspaceCategory(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      colorHex: hex,
      color: colorFromHex(hex),
      focusType: FocusTypeExtension.fromString(json['focusType'] as String?),
      isDefault: json['isDefault'] as bool? ?? true,
    );
  }

  static Color colorFromHex(String hex) {
    final clean = hex.replaceAll('#', '');
    if (clean.length == 6) {
      return Color(int.parse('FF$clean', radix: 16));
    }
    return const Color(0xFF2563EB);
  }

  static String colorToHex(Color color) {
    return '#${color.toARGB32().toRadixString(16).substring(2).toUpperCase()}';
  }
}

/// 10 standard category swatch colors from mobile design specifications
const List<Color> kCategoryColorSwatches = [
  Color(0xFF2563EB), // Cobalt Blue
  Color(0xFF1E40AF), // Deep Navy
  Color(0xFF0D9488), // Teal
  Color(0xFF065F46), // Forest Green
  Color(0xFF7C3AED), // Purple
  Color(0xFF5B21B6), // Indigo
  Color(0xFF94A3B8), // Slate
  Color(0xFF64748B), // Steel Slate
  Color(0xFFB45309), // Amber / Warm Brown
  Color(0xFFE11D48), // Crimson / Rose
];

/// Canonical Occupancies list
const List<String> kOccupanciesList = [
  'General',
  'Entrepreneur',
  'Professional',
  'Freelancer',
  'Student',
  'Creator',
];

/// Pre-configured Category templates per occupancy
final Map<String, List<WorkspaceCategory>> kOccupancyCategoryTemplates = {
  'General': const [
    WorkspaceCategory(
      name: 'Personal',
      color: Color(0xFF2563EB),
      colorHex: '#2563EB',
      focusType: FocusType.light,
    ),
    WorkspaceCategory(
      name: 'Deep Work',
      color: Color(0xFF64748B),
      colorHex: '#64748B',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Communication',
      color: Color(0xFF0284C7),
      colorHex: '#0284C7',
      focusType: FocusType.medium,
    ),
  ],
  'Entrepreneur': const [
    WorkspaceCategory(
      name: 'Strategic',
      color: Color(0xFF7C3AED),
      colorHex: '#7C3AED',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Execution',
      color: Color(0xFF0284C7),
      colorHex: '#0284C7',
      focusType: FocusType.medium,
    ),
    WorkspaceCategory(
      name: 'Meeting',
      color: Color(0xFFB45309),
      colorHex: '#B45309',
      focusType: FocusType.light,
    ),
  ],
  'Professional': const [
    WorkspaceCategory(
      name: 'Core Work',
      color: Color(0xFF1E40AF),
      colorHex: '#1E40AF',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Collaboration',
      color: Color(0xFF0D9488),
      colorHex: '#0D9488',
      focusType: FocusType.medium,
    ),
    WorkspaceCategory(
      name: 'Administration',
      color: Color(0xFF64748B),
      colorHex: '#64748B',
      focusType: FocusType.light,
    ),
  ],
  'Freelancer': const [
    WorkspaceCategory(
      name: 'Client Projects',
      color: Color(0xFF2563EB),
      colorHex: '#2563EB',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Business & Pitching',
      color: Color(0xFF7C3AED),
      colorHex: '#7C3AED',
      focusType: FocusType.medium,
    ),
    WorkspaceCategory(
      name: 'Invoicing',
      color: Color(0xFFB45309),
      colorHex: '#B45309',
      focusType: FocusType.light,
    ),
  ],
  'Student': const [
    WorkspaceCategory(
      name: 'Study & Class',
      color: Color(0xFF2563EB),
      colorHex: '#2563EB',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Assignments',
      color: Color(0xFF0D9488),
      colorHex: '#0D9488',
      focusType: FocusType.medium,
    ),
    WorkspaceCategory(
      name: 'Self-Care',
      color: Color(0xFF065F46),
      colorHex: '#065F46',
      focusType: FocusType.light,
    ),
  ],
  'Creator': const [
    WorkspaceCategory(
      name: 'Content Creation',
      color: Color(0xFF7C3AED),
      colorHex: '#7C3AED',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Production',
      color: Color(0xFFE11D48),
      colorHex: '#E11D48',
      focusType: FocusType.deepFocus,
    ),
    WorkspaceCategory(
      name: 'Community',
      color: Color(0xFF0284C7),
      colorHex: '#0284C7',
      focusType: FocusType.light,
    ),
  ],
};
