/**
 * Deterministic rotation, by day or by week.
 *
 * `pickForDate` returns the same item all day and a different one the next
 * day; `pickForWeek` does the same but changes once a week. Stepping by a
 * large prime (instead of +1) spreads neighbouring items apart, so
 * consecutive periods don't show e.g. three quotes by the same author,
 * while still visiting every item once before repeating (as long as the
 * list length isn't a multiple of the prime).
 */
import { dayNumber, isoDate, weekNumber } from './dates';

const STRIDE = 7919; // prime

function indexForPeriod(length: number, period: number): number {
  if (length <= 0) return -1;
  return (((period * STRIDE) % length) + length) % length;
}

export function indexForDate(length: number, iso: string = isoDate()): number {
  return indexForPeriod(length, dayNumber(iso));
}

export function pickForDate<T>(items: readonly T[], iso: string = isoDate()): T | undefined {
  const i = indexForDate(items.length, iso);
  return i < 0 ? undefined : items[i];
}

export function indexForWeek(length: number, iso: string = isoDate()): number {
  return indexForPeriod(length, weekNumber(iso));
}

export function pickForWeek<T>(items: readonly T[], iso: string = isoDate()): T | undefined {
  const i = indexForWeek(items.length, iso);
  return i < 0 ? undefined : items[i];
}
