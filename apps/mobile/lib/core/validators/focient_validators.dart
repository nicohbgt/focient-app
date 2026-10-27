import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/focient_copywriting.dart';

/// Validation Result model for FoCient Form Validation
class ValidationResult {
  final bool isValid;
  final String? errorMessage;
  final bool isWarning;

  const ValidationResult({
    required this.isValid,
    this.errorMessage,
    this.isWarning = false,
  });

  static const ValidationResult valid = ValidationResult(isValid: true);

  factory ValidationResult.error(String message) =>
      ValidationResult(isValid: false, errorMessage: message, isWarning: false);

  factory ValidationResult.warning(String message) =>
      ValidationResult(isValid: true, errorMessage: message, isWarning: true);
}

/// FoCient Canonical Validation Engine (Client Contract)
///
/// Implements standard FoCient validation principles:
/// 1. Empathetic, guilt-free validation feedback (no punitive words).
/// 2. Format waktu mandiri: auto calculate endTime = startTime + durationMinutes.
/// 3. Tabular numbers constraints for all durations and hours.
class FocientValidators {
  static final RegExp uuidRegex = RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  );

  static final RegExp time24hRegex = RegExp(r'^([01]\d|2[0-3]):([0-5]\d)$');

  /// 1. Task Title: min 1 char, max 120 chars, trimmed.
  static ValidationResult validateTitle(
    String? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty || trimmed.length > 120) {
      return ValidationResult.error(copy.taskTitleValidation);
    }
    return ValidationResult.valid;
  }

  /// 2. Duration (Minutes): integer 5 to 480 mins.
  static ValidationResult validateDuration(
    int? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (value == null || value < 5 || value > 480) {
      return ValidationResult.error(copy.taskDurationValidation);
    }
    return ValidationResult.valid;
  }

  /// 3. CategoryId: active UUID pillar selection.
  static ValidationResult validateCategoryId(
    String? value, {
    List<String>? activeCategoryIds,
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (value == null || value.trim().isEmpty) {
      return ValidationResult.error(copy.taskCategoryValidation);
    }
    if (!uuidRegex.hasMatch(value)) {
      return ValidationResult.error(copy.taskCategoryValidation);
    }
    if (activeCategoryIds != null && !activeCategoryIds.contains(value)) {
      return ValidationResult.error(copy.taskCategoryValidation);
    }
    return ValidationResult.valid;
  }

  /// 4. Start Time: ISO 8601 string, must be within the same calendar day.
  static ValidationResult validateStartTime(
    String? value, {
    DateTime? taskDate,
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (value == null || value.trim().isEmpty) {
      return ValidationResult.valid; // Optional field
    }

    final parsed = DateTime.tryParse(value);
    if (parsed == null) {
      return ValidationResult.warning(copy.taskStartTimeValidation);
    }

    if (taskDate != null) {
      if (parsed.year != taskDate.year ||
          parsed.month != taskDate.month ||
          parsed.day != taskDate.day) {
        return ValidationResult.warning(copy.taskStartTimeValidation);
      }
    }

    return ValidationResult.valid;
  }

  /// 5. Priority Top-3 Quota: Maximum 3 active Top-3 tasks.
  static ValidationResult validateTop3Quota(
    TaskPriorityEnum desiredPriority,
    int currentActiveTop3Count, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (desiredPriority == TaskPriorityEnum.top3 && currentActiveTop3Count >= 3) {
      return ValidationResult.error(copy.taskTop3QuotaValidation);
    }
    return ValidationResult.valid;
  }

  /// 6. Work Hours Limit: 1 to 16 hours, step 0.5.
  static ValidationResult validateWorkHoursLimit(
    double? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (value == null || value < 1.0 || value > 16.0) {
      return ValidationResult.error(copy.workHoursLimitValidation);
    }
    // Verify 0.5 step (double value * 2 must be an integer)
    if ((value * 2) % 1 != 0) {
      return ValidationResult.error(copy.workHoursLimitValidation);
    }
    return ValidationResult.valid;
  }

  /// 7. Work Time Window: 24h format HH:mm, endWorkTime > startWorkTime.
  static ValidationResult validateWorkHoursRange(
    String? start,
    String? end, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (start == null || !time24hRegex.hasMatch(start)) {
      return ValidationResult.error(copy.workHoursFormatValidation);
    }
    if (end == null || !time24hRegex.hasMatch(end)) {
      return ValidationResult.error(copy.workHoursFormatValidation);
    }

    final startParts = start.split(':').map(int.parse).toList();
    final endParts = end.split(':').map(int.parse).toList();

    final startMins = startParts[0] * 60 + startParts[1];
    final endMins = endParts[0] * 60 + endParts[1];

    if (endMins <= startMins) {
      return ValidationResult.error(copy.workHoursRangeValidation);
    }

    return ValidationResult.valid;
  }

  /// 8. Selected Categories: minimum 1, maximum 5.
  static ValidationResult validateSelectedCategories(
    List<String> categories, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (categories.isEmpty) {
      return ValidationResult.error(copy.selectedCategoriesValidation);
    }
    if (categories.length > 5) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus awal.'
            : 'Up to 5 work categories to keep initial focus simple.',
      );
    }
    return ValidationResult.valid;
  }

  /// 9. Confirmed Start Time: Cannot be in the past for today's tasks.
  static ValidationResult validateConfirmedStartTime(
    DateTime? confirmedTime, {
    DateTime? now,
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final copy = FoCientCopywriting.of(language);
    if (confirmedTime == null) {
      return ValidationResult.error(copy.taskStartTimeValidation);
    }

    final referenceTime = now ?? DateTime.now();
    // 60-second grace buffer for mobile network jitter
    if (confirmedTime.isBefore(referenceTime.subtract(const Duration(seconds: 60)))) {
      return ValidationResult.warning(copy.confirmedStartTimeValidation);
    }

    return ValidationResult.valid;
  }

  /// 10. User Name: minimum 2 characters.
  static ValidationResult validateName(
    String? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.length < 2) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Nama minimal 2 karakter.'
            : 'Name should be at least 2 characters.',
      );
    }
    return ValidationResult.valid;
  }

  /// 11. Email Address: valid email format.
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );

  static ValidationResult validateEmail(
    String? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty || !emailRegex.hasMatch(trimmed)) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Format email belum pas. Masukkan alamat email yang aktif.'
            : 'Email format is not aligned. Please enter an active email.',
      );
    }
    return ValidationResult.valid;
  }

  /// 12. Password: min 8 characters, 1 uppercase, 1 lowercase, 1 number.
  static ValidationResult validatePassword(
    String? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final pass = value ?? '';
    if (pass.length < 8) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Kata sandi minimal 8 karakter untuk keamanan fokusmu.'
            : 'Password should be at least 8 characters.',
      );
    }
    final hasUpper = pass.contains(RegExp(r'[A-Z]'));
    final hasLower = pass.contains(RegExp(r'[a-z]'));
    final hasNumber = pass.contains(RegExp(r'[0-9]'));

    if (!hasUpper || !hasLower || !hasNumber) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Pastikan menyertakan 1 huruf besar, 1 huruf kecil, dan 1 angka.'
            : 'Make sure include 1 Uppercase, 1 Lowercase and 1 Number.',
      );
    }

    return ValidationResult.valid;
  }

  /// 13. OTP Code: 6 numeric digits.
  static final RegExp otpRegex = RegExp(r'^\d{6}$');

  static ValidationResult validateOtp(
    String? value, {
    FoCientLanguage language = FoCientLanguage.id,
  }) {
    final trimmed = value?.trim() ?? '';
    if (!otpRegex.hasMatch(trimmed)) {
      return ValidationResult.error(
        language == FoCientLanguage.id
            ? 'Masukkan 6 digit kode OTP yang valid.'
            : 'Enter a valid 6-digit OTP code.',
      );
    }
    return ValidationResult.valid;
  }

  /// Masks email for privacy (e.g. "johndoe@gmail.com" -> "j******@gmail.com").
  static String maskEmail(String email) {
    final atIndex = email.indexOf('@');
    if (atIndex <= 0) return email;
    final prefix = email.substring(0, atIndex);
    final domain = email.substring(atIndex); // includes '@'
    final firstChar = prefix[0];
    return '$firstChar******$domain';
  }

  /// Format Waktu Mandiri: Calculates endTime = startTime + durationMinutes.
  static DateTime calculateEndTime(DateTime startTime, int durationMinutes) {
    return startTime.add(Duration(minutes: durationMinutes));
  }
}
