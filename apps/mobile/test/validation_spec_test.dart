import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:focient_mobile/data/task_state.dart';
import 'package:focient_mobile/presentation/focient_components.dart';

void main() {
  group('FoCient Mobile Validation Contract Specification Tests', () {
    test('1. Task Management: title validation (trimmed, 1 - 120 chars)', () {
      // Valid
      final valid = FocientValidators.validateTitle('Fokus Mendesain UI');
      expect(valid.isValid, isTrue);

      final trimmedValid = FocientValidators.validateTitle('   Pekerjaan Penting   ');
      expect(trimmedValid.isValid, isTrue);

      // Empty or whitespace
      final empty = FocientValidators.validateTitle('');
      expect(empty.isValid, isFalse);
      expect(empty.errorMessage, 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.');

      final whitespace = FocientValidators.validateTitle('    ');
      expect(whitespace.isValid, isFalse);
      expect(whitespace.errorMessage, 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.');

      // Exceeds 120 chars
      final long = FocientValidators.validateTitle('A' * 121);
      expect(long.isValid, isFalse);
      expect(long.errorMessage, 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.');
    });

    test('2. Task Management: durationMinutes validation (5 - 480 mins)', () {
      expect(FocientValidators.validateDuration(5).isValid, isTrue);
      expect(FocientValidators.validateDuration(45).isValid, isTrue);
      expect(FocientValidators.validateDuration(480).isValid, isTrue);

      // Below 5
      final below = FocientValidators.validateDuration(4);
      expect(below.isValid, isFalse);
      expect(below.errorMessage, 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).');

      // Above 480
      final above = FocientValidators.validateDuration(481);
      expect(above.isValid, isFalse);
      expect(above.errorMessage, 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).');

      // Null
      final nullDur = FocientValidators.validateDuration(null);
      expect(nullDur.isValid, isFalse);
      expect(nullDur.errorMessage, 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).');
    });

    test('3. Task Management: categoryId UUID validation', () {
      const validUuid = '11111111-1111-4111-8111-111111111111';
      final activeList = [validUuid];

      expect(
        FocientValidators.validateCategoryId(validUuid, activeCategoryIds: activeList).isValid,
        isTrue,
      );

      // Invalid format
      final invalidFormat = FocientValidators.validateCategoryId('not-uuid', activeCategoryIds: activeList);
      expect(invalidFormat.isValid, isFalse);
      expect(invalidFormat.errorMessage, 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.');

      // Inactive / missing from user categories
      const missingUuid = '99999999-9999-4999-8999-999999999999';
      final inactive = FocientValidators.validateCategoryId(missingUuid, activeCategoryIds: activeList);
      expect(inactive.isValid, isFalse);
      expect(inactive.errorMessage, 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.');
    });

    test('4. Task Management: startTime ISO 8601 & same-day validation', () {
      final taskDate = DateTime(2026, 10, 23);
      final sameDayIso = '2026-10-23T09:00:00.000Z';

      expect(
        FocientValidators.validateStartTime(sameDayIso, taskDate: taskDate).isValid,
        isTrue,
      );

      // Invalid format
      final invalidFormat = FocientValidators.validateStartTime('jam sembilan', taskDate: taskDate);
      expect(invalidFormat.isWarning, isTrue);
      expect(invalidFormat.errorMessage, 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.');

      // Different day
      final differentDayIso = '2026-10-24T09:00:00.000Z';
      final diffResult = FocientValidators.validateStartTime(differentDayIso, taskDate: taskDate);
      expect(diffResult.isWarning, isTrue);
      expect(diffResult.errorMessage, 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.');
    });

    test('5. Task Management: priority enum & Top 3 quota check', () {
      // If 2 active Top 3 tasks, user can pick Top 3
      final canAdd = FocientValidators.validateTop3Quota(TaskPriorityEnum.top3, 2);
      expect(canAdd.isValid, isTrue);

      // If 3 active Top 3 tasks, quota is full
      final full = FocientValidators.validateTop3Quota(TaskPriorityEnum.top3, 3);
      expect(full.isValid, isFalse);
      expect(
        full.errorMessage,
        '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.',
      );

      // Regular priority is always allowed even if Top 3 quota is full
      final regular = FocientValidators.validateTop3Quota(TaskPriorityEnum.normal, 3);
      expect(regular.isValid, isTrue);
    });

    test('6. Format Waktu Mandiri: calculateEndTime = startTime + duration', () {
      final start = DateTime(2026, 10, 23, 9, 0);
      final end = FocientValidators.calculateEndTime(start, 45);

      expect(end, DateTime(2026, 10, 23, 9, 45));
    });

    test('7. Onboarding / Setup: workHoursLimit rules (1 - 16 hrs, 0.5 step)', () {
      expect(FocientValidators.validateWorkHoursLimit(8.0).isValid, isTrue);
      expect(FocientValidators.validateWorkHoursLimit(7.5).isValid, isTrue);
      expect(FocientValidators.validateWorkHoursLimit(1.0).isValid, isTrue);
      expect(FocientValidators.validateWorkHoursLimit(16.0).isValid, isTrue);

      // Below 1
      final below = FocientValidators.validateWorkHoursLimit(0.5);
      expect(below.isValid, isFalse);
      expect(below.errorMessage, 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.');

      // Above 16
      final above = FocientValidators.validateWorkHoursLimit(17.0);
      expect(above.isValid, isFalse);
      expect(above.errorMessage, 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.');

      // Invalid step (not 0.5)
      final invalidStep = FocientValidators.validateWorkHoursLimit(6.3);
      expect(invalidStep.isValid, isFalse);
      expect(invalidStep.errorMessage, 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.');
    });

    test('8. Onboarding / Setup: startWorkTime & endWorkTime range validation', () {
      expect(FocientValidators.validateWorkHoursRange('09:00', '17:00').isValid, isTrue);

      // Format error
      final badFormat = FocientValidators.validateWorkHoursRange('9:00', '17:00');
      expect(badFormat.isValid, isFalse);
      expect(badFormat.errorMessage, 'Format waktu belum pas. Gunakan format 24 jam HH:mm (contoh: 09:00).');

      // Inverted range
      final inverted = FocientValidators.validateWorkHoursRange('17:00', '09:00');
      expect(inverted.isValid, isFalse);
      expect(inverted.errorMessage, 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.');

      // Equal times
      final equalTimes = FocientValidators.validateWorkHoursRange('09:00', '09:00');
      expect(equalTimes.isValid, isFalse);
      expect(equalTimes.errorMessage, 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.');
    });

    test('9. Onboarding / Setup: selectedCategories (1 to 5 categories)', () {
      expect(FocientValidators.validateSelectedCategories(['P1']).isValid, isTrue);
      expect(FocientValidators.validateSelectedCategories(['P1', 'P2', 'P3', 'P4', 'P5']).isValid, isTrue);

      // Empty
      final empty = FocientValidators.validateSelectedCategories([]);
      expect(empty.isValid, isFalse);
      expect(empty.errorMessage, 'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.');

      // More than 5
      final overMax = FocientValidators.validateSelectedCategories(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
      expect(overMax.isValid, isFalse);
      expect(overMax.errorMessage, 'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus awal.');
    });

    test('10. Adaptive Scheduling: confirmedStartTime past-time slot guard', () {
      final now = DateTime.now();

      // Future time
      final future = now.add(const Duration(hours: 1));
      expect(FocientValidators.validateConfirmedStartTime(future, now: now).isValid, isTrue);

      // Past time (2 hours ago)
      final past = now.subtract(const Duration(hours: 2));
      final pastResult = FocientValidators.validateConfirmedStartTime(past, now: now);
      expect(pastResult.isWarning, isTrue);
      expect(pastResult.errorMessage, 'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.');
    });

    test('11. Guilt-Free Vocabulary check in Mobile Indonesian & English', () {
      const punitiveWords = [
        'terlambat',
        'telat',
        'late',
        'overdue',
        'gagal',
        'failed',
        'hukuman',
        'penalty',
      ];

      final idCopy = FoCientCopywriting.of(FoCientLanguage.id);
      final enCopy = FoCientCopywriting.of(FoCientLanguage.en);

      final messagesToCheck = [
        idCopy.taskTitleValidation,
        idCopy.taskDurationValidation,
        idCopy.taskCategoryValidation,
        idCopy.taskStartTimeValidation,
        idCopy.taskTop3QuotaValidation,
        idCopy.workHoursLimitValidation,
        idCopy.workHoursRangeValidation,
        idCopy.workHoursFormatValidation,
        idCopy.selectedCategoriesValidation,
        idCopy.confirmedStartTimeValidation,
        idCopy.endTimeCalculatedNotice,
        enCopy.taskTitleValidation,
        enCopy.taskDurationValidation,
        enCopy.taskCategoryValidation,
        enCopy.taskStartTimeValidation,
        enCopy.taskTop3QuotaValidation,
        enCopy.workHoursLimitValidation,
        enCopy.workHoursRangeValidation,
        enCopy.workHoursFormatValidation,
        enCopy.selectedCategoriesValidation,
        enCopy.confirmedStartTimeValidation,
        enCopy.endTimeCalculatedNotice,
      ];

      for (final msg in messagesToCheck) {
        for (final word in punitiveWords) {
          final regex = RegExp('\\b$word\\b', caseSensitive: false);
          expect(
            regex.hasMatch(msg),
            isFalse,
            reason: 'Message "$msg" must not contain punitive word "$word"',
          );
        }
      }
    });

    testWidgets('12. Widget Test: FocientTaskValidationForm renders and validates', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: FocientTaskValidationForm(
                currentActiveTop3Count: 3,
              ),
            ),
          ),
        ),
      );

      // Verifies title label and duration field
      expect(find.text('Entri Tugas Linimasa'), findsOneWidget);
      expect(find.text('Judul Tugas'), findsOneWidget);
      expect(find.text('Estimasi Durasi (5 - 480 menit)'), findsOneWidget);
      expect(find.text('Pilar Kategori'), findsOneWidget);
    });
  });
}
