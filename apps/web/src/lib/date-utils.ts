/**
 * FoCient Real Date & Time Utilities
 * Provides dynamic current dates, calendar computations, and capacity hours.
 */

export function getTodayDate(): Date {
  return new Date();
}

export function formatCurrentDate(date: Date = new Date(), locale: 'id' | 'en' = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', options).format(date);
}

export function formatShortDate(date: Date = new Date(), locale: 'id' | 'en' = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', options).format(date);
}

export function getCurrentMonthYear(date: Date = new Date(), locale: 'id' | 'en' = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', options).format(date);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const ID_MONTH_TO_EN: Record<string, string> = {
  januari: 'January',
  februari: 'February',
  maret: 'March',
  april: 'April',
  mei: 'May',
  juni: 'June',
  juli: 'July',
  agustus: 'August',
  september: 'September',
  oktober: 'October',
  november: 'November',
  desember: 'December',
};

/**
 * Normalizes any date string (ISO "YYYY-MM-DD", numeric "DD/MM/YYYY", or verbose "Monday, November 16, 2026")
 * into a standard ISO format "YYYY-MM-DD".
 */
export function normalizeToISODate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Case 1: Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: DD/MM/YYYY
  const slashParts = trimmed.split('/');
  if (slashParts.length === 3 && slashParts[2].length === 4) {
    const d = slashParts[0].padStart(2, '0');
    const m = slashParts[1].padStart(2, '0');
    const y = slashParts[2];
    return `${y}-${m}-${d}`;
  }

  // Case 3: DD-MM-YYYY
  const dashParts = trimmed.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2 && dashParts[2].length === 4) {
    const d = dashParts[0].padStart(2, '0');
    const m = dashParts[1].padStart(2, '0');
    const y = dashParts[2];
    return `${y}-${m}-${d}`;
  }

  // Case 4: Textual date, e.g. "Monday, November 16, 2026" or "Senin, 16 November 2026"
  try {
    let normalized = trimmed;
    // Strip Indonesian & English weekday names so cross-browser Date parsing works reliably in all engines (including Firefox)
    normalized = normalized.replace(/^(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu)[,\s]*/i, '');
    normalized = normalized.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]*/i, '');
    for (const [idm, enm] of Object.entries(ID_MONTH_TO_EN)) {
      const reg = new RegExp(`\\b${idm}\\b`, 'gi');
      if (reg.test(normalized)) {
        normalized = normalized.replace(reg, enm);
        break;
      }
    }
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      const y = String(d.getFullYear());
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch {}

  return trimmed;
}

/**
 * Formats any date into concise standard display "DD/MM/YYYY" (e.g. "16/11/2026")
 * preventing overly long labels and input box truncation.
 */
export function formatToDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const iso = normalizeToISODate(dateStr);
  const parts = iso.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Calculates work capacity in minutes directly from Start Time and End Time.
 * Eliminates artificial capacity limits by giving the user full schedule control.
 */
export function calculateCapacityMinutes(startHour24?: string | null, endHour24?: string | null): number {
  if (!startHour24 || !endHour24) return 480; // Standard 8 hours fallback if unset
  try {
    const parse = (timeStr: string) => {
      const trimmed = timeStr.trim().toUpperCase();
      const isPm = trimmed.includes('PM');
      const isAm = trimmed.includes('AM');
      const clean = trimmed.replace('AM', '').replace('PM', '').trim();
      const parts = clean.split(':');
      let hour = parseInt(parts[0], 10);
      const min = parseInt(parts[1] || '0', 10);
      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    const diff = parse(endHour24) - parse(startHour24);
    return diff > 0 ? diff : 480;
  } catch {
    return 480;
  }
}

export function formatMinutesToHours(minutes: number, locale: 'id' | 'en' = 'en'): string {
  const h = (minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1);
  return `${h} ${locale === 'id' ? 'Jam' : 'Hours'}`;
}

/**
 * Parses time string (e.g. "09:30", "14:00", "02:00 PM") to total minutes from midnight (0-1439).
 */
export function parseTime24ToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim().toUpperCase();
  if (!trimmed || trimmed === '00:00' && !timeStr.includes(':')) return null;
  try {
    const isPm = trimmed.includes('PM');
    const isAm = trimmed.includes('AM');
    const clean = trimmed.replace('AM', '').replace('PM', '').trim();
    const parts = clean.split(':');
    if (parts.length < 2) return null;
    let hour = parseInt(parts[0], 10);
    const min = parseInt(parts[1] || '0', 10);
    if (isNaN(hour) || isNaN(min)) return null;
    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;
    return hour * 60 + min;
  } catch {
    return null;
  }
}

/**
 * Calculates duration in hours between Quiet Hours start and end time.
 * Handles both same-day windows (e.g. 12:00 - 13:00) and overnight windows (e.g. 22:00 - 06:00).
 */
export function calculateQuietHoursDuration(startStr?: string | null, endStr?: string | null): string | null {
  if (!startStr || !endStr || startStr === '00:00' || endStr === '00:00' || startStr === endStr) return null;
  const s = parseTime24ToMinutes(startStr);
  const e = parseTime24ToMinutes(endStr);
  if (s === null || e === null) return null;

  let diffMinutes = e - s;
  if (diffMinutes < 0) {
    diffMinutes += 1440; // overnight window
  }
  if (diffMinutes === 0) return null;
  return (diffMinutes / 60).toFixed(1).replace('.0', '');
}

/**
 * Checks whether a given task time slot overlaps with configured Quiet Hours.
 * Returns true if an overlap is detected so the system can prevent tasks from being added.
 */
export function isTimeOverlappingQuietHours(
  taskStartStr: string | undefined | null,
  taskDurationMinutes: number,
  quietStartStr: string | undefined | null,
  quietEndStr: string | undefined | null,
  quietEnabled: boolean = true
): boolean {
  if (!quietEnabled) return false;
  if (!taskStartStr || !quietStartStr || !quietEndStr) return false;
  if (quietStartStr === '00:00' && quietEndStr === '00:00') return false;
  if (quietStartStr === quietEndStr) return false;

  const tStart = parseTime24ToMinutes(taskStartStr);
  const qStart = parseTime24ToMinutes(quietStartStr);
  const qEnd = parseTime24ToMinutes(quietEndStr);

  if (tStart === null || qStart === null || qEnd === null) return false;
  const duration = Math.max(1, taskDurationMinutes || 1);
  const tEnd = tStart + duration;

  // Case 1: Same day quiet hour (e.g., 12:00 - 13:00)
  if (qStart < qEnd) {
    // Task interval [tStart, tEnd] overlaps [qStart, qEnd] if tStart < qEnd AND tEnd > qStart
    // Also consider tasks that cross midnight
    if (tEnd <= 1440) {
      return tStart < qEnd && tEnd > qStart;
    } else {
      // Task spans midnight: [tStart, 1440) and [0, tEnd - 1440)
      const part1Overlap = tStart < qEnd && 1440 > qStart;
      const part2Overlap = 0 < qEnd && (tEnd - 1440) > qStart;
      return part1Overlap || part2Overlap;
    }
  }

  // Case 2: Overnight quiet hour (e.g., 22:00 - 06:00)
  // Quiet window is [qStart, 1440) UNION [0, qEnd)
  if (qStart > qEnd) {
    // Check if task overlaps [qStart, 1440)
    const overlapsEvening = tStart < 1440 && tEnd > qStart;
    // Check if task overlaps [0, qEnd)
    const overlapsMorning = tStart < qEnd && tEnd > 0;
    return overlapsEvening || overlapsMorning;
  }

  return false;
}


export const DAYS_OF_WEEK_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type DayOfWeekKey = (typeof DAYS_OF_WEEK_KEYS)[number];

/**
 * Returns zero-indexed day of week where 0 = Monday, ..., 6 = Sunday.
 * Correctly parses ISO strings (YYYY-MM-DD), localized date strings, or falls back to today.
 */
export function getDayOfWeekIndex(dateStr?: string | null): number {
  if (!dateStr) {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  }
  const lower = dateStr.toLowerCase().trim();
  if (lower.includes('mon') || lower.includes('senin')) return 0;
  if (lower.includes('tue') || lower.includes('selasa')) return 1;
  if (lower.includes('wed') || lower.includes('rabu')) return 2;
  if (lower.includes('thu') || lower.includes('kamis')) return 3;
  if (lower.includes('fri') || lower.includes('jumat') || lower.includes("jum'at")) return 4;
  if (lower.includes('sat') || lower.includes('sabtu')) return 5;
  if (lower.includes('sun') || lower.includes('minggu')) return 6;

  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (!isNaN(d.getTime())) {
      const day = d.getDay();
      return day === 0 ? 6 : day - 1;
    }
  } catch {
    // fallback
  }

  const today = new Date().getDay();
  return today === 0 ? 6 : today - 1;
}

export function getDayOfWeekName(dayIndex: number, locale: 'id' | 'en' = 'en'): string {
  const namesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const namesId = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return locale === 'id' ? namesId[dayIndex] || 'Hari' : namesEn[dayIndex] || 'Day';
}

export function getCurrentWeekMonday(referenceDate?: Date): Date {
  const base = referenceDate ? new Date(referenceDate) : new Date();
  const currentDay = base.getDay(); // 0 is Sun, 1 is Mon
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const mon = new Date(base);
  mon.setDate(base.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export function getWeekDayDate(dayIndex: number, referenceDate?: Date): Date {
  const mon = getCurrentWeekMonday(referenceDate);
  const d = new Date(mon);
  d.setDate(mon.getDate() + dayIndex);
  return d;
}

export function isTodayDayOfWeek(dayIndex: number): boolean {
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  return todayIndex === dayIndex;
}

export interface TaskRecurrenceInfo {
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekdays' | 'weekly' | 'custom' | string;
  recurrenceDays?: number[];
}

/**
 * Parses a date string (ISO, slash format, Indonesian date, English date, or relative keyword)
 * into a Date object normalized to midnight (00:00:00.000). Returns null if unparseable.
 */
export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const lower = trimmed.toLowerCase();

  const now = new Date();
  // 1. Relative keyword "today" / "hari ini"
  if (lower === 'today' || lower === 'hari ini' || lower.includes('(today)') || lower.includes('(hari ini)')) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // 2. Relative keyword "tomorrow" / "besok"
  if (lower === 'tomorrow' || lower === 'besok') {
    const tom = new Date(now.getTime() + 86400000);
    return new Date(tom.getFullYear(), tom.getMonth(), tom.getDate());
  }

  // 3. ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }

  // 4. Slash format: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    return new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
  }

  // 5. Indonesian month map
  const idMonths: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agu: 7, ags: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11,
  };

  for (const [mName, mIdx] of Object.entries(idMonths)) {
    if (lower.includes(mName)) {
      const dayBeforeMatch = trimmed.match(new RegExp(`(?:\\b)(\\d{1,2})\\s+${mName}`, 'i'));
      const dayAfterMatch = trimmed.match(new RegExp(`${mName}\\s+(\\d{1,2})`, 'i'));
      const foundDay = dayBeforeMatch ? parseInt(dayBeforeMatch[1], 10) : (dayAfterMatch ? parseInt(dayAfterMatch[1], 10) : null);
      if (foundDay !== null) {
        const yMatch = trimmed.match(/\b(20\d{2})\b/);
        const y = yMatch ? parseInt(yMatch[1], 10) : now.getFullYear();
        return new Date(y, mIdx, foundDay);
      }
    }
  }

  // 6. English Date.parse()
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return null;
}

/**
 * Checks whether a task's dateDisplay matches a specific target calendar Date.
 * Accurately parses ISO dates (YYYY-MM-DD), formatted English dates,
 * Indonesian localized dates ("6 November 2026", "Jumat, 6 November 2026"),
 * and relative keywords ("today", "hari ini").
 * Supports repetitive / recurring schedules (daily, weekdays, weekly, custom days).
 * Prevents false substring matches (e.g. day 1 or 2 matching year "2026" or month "11").
 */
export function isTaskOnDate(
  taskDateDisplay: string | undefined | null,
  targetDate: Date,
  recurrence?: TaskRecurrenceInfo,
  referenceToday?: Date
): boolean {
  // 0. Repetitive / recurring task evaluation
  if (recurrence?.isRecurring) {
    const today = referenceToday ? new Date(referenceToday) : new Date();
    today.setHours(0, 0, 0, 0);

    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    // Recurring schedules MUST NOT show on past days prior to today
    if (targetMidnight.getTime() < today.getTime()) {
      return false;
    }

    // If the task has a specific start date in taskDateDisplay, do not show prior to that start date
    if (taskDateDisplay) {
      const parsedStart = parseDateString(taskDateDisplay);
      if (parsedStart && targetMidnight.getTime() < parsedStart.getTime()) {
        return false;
      }
    }

    const pattern = recurrence.recurrencePattern || 'daily';
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (pattern === 'daily') {
      return true;
    }
    if (pattern === 'weekdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (pattern === 'custom' && Array.isArray(recurrence.recurrenceDays) && recurrence.recurrenceDays.length > 0) {
      return recurrence.recurrenceDays.includes(dayOfWeek);
    }
    if (pattern === 'weekly') {
      if (taskDateDisplay) {
        const originDayIndex = getDayOfWeekIndex(taskDateDisplay);
        const targetDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return originDayIndex === targetDayIndex;
      }
      return true;
    }
  }

  if (!taskDateDisplay) return false;
  const trimmed = taskDateDisplay.trim();
  const lower = trimmed.toLowerCase();

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth(); // 0 - 11
  const targetDay = targetDate.getDate(); // 1 - 31

  // 1. Relative keyword "today" / "hari ini"
  const now = new Date();
  const isTargetToday =
    targetYear === now.getFullYear() &&
    targetMonth === now.getMonth() &&
    targetDay === now.getDate();
  if ((lower === 'today' || lower === 'hari ini' || lower.includes('(today)') || lower.includes('(hari ini)')) && isTargetToday) {
    return true;
  }

  // 2. Relative keyword "tomorrow" / "besok"
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTargetTomorrow =
    targetYear === tomorrow.getFullYear() &&
    targetMonth === tomorrow.getMonth() &&
    targetDay === tomorrow.getDate();
  if ((lower === 'tomorrow' || lower === 'besok') && isTargetTomorrow) {
    return true;
  }

  // 3. ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return y === targetYear && m === targetMonth && d === targetDay;
  }

  // 4. Slash format: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    return y === targetYear && m === targetMonth && d === targetDay;
  }

  // 5. Indonesian month map
  const idMonths: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agu: 7, ags: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11,
  };

  for (const [mName, mIdx] of Object.entries(idMonths)) {
    if (lower.includes(mName)) {
      if (mIdx !== targetMonth) return false;
      // Find day number adjacent to month name or standalone in string
      // e.g. "Jumat, 6 November 2026" or "6 November 2026"
      const dayBeforeMatch = trimmed.match(new RegExp(`(?:\\b)(\\d{1,2})\\s+${mName}`, 'i'));
      const dayAfterMatch = trimmed.match(new RegExp(`${mName}\\s+(\\d{1,2})`, 'i'));
      const foundDay = dayBeforeMatch ? parseInt(dayBeforeMatch[1], 10) : (dayAfterMatch ? parseInt(dayAfterMatch[1], 10) : null);
      if (foundDay !== null) {
        const yMatch = trimmed.match(/\b(20\d{2})\b/);
        if (yMatch) {
          const y = parseInt(yMatch[1], 10);
          return y === targetYear && foundDay === targetDay;
        }
        return foundDay === targetDay;
      }
    }
  }

  // 6. Standard English Date.parse() for formats like "Friday, November 6, 2026"
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    return (
      d.getFullYear() === targetYear &&
      d.getMonth() === targetMonth &&
      d.getDate() === targetDay
    );
  }

  // 7. Weekday-only fallback (e.g. "Monday" / "Senin" without explicit dates)
  // Non-recurring tasks MUST NOT repeat across all weeks or future months.
  // When a non-recurring task only has a weekday name, strictly confine it to the current/reference week.
  if (!/\d/.test(trimmed)) {
    const enDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const idDays = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const targetDayOfWeek = targetDate.getDay();
    for (let i = 0; i < 7; i++) {
      if (lower.startsWith(enDays[i]) || lower.startsWith(idDays[i])) {
        if (i !== targetDayOfWeek) return false;

        // If recurrence is not enabled, do NOT repeat indefinitely across all weeks & months!
        const refDate = referenceToday ? new Date(referenceToday) : new Date();
        const refMonday = getCurrentWeekMonday(refDate);
        const refSunday = new Date(refMonday);
        refSunday.setDate(refMonday.getDate() + 6);
        refSunday.setHours(23, 59, 59, 999);

        const targetTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0).getTime();
        return targetTime >= refMonday.getTime() && targetTime <= refSunday.getTime();
      }
    }
  }

  return false;
}
