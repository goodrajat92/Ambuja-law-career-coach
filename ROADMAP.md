# ROADMAP

Progress against the phases in `CLAUDE.md` §7, plus a running backlog of ideas.
Update this file whenever a feature is finished.

## Phase status

All 7 phases are built and live. What follows is a record of what shipped in
each, plus the handful of things intentionally left as future work (this
file, not silence, is where those live — see "Deliberately not done" below).

- [x] **Phase 0 — Foundation**
  - Astro 7 + TypeScript + Tailwind CSS 4 scaffolded
  - Design tokens for light/dark themes (`src/styles/global.css`), no flash of the wrong theme
  - `BaseLayout` with header, footer, and responsive nav driven by `src/data/nav.ts`
  - `astro.config.mjs` `site`/`base` set for GitHub Pages; `src/lib/links.ts` wraps every internal link
  - `.github/workflows/build-deploy.yml`: one workflow, daily cron (6:00 AM IST) + push + manual, builds and deploys
- [x] **Phase 1 — Home and quotes**
  - Quote of the Day, deterministic by IST date (`src/lib/quotes.ts`, `src/data/quotes.json`)
  - **272 well-attributed quotes.** Grown from an initial 86 in one pass, then every entry that carried a hedge ("attributed to," "disputed origin," "widely circulated") was individually reviewed and either fixed to a real citation or removed — 23 famous-but-unverifiable quotes (fake Einstein/Gandhi/Buddha/Confucius lines that circulate constantly online) were cut rather than shipped with a caveat, since a hedged attribution isn't a well-attributed one. Short of 365; growing it further means finding and verifying more genuine quotes, not just relaxing that bar.
  - Navigation cards, streak/progress widget (`StreakWidget.astro`, `src/lib/activity.ts`)
- [x] **Phase 2 — News**
  - Fetch pipeline (`scripts/fetch-news.mjs`) — dependency-free RSS/Atom + JSON API parser, dedupes by URL, keyword-categorizes, writes `src/data/news/YYYY-MM-DD.json`, prunes >90 days, never fails the build on a down source
  - 8 verified working sources (`src/data/news-sources.json`): Bar & Bench, SCC Online Blog, RBI, SEBI (India); SCOTUSblog, US Federal Register (US); UK FCA; ESMA (EU)
  - News page (`NewsExplorer.astro`): client-side filters for region, category, date range, source, plus keyword search; top headlines wired into Home
  - **LiveLaw, MCA, IFSCA and Singapore's MAS were investigated in depth and don't have a working public feed right now** — LiveLaw's feed 500s server-side, MCA's press-release endpoint returns 403 to non-browser requests, IFSCA has no discoverable RSS endpoint, and MAS's feed URLs serve an HTML landing page instead of XML. PIB (India's Press Information Bureau) was also tried as a possible substitute; its RSS works but needs a ministry-specific region ID that isn't documented, and what was reachable returned unrelated general news, not MCA-specific releases. None of these were forced in — a broken or noisy source would violate CLAUDE.md's own "verify it actually works" rule more than leaving it out does. Revisit if any of these sites change their public feed setup.
  - `scripts/ai-enrich.mjs` (see Phase 7) is written and wired into the workflow, ready for the day an `ANTHROPIC_API_KEY` secret is added
- [x] **Phase 3 — Learn**
  - Content collection schema (`src/content.config.ts`, Zod, Astro Content Layer API)
  - Listing page with client-side filters (category, level, tag, search) — `LearnExplorer.astro`
  - Topic page: key-takeaways box, disclaimer, sources, related topics, reading time, last-reviewed date
  - "Mark as read" wired to the same progress object the streak widget reads (`src/lib/progress.ts`); "Continue learning" on Home points at the last real topic opened
  - **14 topics, covering all 13 Learn categories** (several categories have more than one). Every statute section, regulation name/date, and figure was checked against a primary or clearly reliable source before writing — Companies Act s.43, SEBI ICDR 2018, FEMA NDI Rules 2019, Indian Contract Act ss.124-125, IBC s.12, Competition (Amendment) Act 2023's Deal Value Threshold, the Finance (No. 2) Act 2024's angel-tax abolition, the DPDP Act 2023, BALCO v. Kaiser Aluminium, and the IFSCA Fund Management Regulations 2022. Each topic marks genuinely time-sensitive details with "TODO: verify" rather than guessing.
- [x] **Phase 4 — Practice**
  - Content collection schema (`practice`, in `src/content.config.ts`)
  - Exercise template (`ExerciseWorkspace.astro`): autosaved writing area, optional stopwatch, self-assessment rubric, model answer hidden until revealed, self-score saved to progress
  - **14 exercises, 2 per sub-tab** (drafting, contract review, research & memos, client communication, negotiation, case & deal analysis, quizzes & flashcards) — several linking back to the newer Learn topics (deal value threshold, angel tax, DPDP, arbitration seat/venue)
  - Home's daily practice prompt now picks a **specific exercise** (deterministic by date, across the full pool), not just a sub-tab
- [x] **Phase 5 — Notes**
  - Storage interface (`NotesStore` in `src/lib/notesDb.ts`) backed by IndexedDB, designed so a future cloud-sync backend can implement the same interface without touching the UI
  - Dependency-free Markdown renderer (`src/lib/markdown.ts`) — escapes HTML first, then re-adds only headings/bold/italic/code/links/lists
  - Full CRUD, tag filter, keyword search, export (downloads JSON) and import (merges a JSON file) — `src/lib/notesApp.ts` + `src/pages/notes/index.astro`
  - "Save to notes" wired into News (per item), Learn (per topic), and Practice (save your own answer) — `SaveToNotes.astro`
  - Verified end-to-end with Playwright: save-from-News → appears in Notes → create → search-filter → export → delete → reload-persists, no console errors
- [x] **Phase 6 — Think Ahead**
  - `trends` content collection (Zod), shared by trend briefs and career paths
  - 3 trend briefs (GIFT City/IFSCA, AI in legal practice, reading a down market) and 3 career paths (partner track, in-house/GC, fund counsel), each linking back into Learn/Practice
  - Skills roadmap: 5 stages, data-driven (`src/data/skills-roadmap.json`), linking into real Learn/Practice pages
  - Reading list (`src/data/reading-list.json`, 8 items)
  - Weekly reflection: 10 prompts, rotates once a week (deterministic, `pickForWeek` in `src/lib/daily.ts`), answer autosaves as a draft and saves to Notes on request
- [x] **Phase 7 — Polish**
  - Pagefind search (`npm run build` chains `pagefind --site dist`): a `/search` page using Pagefind's Default UI, themed to match the site's tokens, scoped to `<main>` via `data-pagefind-body`, with a search icon in the header at every breakpoint
  - PWA: `manifest.webmanifest`, real PNG icons generated from the SVG source (`npm run gen:icons`, via Playwright), and a service worker (`public/sw.js`) — network-first for pages, cache-first for hashed static assets, with an offline fallback page
  - Lighthouse audit (mobile, simulated throttling) across every page type: **Accessibility 100, Best Practices 100, SEO 100 everywhere**; Performance 94–99
  - Fixed everything the audit surfaced rather than just reading the score: 7 unlabeled form controls, a skipped heading level, 4 category tag colors under 4.5:1 contrast in light mode, and a real, previously-invisible bug where `Icon.astro` silently dropped passthrough attributes (so `MarkAsRead`'s icon-color toggle was a no-op on every click)
  - `scripts/ai-enrich.mjs`: optional Claude API news enrichment, gracefully skipping (exit 0) when `ANTHROPIC_API_KEY` is unset — deliberately scoped to news only, since unsupervised AI writing new Learn/Practice/Think Ahead content would conflict with this project's "never fabricate" rule

## Deliberately not done

Left out on purpose, with the reasoning, rather than silently skipped:

- **365+ quotes.** At 272, short of the target — see Phase 1 above for why (quality bar, not effort).
- **LiveLaw / MCA / IFSCA / Singapore MAS news feeds.** No working public feed found after real investigation — see Phase 2 above.
- **Auto-generating Learn/Practice/Think Ahead content with AI.** `ai-enrich.mjs` only touches news summaries. Legal content here is written and source-checked by a person (or an assistant whose citations are then checked), on purpose.
- **Pagefind's newer "Component UI"** (vs. the Default UI used here) would allow more customization/accessibility polish — non-urgent, since Pagefind's own docs say the Default UI is fully supported.

## Notes for whoever picks this up next

- Add a tab/sub-tab in **one place**: `src/data/nav.ts`. Everything else (header, mobile bottom bar, sub-tab bars, home cards) reads from it.
- Add an icon in **one place**: `src/lib/icons.ts`, then use `<Icon name="..." />`.
- All colors are CSS variables in `src/styles/global.css` (`--bg`, `--surface`, `--primary`, `--cat-1..8`, ...). Never hardcode a color in a component.
- Internal links always go through `url()` from `src/lib/links.ts` so the GitHub Pages base path is included.
- The GitHub repo is `goodrajat92/Ambuja-law-career-coach`; the site is live at `https://goodrajat92.github.io/Ambuja-law-career-coach/`, deploying automatically from `main` via the Actions workflow.

## Backlog / ideas (unscheduled)

- Spaced-repetition scheduling for quiz/flashcard exercises
- Optional Supabase-backed cloud sync for Notes (the storage interface is already designed to allow swapping in `src/lib/notesDb.ts`)
- A "this week in deals" digest combining News + Think Ahead
- More Learn topics and Practice exercises — the categories are all covered now, but each can hold much more over time
