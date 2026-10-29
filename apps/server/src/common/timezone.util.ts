/**
 * Server-side timezone and DST utility wrapper.
 * Re-exports contracts timezone utilities and provides database query helpers.
 */
export {
  isValidTimezone,
  normalizeTimezone,
  getTimezoneOffsetMinutes,
  getLocalDayBoundaries,
  isTimestampInLocalDay,
  formatLocalDateString,
  type LocalDayBoundaries,
} from '@focient/contracts';

import { getLocalDayBoundaries, normalizeTimezone } from '@focient/contracts';

/**
 * Creates Prisma-compatible gte / lte query filters for a user's local calendar day.
 */
export function getPrismaLocalDayFilter(dateStr: string, timeZone?: string | null) {
  const boundaries = getLocalDayBoundaries(dateStr, normalizeTimezone(timeZone));
  return {
    gte: boundaries.startOfDay,
    lte: boundaries.endOfDay,
  };
}
