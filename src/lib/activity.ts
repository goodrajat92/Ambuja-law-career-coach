/**
 * Streak + progress tracking (browser only).
 *
 * A day counts as "active" when any page of the site is opened that day.
 * Later phases add to `progress` (exercises done, topics read).
 */
import { addDays, isoDate } from './dates';
import { KEYS, readJSON, writeJSON } from './storage';

const MAX_DAYS_KEPT = 400;

export interface Progress {
  /** Slugs of completed practice exercises (kept as a set, so revisiting one doesn't double-count it). */
  exercisesCompleted: string[];
  topicsRead: string[];
}

export interface ActivitySummary {
  daysActive: number;
  currentStreak: number;
  bestStreak: number;
  exercisesDone: number;
  topicsRead: number;
  /** The last 7 days (oldest first) and whether each was active. */
  lastWeek: { date: string; active: boolean }[];
}

/** Record today as an active day. Safe to call on every page load. */
export function recordVisit(today: string = isoDate()): void {
  const days = readJSON<string[]>(KEYS.activity, []);
  if (days.includes(today)) return;
  days.push(today);
  days.sort();
  writeJSON(KEYS.activity, days.slice(-MAX_DAYS_KEPT));
}

export function getProgress(): Progress {
  return { exercisesCompleted: [], topicsRead: [], ...readJSON<Partial<Progress>>(KEYS.progress, {}) };
}

export function getActivitySummary(today: string = isoDate()): ActivitySummary {
  const days = new Set(readJSON<string[]>(KEYS.activity, []));
  const progress = getProgress();

  // Current streak: count back from today (or yesterday, so the streak
  // isn't shown as broken before today's visit is recorded).
  let currentStreak = 0;
  let cursor = days.has(today) ? today : addDays(today, -1);
  while (days.has(cursor)) {
    currentStreak++;
    cursor = addDays(cursor, -1);
  }

  // Best streak across all recorded days.
  let bestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...days].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = d;
  }

  const lastWeek = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, active: days.has(date) };
  });

  return {
    daysActive: days.size,
    currentStreak,
    bestStreak,
    exercisesDone: progress.exercisesCompleted.length,
    topicsRead: progress.topicsRead.length,
    lastWeek,
  };
}
