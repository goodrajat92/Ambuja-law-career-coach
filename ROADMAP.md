# ROADMAP

Progress against the phases in `CLAUDE.md` §7, plus a running backlog of ideas.
Update this file whenever a feature is finished.

## Phase status

- [x] **Phase 0 — Foundation**
  - Astro 7 + TypeScript + Tailwind CSS 4 scaffolded
  - Design tokens for light/dark themes (`src/styles/global.css`), no flash of the wrong theme
  - `BaseLayout` with header, footer, and responsive nav driven by `src/data/nav.ts`
  - Placeholder pages for every tab and Practice sub-tab (each doubles as a mini roadmap)
  - `astro.config.mjs` `site`/`base` set for GitHub Pages; `src/lib/links.ts` wraps every internal link
  - `.github/workflows/build-deploy.yml`: one workflow, daily cron (6:00 AM IST) + push + manual, builds and deploys
  - Verified: `npm run build` and `astro check` both pass clean; checked at mobile (390px) and desktop (1440px), light and dark
- [ ] **Phase 1 — Home and quotes**
  - [x] Quote of the Day, deterministic by IST date (`src/lib/quotes.ts`, `src/data/quotes.json` — 86 quotes seeded, target 365+)
  - [x] Navigation cards to every tab
  - [x] Streak/progress widget layout (`StreakWidget.astro`), backed by localStorage (`src/lib/activity.ts`)
  - [ ] Grow the quote list toward 365+, well-attributed
- [x] **Phase 2 — News**
  - [x] Fetch pipeline (`scripts/fetch-news.mjs`) — dependency-free RSS/Atom + JSON API parser, dedupes by URL, keyword-categorizes, writes `src/data/news/YYYY-MM-DD.json`, prunes >90 days, never fails the build on a down source
  - [x] 8 verified working sources (`src/data/news-sources.json`): Bar & Bench, SCC Online Blog, RBI, SEBI (India); SCOTUSblog, US Federal Register (US); UK FCA; ESMA (EU)
  - [x] News page (`NewsExplorer.astro`): client-side filters for region, category, date range, source, plus keyword search
  - [x] Top headlines wired into Home
  - [ ] LiveLaw (feed currently 500s), MCA (403s), IFSCA and MAS (no working feed found) — revisit sources
  - [ ] Wire `ai-enrich.mjs` in once Phase 2's optional AI step is written (original 1–2 sentence summaries instead of the feed's own teaser text)
- [x] **Phase 3 — Learn** (mostly done)
  - [x] Content collection schema (`src/content.config.ts`, Zod, Astro Content Layer API)
  - [x] Listing page with client-side filters (category, level, tag, search) — `LearnExplorer.astro`
  - [x] Topic page: key-takeaways box, disclaimer, sources, related topics, reading time, last-reviewed date
  - [x] "Mark as read" wired to the same progress object the streak widget reads (`src/lib/progress.ts`)
  - [x] "Continue learning" on Home now points at the last real topic opened
  - [x] 8 topics seeded, each citing primary sources verified before writing (Companies Act, SEBI ICDR, FEMA NDI Rules, Indian Contract Act, IBC) — see each topic's own "TODO: verify" notes for anything time-sensitive
  - [ ] 2 more topics to reach the ~10 target (e.g. competition law deal-value threshold, GIFT City/IFSC)
  - [ ] Pagefind search across topics (Phase 7)
- [x] **Phase 4 — Practice** (mostly done)
  - [x] Content collection schema (`practice`, in `src/content.config.ts`)
  - [x] Exercise template (`ExerciseWorkspace.astro`): autosaved writing area, optional stopwatch, self-assessment rubric, model answer hidden until revealed, self-score saved to progress
  - [x] Completed exercises feed the same streak/progress widget as Learn's "mark as read" (`src/lib/progress.ts`)
  - [x] 1 exercise per sub-tab seeded (7 total): drafting (ROFR clause), review (indemnity clause), research (CIRP vs scheme memo), communication (client email), negotiation (liquidation preference), analysis (term sheet math), quiz (recall)
  - [ ] 2–3 exercises per sub-tab is the CLAUDE.md target — only 1/sub-tab done so far
  - [ ] Daily practice prompt on Home still rotates through sub-tabs rather than a specific exercise — needs a "prompt of the day" picker once the pool is bigger
- [x] **Phase 5 — Notes**
  - [x] Storage interface (`NotesStore` in `src/lib/notesDb.ts`) backed by IndexedDB, designed so a future cloud-sync backend can implement the same interface without touching the UI
  - [x] Dependency-free Markdown renderer (`src/lib/markdown.ts`) — escapes HTML first, then re-adds only headings/bold/italic/code/links/lists
  - [x] Full CRUD, tag filter, keyword search, export (downloads JSON) and import (merges a JSON file) — `src/lib/notesApp.ts` + `src/pages/notes/index.astro`
  - [x] "Save to notes" wired into News (per item), Learn (per topic), and Practice (save your own answer) — `SaveToNotes.astro`
  - [x] "Notes are stored on this device only" notice
  - Verified end-to-end with Playwright: save-from-News → appears in Notes → create → search-filter → export → delete → reload-persists, no console errors
- [x] **Phase 6 — Think Ahead**
  - [x] `trends` content collection (Zod), shared by trend briefs and career paths
  - [x] 3 trend briefs (GIFT City/IFSCA, AI in legal practice, reading a down market) and 3 career paths (partner track, in-house/GC, fund counsel), each linking back into Learn/Practice where relevant
  - [x] Skills roadmap: 5 stages, data-driven (`src/data/skills-roadmap.json`), linking into real Learn/Practice pages where content exists
  - [x] Reading list (`src/data/reading-list.json`, 8 items)
  - [x] Weekly reflection: 10 prompts, rotates once a week (deterministic, `pickForWeek` in `src/lib/daily.ts`), answer autosaves as a draft and saves to Notes on request
  - [ ] Optional AI-generated weekly "what's changing" brief — deferred to Phase 7's optional AI step
- [x] **Phase 7 — Polish**
  - [x] Pagefind search (`npm run build` chains `pagefind --site dist`): a `/search` page using Pagefind's Default UI, themed to match the site's tokens, scoped to `<main>` via `data-pagefind-body`. Verified end-to-end — searches for "anti-dilution" and "CIRP timeline" return correct, cross-linked results (Learn topics *and* the Practice exercises that reference them)
  - [x] PWA: `manifest.webmanifest`, real PNG icons generated from the SVG source (`npm run gen:icons`, via Playwright — no new image-processing dependency), and a service worker (`public/sw.js`) — network-first for pages (so content stays fresh), cache-first for hashed static assets, with an offline fallback page. Verified end-to-end: registered, activated, caches a visited page, serves it back while offline, and falls back to `/offline` for an unvisited page while offline
  - [x] Lighthouse audit (mobile, simulated throttling) across every page type: **Accessibility 100, Best Practices 100, SEO 100 everywhere**; Performance 94–99 (one outlier reading was re-run and confirmed to be this dev machine's own CPU contention, not a site issue)
  - [x] Fixed 3 real accessibility issues the audit surfaced: 7 unlabeled filter/form `<select>`/`<input>`/`<textarea>` elements (added `aria-label`/`aria-labelledby`), a skipped heading level (h1→h3) on the News/Learn card grids (now h1→h2), and 4 of the 8 category tag colors falling just under 4.5:1 contrast in light mode (darkened 4–12%, imperceptible, all now ≥4.6:1)
  - [x] Fixed a real, previously-invisible bug caught only by listening for page errors during this audit: `Icon.astro` didn't forward passthrough attributes (like `data-mark-read-icon`), so `MarkAsRead`'s icon-color toggle was silently no-op-ing on every click
  - [x] `scripts/ai-enrich.mjs`: optional Claude API news enrichment (original summaries + category correction), gracefully skipping (exit 0) when `ANTHROPIC_API_KEY` is unset — deliberately does **not** auto-generate new Learn/Practice/Think Ahead content, since unsupervised AI writing legal content conflicts with this project's "never fabricate" rule
  - [ ] Pagefind's newer "Component UI" (vs. the Default UI used here) would give more customization/accessibility — worth revisiting later, non-urgent since Default UI is still fully supported

## Notes for whoever picks this up next

- Add a tab/sub-tab in **one place**: `src/data/nav.ts`. Everything else (header, mobile bottom bar, sub-tab bars, home cards) reads from it.
- Add an icon in **one place**: `src/lib/icons.ts`, then use `<Icon name="..." />`.
- All colors are CSS variables in `src/styles/global.css` (`--bg`, `--surface`, `--primary`, `--cat-1..8`, ...). Never hardcode a color in a component.
- Internal links always go through `url()` from `src/lib/links.ts` so the GitHub Pages base path is included.
- The GitHub repo is `goodrajat92/Ambuja-law-career-coach`; the site is live at `https://goodrajat92.github.io/Ambuja-law-career-coach/`, deploying automatically from `main` via the Actions workflow.

## Backlog / ideas (unscheduled)

- Pagefind full-text search across Learn + Notes
- Spaced-repetition scheduling for quiz/flashcard exercises
- Optional Supabase-backed cloud sync for Notes (storage interface is already designed to allow swapping in `src/lib/storage.ts`)
- A "this week in deals" digest combining News + Think Ahead
