import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CreateTaskSchema,
  OnboardingSetupSchema,
  AdaptiveScheduleConfirmSchema,
  checkTop3Quota,
  checkSameDayStartTime,
  VALIDATION_MESSAGES,
} from '../../../packages/contracts/src/schemas.ts';

import {
  calculateEndTime,
} from '../../../packages/contracts/src/dtos.ts';

import {
  idCopywriting,
  enCopywriting,
  dictionaries,
} from '../src/components/i18n/copywriting.ts';
import {
  isTimeOverlappingQuietHours,
  calculateQuietHoursDuration,
} from '../src/lib/date-utils.ts';
import { getAvatarInitial } from '../src/lib/utils.ts';

test('FoCient Validation Contract Specification Suite', async (t) => {
  await t.test('1. Task Management: title validation rules & empathetic message', () => {
    // Valid titles
    assert.ok(CreateTaskSchema.safeParse({ title: 'Tugas Utama', durationMinutes: 30 }).success);
    assert.ok(CreateTaskSchema.safeParse({ title: '   Spasi Terpangkas   ', durationMinutes: 30 }).success);

    // Empty or whitespace only
    const emptyResult = CreateTaskSchema.safeParse({ title: '', durationMinutes: 30 });
    assert.strictEqual(emptyResult.success, false);
    if (!emptyResult.success) {
      assert.strictEqual(
        emptyResult.error.issues[0].message,
        'Beri nama tugas singkat agar fokus kerjamu lebih terarah.'
      );
    }

    const whitespaceResult = CreateTaskSchema.safeParse({ title: '   ', durationMinutes: 30 });
    assert.strictEqual(whitespaceResult.success, false);
    if (!whitespaceResult.success) {
      assert.strictEqual(
        whitespaceResult.error.issues[0].message,
        'Beri nama tugas singkat agar fokus kerjamu lebih terarah.'
      );
    }

    // Exceeds 120 characters
    const longTitle = 'A'.repeat(121);
    const longResult = CreateTaskSchema.safeParse({ title: longTitle, durationMinutes: 30 });
    assert.strictEqual(longResult.success, false);
    if (!longResult.success) {
      assert.strictEqual(
        longResult.error.issues[0].message,
        'Beri nama tugas singkat agar fokus kerjamu lebih terarah.'
      );
    }
  });

  await t.test('2. Task Management: durationMinutes rules & tabular figures constraint', () => {
    // Valid durations (5 to 480 mins)
    assert.ok(CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 5 }).success);
    assert.ok(CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30 }).success);
    assert.ok(CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 480 }).success);

    // Below 5 minutes
    const belowResult = CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 4 });
    assert.strictEqual(belowResult.success, false);
    if (!belowResult.success) {
      assert.strictEqual(
        belowResult.error.issues[0].message,
        'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).'
      );
    }

    // Above 480 minutes
    const aboveResult = CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 481 });
    assert.strictEqual(aboveResult.success, false);
    if (!aboveResult.success) {
      assert.strictEqual(
        aboveResult.error.issues[0].message,
        'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).'
      );
    }

    // Non-integer
    const floatResult = CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30.5 });
    assert.strictEqual(floatResult.success, false);
    if (!floatResult.success) {
      assert.strictEqual(
        floatResult.error.issues[0].message,
        'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).'
      );
    }
  });

  await t.test('3. Task Management: categoryId UUID validation & helper alert', () => {
    // Valid UUID
    const validUuid = '11111111-1111-4111-8111-111111111111';
    assert.ok(CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30, categoryId: validUuid }).success);

    // Invalid non-UUID string
    const invalidUuidResult = CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30, categoryId: 'not-a-uuid' });
    assert.strictEqual(invalidUuidResult.success, false);
    if (!invalidUuidResult.success) {
      assert.strictEqual(
        invalidUuidResult.error.issues[0].message,
        'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.'
      );
    }
  });

  await t.test('4. Task Management: startTime ISO 8601 & same-day validation', () => {
    // Valid ISO 8601
    const validIso = '2026-10-23T09:00:00.000Z';
    assert.ok(CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30, startTime: validIso }).success);

    // Invalid ISO 8601 format
    const invalidFormatResult = CreateTaskSchema.safeParse({ title: 'Valid', durationMinutes: 30, startTime: '09:00 pagi' });
    assert.strictEqual(invalidFormatResult.success, false);
    if (!invalidFormatResult.success) {
      assert.strictEqual(
        invalidFormatResult.error.issues[0].message,
        'Format jam mulai belum pas. Pilih slot waktu yang tersedia.'
      );
    }

    // Same-day check
    const sameDay = checkSameDayStartTime(validIso, '2026-10-23');
    assert.strictEqual(sameDay.isValid, true);

    const differentDay = checkSameDayStartTime(validIso, '2026-10-24');
    assert.strictEqual(differentDay.isValid, false);
    assert.strictEqual(differentDay.message, 'Format jam mulai belum pas. Pilih slot waktu dalam hari yang sama.');
  });

  await t.test('5. Task Management: priority enum & Top 3 quota guard (max 3 active tasks)', () => {
    // Default is REGULAR
    const parsedDefault = CreateTaskSchema.parse({ title: 'Task', durationMinutes: 30 });
    assert.strictEqual(parsedDefault.priority, 'REGULAR');

    // Quota check with 2 existing Top 3 tasks -> Can add 1 more
    const currentTasks = [
      { id: '1', priority: 'TOP_3', status: 'TODO' },
      { id: '2', priority: 'TOP_3', status: 'IN_PROGRESS' },
      { id: '3', priority: 'REGULAR', status: 'TODO' },
    ];
    const canAddResult = checkTop3Quota('TOP_3', currentTasks);
    assert.strictEqual(canAddResult.isValid, true);
    assert.strictEqual(canAddResult.activeTop3Count, 2);

    // Quota check with 3 existing Top 3 tasks -> Quota is full
    const fullTasks = [
      ...currentTasks,
      { id: '4', priority: 'TOP_3', status: 'TODO' },
    ];
    const fullResult = checkTop3Quota('TOP_3', fullTasks);
    assert.strictEqual(fullResult.isValid, false);
    assert.strictEqual(
      fullResult.message,
      '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.'
    );

    // When an existing Top 3 task is completed, it frees up quota
    const tasksWithCompleted = [
      { id: '1', priority: 'TOP_3', status: 'COMPLETED' },
      { id: '2', priority: 'TOP_3', status: 'TODO' },
      { id: '3', priority: 'TOP_3', status: 'TODO' },
    ];
    const freedResult = checkTop3Quota('TOP_3', tasksWithCompleted);
    assert.strictEqual(freedResult.isValid, true);
    assert.strictEqual(freedResult.activeTop3Count, 2);
  });

  await t.test('6. Format Waktu Mandiri: endTime is automatically calculated (endTime = startTime + duration)', () => {
    const startIso = '2026-10-23T09:00:00.000Z';
    const duration = 45; // 45 minutes

    const calculatedEnd = calculateEndTime(startIso, duration);
    const expectedEnd = new Date(new Date(startIso).getTime() + 45 * 60000).toISOString();

    assert.strictEqual(calculatedEnd, expectedEnd);
    assert.strictEqual(calculatedEnd, '2026-10-23T09:45:00.000Z');
  });

  await t.test('7. Onboarding / Setup: workHoursLimit rules (1 - 16 hours, 0.5 step)', () => {
    const base = {
      startWorkTime: '09:00',
      endWorkTime: '17:00',
      selectedCategories: ['Pekerjaan Inti'],
    };

    // Valid limits
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 8 }).success);
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 7.5 }).success);
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 1 }).success);
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 16 }).success);

    // Below 1 hour
    const belowResult = OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 0.5 });
    assert.strictEqual(belowResult.success, false);
    if (!belowResult.success) {
      assert.strictEqual(
        belowResult.error.issues[0].message,
        'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.'
      );
    }

    // Above 16 hours
    const aboveResult = OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 17 });
    assert.strictEqual(aboveResult.success, false);
    if (!aboveResult.success) {
      assert.strictEqual(
        aboveResult.error.issues[0].message,
        'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.'
      );
    }

    // Invalid step (not 0.5)
    const invalidStepResult = OnboardingSetupSchema.safeParse({ ...base, workHoursLimit: 6.3 });
    assert.strictEqual(invalidStepResult.success, false);
    if (!invalidStepResult.success) {
      assert.strictEqual(
        invalidStepResult.error.issues[0].message,
        'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.'
      );
    }
  });

  await t.test('8. Onboarding / Setup: startWorkTime & endWorkTime format and range validation', () => {
    const base = {
      workHoursLimit: 8,
      selectedCategories: ['Pekerjaan Inti'],
    };

    // Valid 24h format and range
    assert.ok(
      OnboardingSetupSchema.safeParse({
        ...base,
        startWorkTime: '08:30',
        endWorkTime: '17:00',
      }).success
    );

    // Invalid format (e.g. 12-hour AM/PM or non-matching)
    const invalidFormat = OnboardingSetupSchema.safeParse({
      ...base,
      startWorkTime: '8:30 AM',
      endWorkTime: '17:00',
    });
    assert.strictEqual(invalidFormat.success, false);
    if (!invalidFormat.success) {
      assert.strictEqual(
        invalidFormat.error.issues[0].message,
        'Format waktu belum pas. Gunakan format 24 jam HH:mm (contoh: 09:00).'
      );
    }

    // endWorkTime earlier than startWorkTime
    const invertedRange = OnboardingSetupSchema.safeParse({
      ...base,
      startWorkTime: '17:00',
      endWorkTime: '09:00',
    });
    assert.strictEqual(invertedRange.success, false);
    if (!invertedRange.success) {
      assert.strictEqual(
        invertedRange.error.issues[0].message,
        'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.'
      );
    }

    // Equal times
    const equalTimes = OnboardingSetupSchema.safeParse({
      ...base,
      startWorkTime: '09:00',
      endWorkTime: '09:00',
    });
    assert.strictEqual(equalTimes.success, false);
    if (!equalTimes.success) {
      assert.strictEqual(
        equalTimes.error.issues[0].message,
        'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.'
      );
    }
  });

  await t.test('9. Onboarding / Setup: selectedCategories minimum 1 and maximum 5', () => {
    const base = {
      workHoursLimit: 8,
      startWorkTime: '09:00',
      endWorkTime: '17:00',
    };

    // Valid: 1 to 5 categories
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, selectedCategories: ['P1'] }).success);
    assert.ok(OnboardingSetupSchema.safeParse({ ...base, selectedCategories: ['P1', 'P2', 'P3', 'P4', 'P5'] }).success);

    // Empty categories array
    const emptyResult = OnboardingSetupSchema.safeParse({ ...base, selectedCategories: [] });
    assert.strictEqual(emptyResult.success, false);
    if (!emptyResult.success) {
      assert.strictEqual(
        emptyResult.error.issues[0].message,
        'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.'
      );
    }

    // More than 5 categories
    const overMaxResult = OnboardingSetupSchema.safeParse({
      ...base,
      selectedCategories: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    });
    assert.strictEqual(overMaxResult.success, false);
    if (!overMaxResult.success) {
      assert.strictEqual(
        overMaxResult.error.issues[0].message,
        'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus awal.'
      );
    }
  });

  await t.test('10. Adaptive Scheduling: confirmedStartTime past-time slot guard', () => {
    const validUuid = '11111111-1111-4111-8111-111111111111';

    // Future time is valid
    const futureIso = new Date(Date.now() + 3600000).toISOString();
    assert.ok(
      AdaptiveScheduleConfirmSchema.safeParse({
        taskId: validUuid,
        confirmedStartTime: futureIso,
      }).success
    );

    // Past time (e.g. 2 hours ago) should trigger empathetic error
    const pastIso = new Date(Date.now() - 7200000).toISOString();
    const pastResult = AdaptiveScheduleConfirmSchema.safeParse({
      taskId: validUuid,
      confirmedStartTime: pastIso,
    });
    assert.strictEqual(pastResult.success, false);
    if (!pastResult.success) {
      assert.strictEqual(
        pastResult.error.issues[0].message,
        'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.'
      );
    }
  });

  await t.test('11. Guilt-Free & Empathetic Feedback: zero punitive words in validation texts', () => {
    const punitiveWords = [
      'terlambat',
      'telat',
      'late',
      'overdue',
      'gagal',
      'failed',
      'hukuman',
      'penalty',
      'salah!',
    ];

    for (const [lang, msgs] of Object.entries(VALIDATION_MESSAGES)) {
      for (const [key, msg] of Object.entries(msgs)) {
        for (const word of punitiveWords) {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          assert.ok(
            !regex.test(msg),
            `Violation: Validation message ${lang}.${key} contains punitive word "${word}" in "${msg}"`
          );
        }
      }
    }

    // Verify presence of all 9 specification validation messages in copywriting dictionary
    assert.equal(idCopywriting.validations.taskTitle, 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.');
    assert.equal(idCopywriting.validations.taskDuration, 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).');
    assert.equal(idCopywriting.validations.taskCategory, 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.');
    assert.equal(idCopywriting.validations.taskStartTime, 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.');
    assert.equal(idCopywriting.validations.taskTop3Quota, '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.');
    assert.equal(idCopywriting.validations.workHoursLimit, 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.');
    assert.equal(idCopywriting.validations.workHoursRange, 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.');
    assert.equal(idCopywriting.validations.selectedCategories, 'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.');
    assert.equal(idCopywriting.validations.confirmedStartTime, 'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.');

    assert.equal(enCopywriting.validations.taskTitle, 'Give your task a short title to guide your focus.');
    assert.equal(enCopywriting.validations.taskDuration, 'Set a duration between 5 and 480 minutes (e.g., 30m or 45m).');
    assert.equal(enCopywriting.validations.taskCategory, 'Select a category pillar to keep your focus organized.');
    assert.equal(enCopywriting.validations.taskStartTime, 'Start time format is not quite right. Select an available time slot.');
    assert.equal(enCopywriting.validations.taskTop3Quota, 'The 3 main focus tasks are full. Complete one first or switch priority.');
    assert.equal(enCopywriting.validations.workHoursLimit, 'Set a realistic daily work hour limit between 1 and 16 hours.');
    assert.equal(enCopywriting.validations.workHoursRange, 'Work hour range is not aligned. Make sure end time is after start time.');
    assert.equal(enCopywriting.validations.selectedCategories, 'Select at least one work category to start your first plan.');
    assert.equal(enCopywriting.validations.confirmedStartTime, 'This time slot has already passed. Choose the current time or the next available slot.');
  });

  await t.test('12. Quiet Hours Contract: Prevents scheduling tasks overlapping quiet hours & calculates duration', () => {
    // 1. Duration calculation
    assert.equal(calculateQuietHoursDuration('12:00', '13:00'), '1');
    assert.equal(calculateQuietHoursDuration('12:00', '13:30'), '1.5');
    assert.equal(calculateQuietHoursDuration('21:00', '06:00'), '9'); // overnight
    assert.equal(calculateQuietHoursDuration('00:00', '00:00'), null); // empty
    assert.equal(calculateQuietHoursDuration('21:00', '00:00'), null); // unconfigured end time returns null
    assert.equal(calculateQuietHoursDuration('00:00', '06:00'), null); // unconfigured start time returns null
    assert.equal(calculateQuietHoursDuration('10:00', '10:00'), null); // identical

    // 2. Overlap detection (Same day: 12:00 - 13:00)
    // Task inside quiet hours: 12:15 to 12:45
    assert.equal(isTimeOverlappingQuietHours('12:15', 30, '12:00', '13:00', true), true);
    // Task spanning into quiet hours: 11:30 to 12:30
    assert.equal(isTimeOverlappingQuietHours('11:30', 60, '12:00', '13:00', true), true);
    // Task starting in quiet hours: 12:30 to 13:30
    assert.equal(isTimeOverlappingQuietHours('12:30', 60, '12:00', '13:00', true), true);
    // Task completely before quiet hours: 10:00 to 11:30
    assert.equal(isTimeOverlappingQuietHours('10:00', 90, '12:00', '13:00', true), false);
    // Task ending exactly at quiet hour start: 11:00 to 12:00
    assert.equal(isTimeOverlappingQuietHours('11:00', 60, '12:00', '13:00', true), false);
    // Task starting exactly at quiet hour end: 13:00 to 14:00
    assert.equal(isTimeOverlappingQuietHours('13:00', 60, '12:00', '13:00', true), false);

    // 3. Overlap detection (Overnight: 22:00 - 06:00)
    // Task at night: 23:00 to 23:45
    assert.equal(isTimeOverlappingQuietHours('23:00', 45, '22:00', '06:00', true), true);
    // Task early morning: 05:00 to 05:30
    assert.equal(isTimeOverlappingQuietHours('05:00', 30, '22:00', '06:00', true), true);
    // Task midday: 10:00 to 11:00
    assert.equal(isTimeOverlappingQuietHours('10:00', 60, '22:00', '06:00', true), false);

    // 4. When quiet hours disabled
    assert.equal(isTimeOverlappingQuietHours('12:15', 30, '12:00', '13:00', false), false);
  });

  await t.test('13. Avatar Initial Contract: First letter of first word across all representations', () => {
    assert.equal(getAvatarInitial('Nico'), 'N');
    assert.equal(getAvatarInitial('Nico Pratama'), 'N');
    assert.equal(getAvatarInitial('  nico  '), 'N');
    assert.equal(getAvatarInitial('john doe'), 'J');
    assert.equal(getAvatarInitial(''), 'U');
    assert.equal(getAvatarInitial(null), 'U');
    assert.equal(getAvatarInitial(undefined), 'U');
    assert.equal(getAvatarInitial('FoCient User'), 'F');
  });
});
