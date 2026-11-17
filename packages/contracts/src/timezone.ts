/**
 * Timezone and Daylight Saving Time (DST) utilities for FoCient.
 *
 * Guilt-free productivity guarantees:
 * - Timezone boundaries are calculated using the user's specific IANA timezone (e.g. Asia/Jakarta, America/New_York).
 * - Correctly handles 23-hour spring-forward transitions and 25-hour fall-back transitions without dropping tasks.
 * - Stored timestamps remain UTC while presentation and day grouping follow user local calendar days.
 */

export interface LocalDayBoundaries {
  startOfDay: Date;
  endOfDay: Date;
  durationMs: number;
  durationHours: number;
  date: string;
  timeZone: string;
}

/**
 * Validates whether an IANA timezone identifier is valid and supported by the runtime.
 */
export function isValidTimezone(timeZone?: string | null): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a timezone identifier, falling back to 'Asia/Jakarta' or 'UTC' if invalid.
 */
export function normalizeTimezone(timeZone?: string | null, fallback: string = 'Asia/Jakarta'): string {
  if (isValidTimezone(timeZone)) {
    return timeZone as string;
  }
  return isValidTimezone(fallback) ? fallback : 'UTC';
}

/**
 * Calculates the timezone offset in minutes relative to UTC for a specific timestamp and timezone.
 * Positive values indicate timezones ahead of UTC (e.g. UTC+7 is +420).
 */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  const localInUtc = Date.UTC(
    partMap.year,
    (partMap.month ?? 1) - 1,
    partMap.day,
    partMap.hour === 24 ? 0 : (partMap.hour ?? 0),
    partMap.minute ?? 0,
    partMap.second ?? 0
  );

  return (localInUtc - date.getTime()) / (60 * 1000);
}

/**
 * Computes exact start-of-day (00:00:00.000 local) and end-of-day (23:59:59.999 local)
 * UTC timestamps for a given calendar date (YYYY-MM-DD) and IANA timezone.
 *
 * Automatically accounts for:
 * - 23-hour days (Daylight Saving Time spring-forward)
 * - 25-hour days (Daylight Saving Time fall-back)
 * - Standard 24-hour days
 */
export function getLocalDayBoundaries(dateStr: string, timeZoneInput: string = 'Asia/Jakarta'): LocalDayBoundaries {
  const timeZone = normalizeTimezone(timeZoneInput);
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Approximate UTC noon of target date
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offsetAtNoon = getTimezoneOffsetMinutes(noonUtc, timeZone);

  // Iteratively resolve local midnight (00:00:00.000 local)
  let startGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offsetAtNoon * 60 * 1000);
  for (let i = 0; i < 4; i++) {
    const offset = getTimezoneOffsetMinutes(startGuess, timeZone);
    const candidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offset * 60 * 1000);
    if (candidate.getTime() === startGuess.getTime()) break;
    startGuess = candidate;
  }

  // Iteratively resolve next day's local midnight
  const nextDayNoonUtc = new Date(Date.UTC(year, month - 1, day + 1, 12, 0, 0));
  const offsetNextNoon = getTimezoneOffsetMinutes(nextDayNoonUtc, timeZone);
  let nextStartGuess = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0) - offsetNextNoon * 60 * 1000);
  for (let i = 0; i < 4; i++) {
    const offset = getTimezoneOffsetMinutes(nextStartGuess, timeZone);
    const candidate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0) - offset * 60 * 1000);
    if (candidate.getTime() === nextStartGuess.getTime()) break;
    nextStartGuess = candidate;
  }

  const endOfDay = new Date(nextStartGuess.getTime() - 1);
  const durationMs = nextStartGuess.getTime() - startGuess.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return {
    startOfDay: startGuess,
    endOfDay,
    durationMs,
    durationHours,
    date: dateStr,
    timeZone,
  };
}

/**
 * Checks if a specific UTC timestamp falls within the local calendar day of the given timezone.
 */
export function isTimestampInLocalDay(timestamp: Date | string, dateStr: string, timeZone: string = 'Asia/Jakarta'): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return false;
  const boundaries = getLocalDayBoundaries(dateStr, timeZone);
  return date.getTime() >= boundaries.startOfDay.getTime() && date.getTime() <= boundaries.endOfDay.getTime();
}

/**
 * Converts a UTC Date into local ISO date string (YYYY-MM-DD) for a specific timezone.
 */
export function formatLocalDateString(date: Date, timeZone: string = 'Asia/Jakarta'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: normalizeTimezone(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // en-CA formats as YYYY-MM-DD
}
