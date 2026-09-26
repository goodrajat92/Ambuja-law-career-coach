/**
 * Small, safe wrapper around localStorage for per-device personal data
 * (theme, streaks, progress, last viewed topic).
 *
 * - Every key is namespaced with 'cc:' so it never clashes with other sites
 *   on the same github.io origin.
 * - Reads/writes never throw: private mode or blocked storage just means
 *   the value isn't remembered.
 *
 * Notes (Phase 5) will get a richer storage interface backed by IndexedDB,
 * so it can later be swapped for cloud sync.
 */

const PREFIX = 'cc:';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}

/** Storage keys used across the site, kept in one place. */
export const KEYS = {
  theme: 'theme', // 'light' | 'dark' (absent = follow system)
  activity: 'activity', // string[] of 'YYYY-MM-DD' days the site was used
  progress: 'progress', // { exercisesDone: number, topicsRead: string[] }
  lastLearn: 'lastLearn', // { title: string, href: string, category?: string }
} as const;
