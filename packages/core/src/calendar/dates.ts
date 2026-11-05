/**
 * Plain-ISO date helpers (FR-CALENDAR-02): dates are `YYYY-MM-DD` strings and every calculation
 * uses local calendar fields only, so no timezone shift can move a date.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISO(value: string): Date | undefined {
  const m = ISO.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Reject overflow such as 2024-02-31.
  return d.getFullYear() === Number(m[1]) &&
    d.getMonth() === Number(m[2]) - 1 &&
    d.getDate() === Number(m[3])
    ? d
    : undefined;
}

export function toISO(d: Date): string {
  const y = String(d.getFullYear()).padStart(4, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso)!;
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** Adds months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(iso: string, months: number): string {
  const d = parseISO(iso)!;
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** ISO 8601 week number of a date. */
export function isoWeek(iso: string): number {
  const d = parseISO(iso)!;
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day + 3); // Thursday of this week
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const diff = (d.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round((diff - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

/** First day of the week for a locale (0 = Sunday), from `Intl.Locale` week info when available. */
export function localeFirstDay(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    const info = l.getWeekInfo?.() ?? l.weekInfo;
    if (info) return info.firstDay % 7;
  } catch {
    /* fall through */
  }
  return /^(en-US|en-CA|ja|zh|ko|he|pt-BR)/i.test(locale) || !locale ? 0 : 1;
}

export const compare = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;
