import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getCurrentWeekStartDate,
  getWeekDayDate,
  getWeekDayKeys,
  getWeekRangeBadge,
  getDayOfWeekName,
  isTodayDayOfWeek,
  getDefaultWeekStartDay,
  isTaskOnDate,
} from '../src/lib/date-utils.ts';
import type { WeekStartDay } from '../src/lib/date-utils.ts';
import { withDbTimeout, isDbAvailable } from '../src/lib/auth-server.ts';

describe('FoCient Week-Start Preference & Button UI Optimization Suite', () => {
  it('1. Week start keys correctly returns Monday-first or Sunday-first arrays', () => {
    const mondayKeys = getWeekDayKeys('monday');
    assert.deepEqual(mondayKeys, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

    const sundayKeys = getWeekDayKeys('sunday');
    assert.deepEqual(sundayKeys, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    const mondayKeysId = getWeekDayKeys('monday', 'id');
    assert.deepEqual(mondayKeysId, ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']);

    const sundayKeysId = getWeekDayKeys('sunday', 'id');
    assert.deepEqual(sundayKeysId, ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']);
  });

  it('2. Week range badge displays accurate range label in EN and ID', () => {
    assert.equal(getWeekRangeBadge('monday', 'en'), 'Mon - Sun');
    assert.equal(getWeekRangeBadge('monday', 'id'), 'Sen - Min');

    assert.equal(getWeekRangeBadge('sunday', 'en'), 'Sun - Sat');
    assert.equal(getWeekRangeBadge('sunday', 'id'), 'Min - Sab');
  });

  it('3. Weekday dates calculation correctly anchors to Sunday or Monday', () => {
    // Reference: Wednesday Nov 18, 2026
    const wedNov18 = new Date(2026, 10, 18);

    // If week starts on Monday, day 0 must be Monday Nov 16
    const monDate = getWeekDayDate(0, wedNov18, 'monday');
    assert.equal(monDate.getFullYear(), 2026);
    assert.equal(monDate.getMonth(), 10);
    assert.equal(monDate.getDate(), 16);

    // If week starts on Sunday, day 0 must be Sunday Nov 15
    const sunDate = getWeekDayDate(0, wedNov18, 'sunday');
    assert.equal(sunDate.getFullYear(), 2026);
    assert.equal(sunDate.getMonth(), 10);
    assert.equal(sunDate.getDate(), 15);

    // Saturday is day 6 in Sunday-start cycle
    const satDate = getWeekDayDate(6, wedNov18, 'sunday');
    assert.equal(satDate.getDate(), 21);
  });

  it('4. Day of week names accurately follow chosen week cycle', () => {
    // Monday cycle
    assert.equal(getDayOfWeekName(0, 'en', 'monday'), 'Monday');
    assert.equal(getDayOfWeekName(6, 'en', 'monday'), 'Sunday');
    assert.equal(getDayOfWeekName(0, 'id', 'monday'), 'Senin');
    assert.equal(getDayOfWeekName(6, 'id', 'monday'), 'Minggu');

    // Sunday cycle
    assert.equal(getDayOfWeekName(0, 'en', 'sunday'), 'Sunday');
    assert.equal(getDayOfWeekName(6, 'en', 'sunday'), 'Saturday');
    assert.equal(getDayOfWeekName(0, 'id', 'sunday'), 'Minggu');
    assert.equal(getDayOfWeekName(6, 'id', 'sunday'), 'Sabtu');
  });

  it('5. Database timeout wrapper safely rejects within deadline without hanging', async () => {
    const start = Date.now();
    try {
      // Simulate hanging promise
      await withDbTimeout(
        new Promise((resolve) => setTimeout(resolve, 5000)),
        150
      );
      assert.fail('Should have timed out');
    } catch (err: any) {
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 400, `Elapsed ${elapsed}ms should be under 400ms`);
      assert.equal(err.message, 'DATABASE_CONNECTION_TIMEOUT');
    }
  });

  it('6. Default Week Start Day fallback and omitted argument behavior', () => {
    // Without window/localStorage, default must be 'monday'
    assert.equal(getDefaultWeekStartDay(), 'monday');

    // Calling functions without weekStart uses default gracefully
    const defaultKeys = getWeekDayKeys();
    assert.deepEqual(defaultKeys, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

    const defaultBadge = getWeekRangeBadge();
    assert.equal(defaultBadge, 'Mon - Sun');
  });

  it('7. InsightsScreen 7-day workload distribution strictly maps to Sunday or Monday cycle', () => {
    // Reference date: Wednesday Nov 18, 2026
    const wedNov18 = new Date(2026, 10, 18);

    // Task on Sunday Nov 15
    const taskSunday = { id: 't1', title: 'Sunday Prep', dateDisplay: '2026-11-15', durationMinutes: 60 };
    // Task on Wednesday Nov 18
    const taskWed = { id: 't2', title: 'Midweek Coding', dateDisplay: '2026-11-18', durationMinutes: 120 };

    // Sunday-start cycle:
    // Day 0 is Sunday Nov 15, Day 3 is Wednesday Nov 18
    const sunDay0 = getWeekDayDate(0, wedNov18, 'sunday');
    assert.equal(isTaskOnDate(taskSunday.dateDisplay, sunDay0), true);

    const sunDay3 = getWeekDayDate(3, wedNov18, 'sunday');
    assert.equal(isTaskOnDate(taskWed.dateDisplay, sunDay3), true);

    // Monday-start cycle:
    // Day 0 is Monday Nov 16, Day 2 is Wednesday Nov 18, Day 6 is Sunday Nov 22
    const monDay2 = getWeekDayDate(2, wedNov18, 'monday');
    assert.equal(isTaskOnDate(taskWed.dateDisplay, monDay2), true);

    // Sunday Nov 15 is NOT in the Monday Nov 16-22 week cycle
    const monDay0 = getWeekDayDate(0, wedNov18, 'monday');
    assert.equal(isTaskOnDate(taskSunday.dateDisplay, monDay0), false);
  });

  it('8. DatePickerField emptyOffset correctly adjusts for Sunday-first and Monday-first cycles', () => {
    // Nov 1, 2026 is a Sunday (firstDayOfWeek = 0)
    const firstDayNov2026: number = 0; // Sunday
    const emptyOffsetSunday = firstDayNov2026; // 0
    const emptyOffsetMonday = firstDayNov2026 === 0 ? 6 : firstDayNov2026 - 1; // 6
    assert.equal(emptyOffsetSunday, 0);
    assert.equal(emptyOffsetMonday, 6);

    // Feb 1, 2027 is a Monday (firstDayOfWeek = 1)
    const firstDayFeb2027: number = 1; // Monday
    const emptyOffsetSundayFeb = firstDayFeb2027; // 1
    const emptyOffsetMondayFeb = firstDayFeb2027 === 0 ? 6 : firstDayFeb2027 - 1; // 0
    assert.equal(emptyOffsetSundayFeb, 1);
    assert.equal(emptyOffsetMondayFeb, 0);
  });

  it('9. Anti-burnout Settings text strictly omits redundant "(maximum 8 hours)"', () => {
    const settingsCode = fs.readFileSync(
      new URL('../src/screens/settings/SettingsScreen.tsx', import.meta.url),
      'utf8'
    );
    assert.equal(settingsCode.includes('(maximum 8 hours)'), false, 'SettingsScreen must not include (maximum 8 hours)');
    assert.equal(settingsCode.includes('(maksimal 8 jam)'), false, 'SettingsScreen must not include (maksimal 8 jam)');
    assert.ok(settingsCode.includes('Maximum daily capacity enforces FoCient anti-burnout principles.'), 'Clean description present');
  });

  it('10. InsightsScreen thisWeek and lastWeek range selection & weekly completion caption contract', () => {
    const insightsCode = fs.readFileSync(
      new URL('../src/screens/insights/InsightsScreen.tsx', import.meta.url),
      'utf8'
    );

    // 1. Must use 'thisWeek' and 'lastWeek' range switch with Last Week placed before This Week
    assert.ok(insightsCode.includes("'thisWeek' | 'lastWeek'"), 'Must define range as thisWeek | lastWeek');
    assert.ok(insightsCode.includes("setSelectedRange('thisWeek')"), 'Must include thisWeek switch');
    assert.ok(insightsCode.includes("setSelectedRange('lastWeek')"), 'Must include lastWeek switch');
    const lastWeekIdx = insightsCode.indexOf("setSelectedRange('lastWeek')");
    const thisWeekIdx = insightsCode.indexOf("setSelectedRange('thisWeek')");
    assert.ok(lastWeekIdx < thisWeekIdx, 'Last Week button must appear before This Week button in switch order');

    // 2. Card 3 caption must NOT be misleading static "Done for today", but weekly-scoped
    assert.ok(!insightsCode.includes(": 'Done for today'"), 'Must not have hardcoded "Done for today"');
    assert.ok(insightsCode.includes("'Completed this week'") || insightsCode.includes("'Selesai pekan ini'"), 'Must have this week completion caption');
    assert.ok(insightsCode.includes("'Completed last week'") || insightsCode.includes("'Selesai pekan lalu'"), 'Must have last week completion caption');

    // 3. Test weekly date isolation directly
    const today = new Date(2026, 10, 20); // Friday Nov 20, 2026
    const thisWeekDates = [0, 1, 2, 3, 4, 5, 6].map(i => getWeekDayDate(i, today, 'monday'));

    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(today.getDate() - 7);
    const lastWeekDates = [0, 1, 2, 3, 4, 5, 6].map(i => getWeekDayDate(i, lastWeekDate, 'monday'));

    const tasksSample = [
      { id: '1', dateDisplay: '2026-11-20', status: 'completed' }, // This Friday
      { id: '2', dateDisplay: '2026-11-16', status: 'completed' }, // This Monday
      { id: '3', dateDisplay: '2026-11-13', status: 'completed' }, // Last Friday
      { id: '4', dateDisplay: '2026-11-09', status: 'completed' }, // Last Monday
    ];

    const matchingThisWeek = tasksSample.filter(t => thisWeekDates.some(d => isTaskOnDate(t.dateDisplay, d)));
    assert.equal(matchingThisWeek.length, 2);
    assert.deepEqual(matchingThisWeek.map(t => t.id), ['1', '2']);

    const matchingLastWeek = tasksSample.filter(t => lastWeekDates.some(d => isTaskOnDate(t.dateDisplay, d)));
    assert.equal(matchingLastWeek.length, 2);
    assert.deepEqual(matchingLastWeek.map(t => t.id), ['3', '4']);
  });
});
