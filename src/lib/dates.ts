/**
 * Date helpers. The site's "day" follows India Standard Time, so the
 * quote of the day and daily prompt change at midnight IST for everyone.
 */

export const SITE_TIME_ZONE = 'Asia/Kolkata';

/** 'YYYY-MM-DD' for the given moment in IST. */
export function isoDate(date: Date = new Date(), timeZone = SITE_TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Whole days since 1970-01-01 for a 'YYYY-MM-DD' string (timezone-free). */
export function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** 'Saturday, 26 September 2026' */
export function formatLongDate(date: Date = new Date(), timeZone = SITE_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Add `days` to a 'YYYY-MM-DD' string. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
