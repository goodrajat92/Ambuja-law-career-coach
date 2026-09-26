/**
 * The Notes page's client-side app (Phase 5). Runs entirely in the
 * browser against IndexedDB (src/lib/notesDb.ts) — there is no server,
 * so this file owns rendering the note list, the create/edit form,
 * search + tag filtering, and export/import.
 *
 * Kept as vanilla TS rather than a UI framework: CLAUDE.md allows a
 * Preact island "where needed", but a single list-with-a-form view like
 * this is small enough to stay dependency-free.
 */
import { indexedDbStore, newNoteId, type Note } from './notesDb';
import { excerpt } from './markdown';
import { icons } from './icons';

/** A tiny inline SVG built from the shared icon path data (src/lib/icons.ts),
 * for the parts of this file that generate raw HTML strings client-side
 * (the <Icon> Astro component only works at build time). */
function svgIcon(name: keyof typeof icons, size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function initNotesApp(root: HTMLElement) {
  const els = {
    list: root.querySelector<HTMLElement>('[data-notes-list]')!,
    empty: root.querySelector<HTMLElement>('[data-notes-empty]')!,
    count: root.querySelector<HTMLElement>('[data-notes-count]')!,
    search: root.querySelector<HTMLInputElement>('[data-notes-search]')!,
    tagFilter: root.querySelector<HTMLSelectElement>('[data-notes-tag-filter]')!,
    newBtn: root.querySelector<HTMLButtonElement>('[data-notes-new]')!,
    exportBtn: root.querySelector<HTMLButtonElement>('[data-notes-export]')!,
    importInput: root.querySelector<HTMLInputElement>('[data-notes-import]')!,
    formWrap: root.querySelector<HTMLElement>('[data-note-form-wrap]')!,
    form: root.querySelector<HTMLFormElement>('[data-note-form]')!,
    formTitle: root.querySelector<HTMLInputElement>('[data-note-form-title]')!,
    formTags: root.querySelector<HTMLInputElement>('[data-note-form-tags]')!,
    formBody: root.querySelector<HTMLTextAreaElement>('[data-note-form-body]')!,
    formHeading: root.querySelector<HTMLElement>('[data-note-form-heading]')!,
    formCancel: root.querySelector<HTMLButtonElement>('[data-note-form-cancel]')!,
  };

  let notes: Note[] = [];
  let editingId: string | null = null;
  let query = '';
  let tagFilter = '';

  async function load() {
    notes = await indexedDbStore.list();
    render();
  }

  function allTags(): string[] {
    return [...new Set(notes.flatMap((n) => n.tags))].sort();
  }

  function filtered(): Note[] {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (tagFilter && !n.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return `${n.title} ${n.body} ${n.tags.join(' ')}`.toLowerCase().includes(q);
    });
  }

  function renderTagOptions() {
    const current = els.tagFilter.value;
    els.tagFilter.innerHTML = '<option value="">All tags</option>' + allTags().map((t) => `<option value="${escapeAttr(t)}">${escapeHtml(t)}</option>`).join('');
    els.tagFilter.value = allTags().includes(current) ? current : '';
  }

  function render() {
    renderTagOptions();
    const visible = filtered();
    els.count.textContent = `${visible.length} of ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;
    els.empty.classList.toggle('hidden', visible.length > 0);
    els.list.innerHTML = visible
      .map((n) => {
        const updated = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(n.updatedAt));
        return `
        <li class="rounded-2xl border border-border bg-surface p-5 shadow-card" data-note-id="${escapeAttr(n.id)}">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-serif text-lg font-semibold text-fg">${escapeHtml(n.title) || 'Untitled'}</h3>
            <div class="flex shrink-0 gap-1.5">
              <button type="button" data-note-edit class="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Edit note">
                ${svgIcon('pen')}
              </button>
              <button type="button" data-note-delete class="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger" aria-label="Delete note">
                ${svgIcon('trash')}
              </button>
            </div>
          </div>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">${escapeHtml(excerpt(n.body))}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>${updated}</span>
            ${n.tags.map((t) => `<span class="rounded-full border border-border bg-surface-2 px-2 py-0.5">${escapeHtml(t)}</span>`).join('')}
            ${n.source ? `<a href="${escapeAttr(n.source.url)}" target="_blank" rel="noopener noreferrer" class="ml-auto font-medium text-primary hover:underline">Source ↗</a>` : ''}
          </div>
        </li>`;
      })
      .join('');
  }

  function openForm(note?: Note) {
    editingId = note?.id ?? null;
    els.formHeading.textContent = note ? 'Edit note' : 'New note';
    els.formTitle.value = note?.title ?? '';
    els.formTags.value = note?.tags.join(', ') ?? '';
    els.formBody.value = note?.body ?? '';
    els.formWrap.classList.remove('hidden');
    els.formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    els.formTitle.focus();
  }
  function closeForm() {
    els.formWrap.classList.add('hidden');
    editingId = null;
    els.form.reset();
  }

  els.newBtn.addEventListener('click', () => openForm());
  els.formCancel.addEventListener('click', closeForm);

  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const existing = editingId ? notes.find((n) => n.id === editingId) : undefined;
    const note: Note = {
      id: editingId ?? newNoteId(),
      title: els.formTitle.value.trim() || 'Untitled',
      body: els.formBody.value,
      tags: els.formTags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      source: existing?.source,
    };
    await indexedDbStore.put(note);
    closeForm();
    await load();
  });

  els.list.addEventListener('click', async (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[data-note-id]');
    if (!li) return;
    const id = li.dataset.noteId!;
    if ((e.target as HTMLElement).closest('[data-note-edit]')) {
      openForm(notes.find((n) => n.id === id));
    } else if ((e.target as HTMLElement).closest('[data-note-delete]')) {
      if (confirm('Delete this note? This can’t be undone.')) {
        await indexedDbStore.remove(id);
        await load();
      }
    }
  });

  els.search.addEventListener('input', () => {
    query = els.search.value;
    render();
  });
  els.tagFilter.addEventListener('change', () => {
    tagFilter = els.tagFilter.value;
    render();
  });

  els.exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `counsel-compass-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as Note[];
      if (!Array.isArray(imported)) throw new Error('Not a notes export file');
      await indexedDbStore.putMany(imported);
      await load();
      alert(`Imported ${imported.length} note(s).`);
    } catch {
      alert('That file doesn’t look like a Counsel Compass notes export.');
    } finally {
      els.importInput.value = '';
    }
  });

  load();
}
