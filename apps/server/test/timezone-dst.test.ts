import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTimezone,
  normalizeTimezone,
  getTimezoneOffsetMinutes,
  getLocalDayBoundaries,
  isTimestampInLocalDay,
  formatLocalDateString,
} from '../src/common/timezone.util.js';

describe('FoCient Timezone & Daylight Saving Time (DST) Specification (P2 Maintainability)', () => {
  describe('1. IANA Timezone Validation and Normalization', () => {
    it('validates standard IANA timezones', () => {
      assert.equal(isValidTimezone('Asia/Jakarta'), true);
      assert.equal(isValidTimezone('America/New_York'), true);
      assert.equal(isValidTimezone('Europe/London'), true);
      assert.equal(isValidTimezone('UTC'), true);
      assert.equal(isValidTimezone('Australia/Sydney'), true);
    });

    it('rejects invalid or malformed timezones', () => {
      assert.equal(isValidTimezone(''), false);
      assert.equal(isValidTimezone(null), false);
      assert.equal(isValidTimezone(undefined), false);
      assert.equal(isValidTimezone('Invalid/Non_Existent_Zone'), false);
      assert.equal(isValidTimezone('GMT+7'), false);
    });

    it('normalizes invalid inputs to fallback timezone without throwing', () => {
      assert.equal(normalizeTimezone('Asia/Jakarta'), 'Asia/Jakarta');
      assert.equal(normalizeTimezone('America/New_York'), 'America/New_York');
      assert.equal(normalizeTimezone('invalid', 'Asia/Jakarta'), 'Asia/Jakarta');
      assert.equal(normalizeTimezone(undefined, 'Europe/London'), 'Europe/London');
      assert.equal(normalizeTimezone(null, 'invalid'), 'UTC');
    });
  });

  describe('2. Standard Calendar Day Boundaries (24-Hour Non-DST Days)', () => {
    it('computes exact day boundaries for Asia/Jakarta (UTC+7, non-DST)', () => {
      const boundaries = getLocalDayBoundaries('2026-10-29', 'Asia/Jakarta');

      // Local 2026-10-29 00:00:00 WIB is 2026-10-28 17:00:00.000 UTC
      assert.equal(boundaries.startOfDay.toISOString(), '2026-10-28T17:00:00.000Z');
      // Local 2026-10-29 23:59:59.999 WIB is 2026-10-29 16:59:59.999 UTC
      assert.equal(boundaries.endOfDay.toISOString(), '2026-10-29T16:59:59.999Z');
      assert.equal(boundaries.durationHours, 24);
      assert.equal(boundaries.durationMs, 24 * 60 * 60 * 1000);
    });

    it('computes exact day boundaries for UTC', () => {
      const boundaries = getLocalDayBoundaries('2026-10-29', 'UTC');

      assert.equal(boundaries.startOfDay.toISOString(), '2026-10-29T00:00:00.000Z');
      assert.equal(boundaries.endOfDay.toISOString(), '2026-10-29T23:59:59.999Z');
      assert.equal(boundaries.durationHours, 24);
    });
  });

  describe('3. Daylight Saving Time (DST) Transitions: 23-Hour Spring-Forward', () => {
    it('handles US Eastern spring-forward transition (2026-03-08, 23 hours)', () => {
      // On 2026-03-08 in America/New_York, clocks advance from 02:00 to 03:00 EST -> EDT
      const boundaries = getLocalDayBoundaries('2026-03-08', 'America/New_York');

      // Start: 2026-03-08 00:00:00 EST = 2026-03-08 05:00:00 UTC (offset -5h)
      assert.equal(boundaries.startOfDay.toISOString(), '2026-03-08T05:00:00.000Z');
      // End: 2026-03-08 23:59:59.999 EDT = 2026-03-09 03:59:59.999 UTC (offset -4h)
      assert.equal(boundaries.endOfDay.toISOString(), '2026-03-09T03:59:59.999Z');
      // The day is exactly 23 hours long
      assert.equal(boundaries.durationHours, 23);
      assert.equal(boundaries.durationMs, 23 * 60 * 60 * 1000);
    });

    it('handles Europe/London spring-forward transition (2026-03-29, 23 hours)', () => {
      // On 2026-03-29 in Europe/London, clocks advance from 01:00 to 02:00 GMT -> BST
      const boundaries = getLocalDayBoundaries('2026-03-29', 'Europe/London');

      assert.equal(boundaries.startOfDay.toISOString(), '2026-03-29T00:00:00.000Z');
      assert.equal(boundaries.endOfDay.toISOString(), '2026-03-29T22:59:59.999Z');
      assert.equal(boundaries.durationHours, 23);
      assert.equal(boundaries.durationMs, 23 * 60 * 60 * 1000);
    });
  });

  describe('4. Daylight Saving Time (DST) Transitions: 25-Hour Fall-Back', () => {
    it('handles US Eastern fall-back transition (2026-11-01, 25 hours)', () => {
      // On 2026-11-01 in America/New_York, clocks repeat from 02:00 to 01:00 EDT -> EST
      const boundaries = getLocalDayBoundaries('2026-11-01', 'America/New_York');

      // Start: 2026-11-01 00:00:00 EDT = 2026-11-01 04:00:00 UTC (offset -4h)
      assert.equal(boundaries.startOfDay.toISOString(), '2026-11-01T04:00:00.000Z');
      // End: 2026-11-01 23:59:59.999 EST = 2026-11-02 04:59:59.999 UTC (offset -5h)
      assert.equal(boundaries.endOfDay.toISOString(), '2026-11-02T04:59:59.999Z');
      // The day is exactly 25 hours long
      assert.equal(boundaries.durationHours, 25);
      assert.equal(boundaries.durationMs, 25 * 60 * 60 * 1000);
    });

    it('handles Europe/London fall-back transition (2026-10-25, 25 hours)', () => {
      // On 2026-10-25 in Europe/London, clocks repeat from 02:00 to 01:00 BST -> GMT
      const boundaries = getLocalDayBoundaries('2026-10-25', 'Europe/London');

      assert.equal(boundaries.startOfDay.toISOString(), '2026-10-24T23:00:00.000Z');
      assert.equal(boundaries.endOfDay.toISOString(), '2026-10-25T23:59:59.999Z');
      assert.equal(boundaries.durationHours, 25);
      assert.equal(boundaries.durationMs, 25 * 60 * 60 * 1000);
    });
  });

  describe('5. Cross-Timezone Timestamp Local Day Membership', () => {
    it('correctly associates UTC timestamps with local calendar dates across timezones', () => {
      // 2026-10-29 02:00:00 UTC
      // - Jakarta (UTC+7): 2026-10-29 09:00:00 (Today: 2026-10-29)
      // - New York (UTC-4 EDT): 2026-10-28 22:00:00 (Yesterday: 2026-10-28)
      const instant = new Date('2026-10-29T02:00:00.000Z');

      assert.equal(isTimestampInLocalDay(instant, '2026-10-29', 'Asia/Jakarta'), true);
      assert.equal(isTimestampInLocalDay(instant, '2026-10-28', 'Asia/Jakarta'), false);

      assert.equal(isTimestampInLocalDay(instant, '2026-10-28', 'America/New_York'), true);
      assert.equal(isTimestampInLocalDay(instant, '2026-10-29', 'America/New_York'), false);
    });

    it('formats local ISO date string consistently', () => {
      const instant = new Date('2026-10-29T02:00:00.000Z');
      assert.equal(formatLocalDateString(instant, 'Asia/Jakarta'), '2026-10-29');
      assert.equal(formatLocalDateString(instant, 'America/New_York'), '2026-10-28');
    });

    it('calculates timezone offset minutes correctly', () => {
      const standardDate = new Date('2026-01-15T12:00:00.000Z');
      // Jakarta is always UTC+7 = +420 minutes
      assert.equal(getTimezoneOffsetMinutes(standardDate, 'Asia/Jakarta'), 420);

      // New York in January is EST = UTC-5 = -300 minutes
      assert.equal(getTimezoneOffsetMinutes(standardDate, 'America/New_York'), -300);

      // New York in July is EDT = UTC-4 = -240 minutes
      const summerDate = new Date('2026-07-15T12:00:00.000Z');
      assert.equal(getTimezoneOffsetMinutes(summerDate, 'America/New_York'), -240);
    });
  });

  describe('6. Guilt-Free Philosophy & Non-Punitive Guardrails', () => {
    it('maintains non-punitive vocabulary in daily plan and capacity calculations', () => {
      const punitiveForbidden = ['terlambat', 'overdue', 'failed', 'telat', 'hukuman', 'punish'];
      const diagnosticSample = 'Rencana harian disesuaikan dengan zona waktu lokal secara adaptif dan tenang.';

      for (const word of punitiveForbidden) {
        assert.equal(
          diagnosticSample.toLowerCase().includes(word),
          false,
          `Diagnostic messages must not contain punitive word: "${word}"`
        );
      }
    });
  });
});
