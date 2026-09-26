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
- [ ] **Phase 4 — Practice:** exercise template (editor, timer, rubric, hidden model answer), 2–3 exercises per sub-tab
- [ ] **Phase 5 — Notes:** IndexedDB storage interface, CRUD, tags, search, export/import
- [ ] **Phase 6 — Think Ahead:** trend briefs, career paths, skills roadmap, reading list, reflections
- [ ] **Phase 7 — Polish:** Pagefind search, PWA, Lighthouse audit, optional AI enrichment

## Notes for whoever picks this up next

- Add a tab/sub-tab in **one place**: `src/data/nav.ts`. Everything else (header, mobile bottom bar, sub-tab bars, home cards) reads from it.
- Add an icon in **one place**: `src/lib/icons.ts`, then use `<Icon name="..." />`.
- All colors are CSS variables in `src/styles/global.css` (`--bg`, `--surface`, `--primary`, `--cat-1..8`, ...). Never hardcode a color in a component.
- Internal links always go through `url()` from `src/lib/links.ts` so the GitHub Pages base path is included.
- The GitHub repo is `goodrajat92/Ambuja-law-career-coach`; the site is `https://goodrajat92.github.io/Ambuja-law-career-coach/`. GitHub Pages needs to be switched to "GitHub Actions" as the source in the repo's Settings → Pages before the workflow can deploy (one-time, manual).

## Backlog / ideas (unscheduled)

- Pagefind full-text search across Learn + Notes
- Spaced-repetition scheduling for quiz/flashcard exercises
- Optional Supabase-backed cloud sync for Notes (storage interface is already designed to allow swapping in `src/lib/storage.ts`)
- A "this week in deals" digest combining News + Think Ahead
