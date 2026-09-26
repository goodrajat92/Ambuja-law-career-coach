/**
 * "Mark as read" for Learn topics — extends the progress object already
 * used by the streak widget (src/lib/activity.ts).
 */
import { KEYS, readJSON, writeJSON } from './storage';
import { getProgress } from './activity';

export function isTopicRead(slug: string): boolean {
  return getProgress().topicsRead.includes(slug);
}

/** Toggles a topic's read state and returns the new state. */
export function toggleTopicRead(slug: string): boolean {
  const progress = getProgress();
  const isRead = progress.topicsRead.includes(slug);
  progress.topicsRead = isRead ? progress.topicsRead.filter((s) => s !== slug) : [...progress.topicsRead, slug];
  writeJSON(KEYS.progress, progress);
  return !isRead;
}

export function rememberLastLearnTopic(topic: { title: string; href: string; category?: string }): void {
  writeJSON(KEYS.lastLearn, topic);
}

export function isExerciseDone(slug: string): boolean {
  return getProgress().exercisesCompleted.includes(slug);
}

/** Marks an exercise complete. Safe to call more than once (idempotent). */
export function markExerciseDone(slug: string): void {
  const progress = getProgress();
  if (progress.exercisesCompleted.includes(slug)) return;
  progress.exercisesCompleted = [...progress.exercisesCompleted, slug];
  writeJSON(KEYS.progress, progress);
}

/** Per-exercise draft + rubric-checklist state (autosaved as the user works). */
export function readExerciseState(slug: string): { draft: string; checked: boolean[] } {
  return readJSON(`exercise:${slug}`, { draft: '', checked: [] as boolean[] });
}

export function writeExerciseState(slug: string, state: { draft: string; checked: boolean[] }): void {
  writeJSON(`exercise:${slug}`, state);
}
