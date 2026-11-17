import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isTaskOnDate } from '../src/lib/date-utils.ts';

describe('FoCient Recurring & Repetitive Task Feature Suite', () => {
  it('1. Daily recurrence occurs on every calendar date from today onwards and excludes past dates', () => {
    const today = new Date(2026, 10, 13); // Friday Nov 13, 2026 (Today)
    const tomorrow = new Date(2026, 10, 14); // Saturday Nov 14, 2026
    const nextSunday = new Date(2026, 10, 15); // Sunday Nov 15, 2026
    const yesterday = new Date(2026, 10, 12); // Thursday Nov 12, 2026 (Past)

    const dailyTask = {
      isRecurring: true,
      recurrencePattern: 'daily' as const,
    };

    assert.equal(isTaskOnDate('2026-11-13', today, dailyTask, today), true);
    assert.equal(isTaskOnDate('2026-11-13', tomorrow, dailyTask, today), true);
    assert.equal(isTaskOnDate('2026-11-13', nextSunday, dailyTask, today), true);
    // Past dates prior to today must NEVER show recurring tasks
    assert.equal(isTaskOnDate('2026-11-13', yesterday, dailyTask, today), false);
  });

  it('2. Weekdays recurrence occurs Monday to Friday and excludes weekends and past dates', () => {
    const fridayToday = new Date(2026, 10, 13); // Friday (Today)
    const saturday = new Date(2026, 10, 14); // Saturday
    const sunday = new Date(2026, 10, 15); // Sunday
    const nextMonday = new Date(2026, 10, 16); // Monday
    const pastWednesday = new Date(2026, 10, 11); // Past Wednesday

    const weekdaysTask = {
      isRecurring: true,
      recurrencePattern: 'weekdays' as const,
    };

    assert.equal(isTaskOnDate('2026-11-13', fridayToday, weekdaysTask, fridayToday), true);
    assert.equal(isTaskOnDate('2026-11-13', saturday, weekdaysTask, fridayToday), false);
    assert.equal(isTaskOnDate('2026-11-13', sunday, weekdaysTask, fridayToday), false);
    assert.equal(isTaskOnDate('2026-11-13', nextMonday, weekdaysTask, fridayToday), true);
    // Past weekdays must not show recurring schedule
    assert.equal(isTaskOnDate('2026-11-13', pastWednesday, weekdaysTask, fridayToday), false);
  });

  it('3. Weekly recurrence occurs on the same day of week', () => {
    const fridayToday = new Date(2026, 10, 13); // Friday Nov 13
    const nextFriday = new Date(2026, 10, 20); // Friday
    const nextSaturday = new Date(2026, 10, 21); // Saturday
    const pastFriday = new Date(2026, 10, 6); // Past Friday

    const weeklyTask = {
      isRecurring: true,
      recurrencePattern: 'weekly' as const,
    };

    assert.equal(isTaskOnDate('2026-11-13', fridayToday, weeklyTask, fridayToday), true);
    assert.equal(isTaskOnDate('2026-11-13', nextFriday, weeklyTask, fridayToday), true);
    assert.equal(isTaskOnDate('2026-11-13', nextSaturday, weeklyTask, fridayToday), false);
    assert.equal(isTaskOnDate('2026-11-13', pastFriday, weeklyTask, fridayToday), false);
  });

  it('4. Custom recurrence occurs only on specified days of week from today onwards', () => {
    const referenceToday = new Date(2026, 10, 13);
    // Custom: Tue (2) and Thu (4)
    const customTask = {
      isRecurring: true,
      recurrencePattern: 'custom' as const,
      recurrenceDays: [2, 4],
    };

    const nextTuesday = new Date(2026, 10, 17);
    const nextWednesday = new Date(2026, 10, 18);
    const nextThursday = new Date(2026, 10, 19);
    const nextFriday = new Date(2026, 10, 20);
    const pastThursday = new Date(2026, 10, 12);

    assert.equal(isTaskOnDate('2026-11-13', nextTuesday, customTask, referenceToday), true);
    assert.equal(isTaskOnDate('2026-11-13', nextWednesday, customTask, referenceToday), false);
    assert.equal(isTaskOnDate('2026-11-13', nextThursday, customTask, referenceToday), true);
    assert.equal(isTaskOnDate('2026-11-13', nextFriday, customTask, referenceToday), false);
    assert.equal(isTaskOnDate('2026-11-13', pastThursday, customTask, referenceToday), false);
  });

  it('5. Non-recurring tasks follow exact date parsing', () => {
    const today = new Date(2026, 10, 13);
    const tomorrow = new Date(2026, 10, 14);

    const regularTask = {
      isRecurring: false,
    };

    assert.equal(isTaskOnDate('2026-11-13', today, regularTask), true);
    assert.equal(isTaskOnDate('2026-11-13', tomorrow, regularTask), false);
  });

  it('6. Empathetic and cognitive-load reducing copywriting compliance', () => {
    const punitiveForbiddenWords = [
      'terlambat', 'gagal', 'hukuman', 'sanksi', 'overdue', 'failed', 'lazy', 'punish',
      'telat', 'buruk', 'malas', 'denda'
    ];

    const recurringCopywriting = [
      'Tugas Berulang (Repetitif)',
      'Recurring Task (Repetitive)',
      'Otomatis diulang agar tidak perlu input berulang kali, meringankan beban kognitif',
      'Automatically repeats without manual re-entry to reduce cognitive fatigue',
      'Frekuensi Pengulangan',
      'Repetition Frequency',
      'Setiap Hari',
      'Hari Kerja (Sen-Jum)',
      'Setiap Minggu',
      'Pilih Hari',
      'Jadwal Repetitif',
      'Repetitive Schedule',
    ];

    recurringCopywriting.forEach((phrase) => {
      const lower = phrase.toLowerCase();
      punitiveForbiddenWords.forEach((forbidden) => {
        assert.ok(
          !lower.includes(forbidden),
          `Phrase "${phrase}" contains forbidden punitive word: "${forbidden}"`
        );
      });
    });
  });
});
