/**
 * Notes storage — Phase 5.
 *
 * Notes are private, per-device data, so they're kept in IndexedDB (not
 * localStorage: notes can grow large and IndexedDB handles that better).
 *
 * The `NotesStore` interface is deliberately storage-agnostic. Today
 * `indexedDbStore` is the only implementation; CLAUDE.md's plan for
 * optional cloud sync later (e.g. Supabase) means a future
 * `remoteStore` could implement the same interface and the UI
 * (src/pages/notes/index.astro) wouldn't need to change.
 */

export interface Note {
  id: string;
  title: string;
  /** Markdown source — rendered with src/lib/markdown.ts. */
  body: string;
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  /** Set when the note was created via a "Save to notes" button elsewhere on the site. */
  source?: { label: string; url: string };
}

export interface NotesStore {
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | undefined>;
  put(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
  /** Replaces nothing — merges by id (import wins on conflict), used by Import. */
  putMany(notes: Note[]): Promise<void>;
}

const DB_NAME = 'counsel-compass';
const DB_VERSION = 1;
const STORE = 'notes';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

export const indexedDbStore: NotesStore = {
  async list() {
    const all = await withStore<Note[]>('readonly', (s) => s.getAll());
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id) {
    return withStore<Note | undefined>('readonly', (s) => s.get(id));
  },
  async put(note) {
    await withStore('readwrite', (s) => s.put(note));
  },
  async remove(id) {
    await withStore('readwrite', (s) => s.delete(id));
  },
  async putMany(notes) {
    await openDb().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE, 'readwrite');
          const store = tx.objectStore(STORE);
          for (const note of notes) store.put(note);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        })
    );
  },
};

export function newNoteId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Quick-save helper used by "Save to notes" buttons across the site. */
export async function saveQuickNote(input: { title: string; excerpt?: string; url?: string; tag: string }): Promise<void> {
  const now = new Date().toISOString();
  const note: Note = {
    id: newNoteId(),
    title: input.title,
    body: input.excerpt ?? '',
    tags: [input.tag],
    createdAt: now,
    updatedAt: now,
    source: input.url ? { label: input.title, url: input.url } : undefined,
  };
  await indexedDbStore.put(note);
}
