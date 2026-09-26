/**
 * "Mark as read" for Learn topics — extends the progress object already
 * used by the streak widget (src/lib/activity.ts).
 */
import { KEYS, readJSON, writeJSON } from './storage';
import type { Progress } from './activity';

function getProgress(): Progress {
  return { exercisesDone: 0, topicsRead: [], ...readJSON<Partial<Progress>>(KEYS.progress, {}) };
}

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
