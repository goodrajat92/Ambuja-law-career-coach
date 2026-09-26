/**
 * Deterministic daily rotation.
 *
 * `pickForDate` returns the same item all day and a different one the next
 * day. Stepping by a large prime (instead of +1) spreads neighbouring items
 * apart, so consecutive days don't show e.g. three quotes by the same author,
 * while still visiting every item once before repeating (as long as the list
 * length isn't a multiple of the prime).
 */
import { dayNumber, isoDate } from './dates';

const STRIDE = 7919; // prime

export function indexForDate(length: number, iso: string = isoDate()): number {
  if (length <= 0) return -1;
  return (((dayNumber(iso) * STRIDE) % length) + length) % length;
}

export function pickForDate<T>(items: readonly T[], iso: string = isoDate()): T | undefined {
  const i = indexForDate(items.length, iso);
  return i < 0 ? undefined : items[i];
}
