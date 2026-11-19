import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isTaskOnDate, normalizeToISODate } from '../src/lib/date-utils.ts';
import {
  buildUrgentTaskReminderCopy,
  buildTaskAddedCopy,
  buildTaskCompletedCopy,
  buildDailySummaryCopy,
} from '../src/lib/pwa-notifications.ts';

describe('FoCient Calendar Date Isolation & Expanded Notification System Suite', () => {
  it('1. Non-recurring task scheduled for Monday Nov 16 ONLY matches Nov 16 (no false matches on 2, 7, 23, 30 Nov or Dec)', () => {
    const mondayNov16 = new Date(2026, 10, 16); // Mon Nov 16, 2026
    const mondayNov2 = new Date(2026, 10, 2);   // Mon Nov 2, 2026
    const saturdayNov7 = new Date(2026, 10, 7); // Sat Nov 7, 2026
    const mondayNov23 = new Date(2026, 10, 23); // Mon Nov 23, 2026
    const mondayNov30 = new Date(2026, 10, 30); // Mon Nov 30, 2026
    const mondayDec7 = new Date(2026, 11, 7);   // Mon Dec 7, 2026 (Next month)

    const singleDayTask = {
      isRecurring: false,
    };

    // Test with standard ISO date format
    assert.equal(isTaskOnDate('2026-11-16', mondayNov16, singleDayTask), true);
    assert.equal(isTaskOnDate('2026-11-16', mondayNov2, singleDayTask), false);
    assert.equal(isTaskOnDate('2026-11-16', saturdayNov7, singleDayTask), false);
    assert.equal(isTaskOnDate('2026-11-16', mondayNov23, singleDayTask), false);
    assert.equal(isTaskOnDate('2026-11-16', mondayNov30, singleDayTask), false);
    assert.equal(isTaskOnDate('2026-11-16', mondayDec7, singleDayTask), false);

    // Test with localized Indonesian formatted string
    assert.equal(isTaskOnDate('Senin, 16 November 2026', mondayNov16, singleDayTask), true);
    assert.equal(isTaskOnDate('Senin, 16 November 2026', mondayNov2, singleDayTask), false);
    assert.equal(isTaskOnDate('Senin, 16 November 2026', saturdayNov7, singleDayTask), false);
    assert.equal(isTaskOnDate('Senin, 16 November 2026', mondayNov23, singleDayTask), false);
    assert.equal(isTaskOnDate('Senin, 16 November 2026', mondayNov30, singleDayTask), false);
    assert.equal(isTaskOnDate('Senin, 16 November 2026', mondayDec7, singleDayTask), false);

    // Test with localized English formatted string
    assert.equal(isTaskOnDate('Monday, November 16, 2026', mondayNov16, singleDayTask), true);
    assert.equal(isTaskOnDate('Monday, November 16, 2026', mondayNov2, singleDayTask), false);
    assert.equal(isTaskOnDate('Monday, November 16, 2026', saturdayNov7, singleDayTask), false);
    assert.equal(isTaskOnDate('Monday, November 16, 2026', mondayNov23, singleDayTask), false);
    assert.equal(isTaskOnDate('Monday, November 16, 2026', mondayNov30, singleDayTask), false);
    assert.equal(isTaskOnDate('Monday, November 16, 2026', mondayDec7, singleDayTask), false);
  });

  it('2. Normalization handles Indonesian and English day-names reliably for all browsers', () => {
    assert.equal(normalizeToISODate('Senin, 16 November 2026'), '2026-11-16');
    assert.equal(normalizeToISODate('Monday, November 16, 2026'), '2026-11-16');
    assert.equal(normalizeToISODate('16/11/2026'), '2026-11-16');
    assert.equal(normalizeToISODate('2026-11-16'), '2026-11-16');
  });

  it('3. Priority sorting contract: Top 3 tasks always appear before normal and low priority tasks', () => {
    const sampleList = [
      { id: '1', title: 'Documentation', priority: 'normal', startHourDisplay: '09:00' },
      { id: '2', title: 'Coding', priority: 'top3', startHourDisplay: '10:00' },
      { id: '3', title: 'Code Review', priority: 'top3', startHourDisplay: '11:00' },
      { id: '4', title: 'Consult supervisor', priority: 'normal', startHourDisplay: '14:00' },
      { id: '5', title: 'Chat to mother', priority: 'low', startHourDisplay: '16:00' },
    ];

    const priorityWeight: Record<string, number> = { top3: 0, normal: 1, low: 2 };
    const sorted = [...sampleList].sort((a, b) => {
      const pA = priorityWeight[a.priority] ?? 1;
      const pB = priorityWeight[b.priority] ?? 1;
      if (pA !== pB) return pA - pB;
      return (a.startHourDisplay || '').localeCompare(b.startHourDisplay || '');
    });

    assert.equal(sorted[0].title, 'Coding');
    assert.equal(sorted[1].title, 'Code Review');
    assert.equal(sorted[2].title, 'Documentation');
    assert.equal(sorted[3].title, 'Consult supervisor');
    assert.equal(sorted[4].title, 'Chat to mother');
  });

  it('4. Expanded notification copy builders for urgent task reminders, task added, task completed, and daily summary', () => {
    // Urgent focus reminder
    const urgentEn = buildUrgentTaskReminderCopy('Finalize Security Audit', '14:00', 'en');
    assert.ok(urgentEn.title.includes('Important Task Reminder'));
    assert.ok(urgentEn.body.includes('Finalize Security Audit'));
    assert.ok(urgentEn.body.includes('14:00'));

    const urgentId = buildUrgentTaskReminderCopy('Audit Keamanan Akhir', '14:00', 'id');
    assert.ok(urgentId.title.includes('Pengingat Tugas Penting'));
    assert.ok(urgentId.body.includes('Audit Keamanan Akhir'));

    // Task added notification
    const addedId = buildTaskAddedCopy('Desain Skema DB', '10:00', 'id');
    assert.ok(addedId.title.includes('Tugas Ditambahkan'));
    assert.ok(addedId.body.includes('Desain Skema DB'));

    // Task completed notification
    const completedId = buildTaskCompletedCopy('Desain Skema DB', 'id');
    assert.ok(completedId.title.includes('Tugas Selesai!'));
    assert.ok(completedId.body.includes('Desain Skema DB'));

    // Daily summary notification
    const summaryId = buildDailySummaryCopy(5, 45, 'id');
    assert.ok(summaryId.title.includes('Rekap Hari Ini'));
    assert.ok(summaryId.body.includes('5 tugas selesai'));
    assert.ok(summaryId.body.includes('45 menit'));
  });
});
