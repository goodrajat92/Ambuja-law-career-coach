# Counsel Compass

A personal career and growth coach website for lawyers working in investment,
venture capital, and startup law. It's a daily dashboard for learning the law
behind deals, practising drafting and negotiation, keeping up with legal news,
and thinking ahead about where the practice is heading.

**Live site: https://goodrajat92.github.io/Ambuja-law-career-coach/**

Built as a learning project that grows in phases — see [ROADMAP.md](ROADMAP.md)
for what's done and what's next.

---

## What's here

| Tab | Purpose |
|---|---|
| **Home** | Daily dashboard: quote of the day, streak/progress, today's practice focus, continue learning, top news, quick nav |
| **Learn** | A structured library of laws and concepts — company law, SEBI/securities, FEMA/FDI, VC deal terms, M&A, competition law, IBC, contracts, tax, data protection, arbitration, GIFT City, business skills |
| **Practice** | Hands-on exercises across 7 sub-tabs: Drafting, Contract review, Research & memos, Client communication, Negotiation, Case & deal analysis, Quizzes & flashcards |
| **News** | Daily legal and deal news from India and abroad, filterable by region and category |
| **Think Ahead** | Trend briefs, career paths, a skills roadmap, reading list, and weekly reflections |
| **Notes** | A private notebook stored only in the browser, with export/import |
| **Search** | Site-wide search (Pagefind) across everything above |

All seven phases in [ROADMAP.md](ROADMAP.md) are built; the file tracks the
smaller gaps still open within each (e.g. the quote list is 86/365+, Learn is
8/~10 topics, Practice is 1/2–3 exercises per sub-tab).

## Tech stack

- **[Astro](https://astro.build)** (static output) + TypeScript
- **Tailwind CSS 4** (via `@tailwindcss/vite`) + `@tailwindcss/typography`
- Self-hosted fonts: **Inter** (UI/body) and **Fraunces** (headings/quotes), via `@fontsource-variable`
- **No backend, no database.** Personal data (theme, streak, notes) lives in the browser — `localStorage` for small state, **IndexedDB** for Notes (`src/lib/notesDb.ts`, behind a storage-agnostic interface so a future cloud sync could implement the same one)
- **[Pagefind](https://pagefind.app)** for static, client-side search (`/search`) — its index is built by a `pagefind` CLI step chained onto `npm run build`, after Astro's own build
- **PWA**: installable, with a service worker (`public/sw.js`) that caches pages you've actually visited for offline reading (network-first, so you always get fresh content when online)
- **GitHub Actions** for the daily news fetch and for building + deploying to **GitHub Pages**
- Optional AI enrichment via the Claude API (`scripts/ai-enrich.mjs`), called only from GitHub Actions — never from the browser, never with a key in client code, and scoped to summarizing/categorizing news only (it does not auto-generate Learn/Practice/Think Ahead content — see that script's own comments for why)

## Getting started

Requires **Node.js ≥ 22.12** (Astro 7's minimum).

```bash
npm install
npm run dev        # http://localhost:4321/Ambuja-law-career-coach/
```

Other scripts:

```bash
npm run build      # astro build, then pagefind indexes dist/ — must pass before any feature is "done"
npm run preview    # serve the production build locally (search and the service worker only work against this, not `dev`)
npm run check      # astro check — type-checks .astro and .ts files
npm run gen:icons   # regenerate public/icons/*.png from the SVG source, if the brand mark changes
```

> The dev/preview URLs include the `/Ambuja-law-career-coach` base path because
> `astro.config.mjs` sets `base` to match where GitHub Pages serves this repo.
> Every internal link goes through the `url()` helper in
> [`src/lib/links.ts`](src/lib/links.ts) so it always includes that base path.

## Project structure

```
src/
├─ components/     # Reusable UI: Card, Tag, PageHeader, SubTabs, Icon, ThemeToggle, ...
├─ layouts/         # BaseLayout — the <head>, theme bootstrap, header/footer/nav shell
├─ lib/             # Helpers: dates, daily rotation, localStorage, links, icons, activity/streaks
├─ pages/           # One folder per tab; practice/[subTab].astro generates the 7 sub-tab pages
├─ data/            # nav.ts (navigation), site.ts, taxonomy.ts (categories), quotes.json
└─ styles/          # global.css — every color as a CSS variable, light + dark themes
public/              # favicon and other static assets
.github/workflows/   # build-deploy.yml — the one CI/CD workflow
scripts/             # fetch-news.mjs, ai-enrich.mjs (Phase 2 — not yet written)
```

### A few conventions worth knowing before editing

- **Add a tab or sub-tab in one place:** [`src/data/nav.ts`](src/data/nav.ts).
  The header, the mobile bottom bar, sub-tab bars, and the home page's
  quick-nav cards all read from this file.
- **Add an icon in one place:** [`src/lib/icons.ts`](src/lib/icons.ts), then
  use `<Icon name="..." />`. Icons are inline SVGs (Lucide-style), so there's
  no icon-font dependency.
- **Never hardcode a color.** Every color is a CSS variable defined once in
  [`src/styles/global.css`](src/styles/global.css) (`--bg`, `--surface`,
  `--primary`, `--cat-1` through `--cat-8`, ...) and mapped to Tailwind
  utilities via `@theme inline`. This is what makes the light/dark theme
  toggle (and the "no flash of the wrong theme" inline script in
  `BaseLayout.astro`) work everywhere at once.
- **Personal data stays in the browser.** `src/lib/storage.ts` is a small,
  crash-safe wrapper around `localStorage`, namespaced with `cc:`. It's
  designed to be swappable for IndexedDB (Notes, Phase 5) or an optional
  cloud sync later, without touching the components that use it.
- **Content collections** (Learn topics, Practice exercises, Think Ahead
  briefs) will use typed Zod schemas once Phases 3–4–6 start.

## Design system

- **Themes:** light and dark, toggled in the header, defaulting to the OS
  preference and persisted in `localStorage`. The theme is applied by an
  inline script in `<head>` before first paint, so there's no flash.
- **Typography:** Inter for UI/body text, Fraunces for headings and quotes,
  long-form content set in Tailwind `prose` at a ~70ch line length.
- **Responsive, mobile-first:** every page is checked at 360px+ (phone),
  tablet, and desktop widths. Navigation is a top bar on desktop and a
  bottom tab bar on mobile; tap targets are at least 44px; the page body
  never scrolls horizontally (a horizontally-scrolling sub-tab bar is the
  one deliberate exception, contained to its own box).
- **Accessibility:** semantic HTML, visible focus rings, a skip-to-content
  link, `prefers-reduced-motion` respected, and WCAG AA contrast in both
  themes.

## Automation (GitHub Actions)

A single workflow, [`.github/workflows/build-deploy.yml`](.github/workflows/build-deploy.yml),
runs on push to `main`, on a daily schedule (00:30 UTC = 6:00 AM IST), and
on demand. On a scheduled or manual run it will (once the scripts below
exist):

1. Fetch news from the sources in `src/data/news-sources.json`
2. Optionally summarize and categorize with the Claude API
   (`ANTHROPIC_API_KEY` secret; graceful no-op if the key is missing)
3. Update the daily practice prompt
4. Commit the refreshed data
5. Build and deploy to GitHub Pages — **in the same run**, because commits
   made by the workflow's own token don't trigger other workflow runs

## Testing tooling

**Playwright** is a dev dependency (not shipped to production — `dist/`
contains none of it). It's used for `npm run gen:icons` and for this
project's own QA during development (overflow sweeps across viewport
widths, full interaction tests of things like the Notes CRUD flow or the
offline service worker) rather than for browsing the live site.

## Content and accuracy rules

This is educational content about Indian and cross-border deal law, so:

- Every Learn topic cites primary sources and shows a "last reviewed" date
- Every Learn topic carries an "Educational only, not legal advice; verify
  current law" disclaimer
- Section numbers, citations, and case names are never invented — an
  uncertain fact is marked `TODO: verify` instead
- News items are a headline, a short **original** summary, and a link to
  the source only — never the full article text (copyright)

## Privacy

This repository is public. No personal details (name, employer, age) about
its author appear anywhere in the code or content, and none should be added.
All API keys live only in GitHub Actions secrets, never in the frontend.

## License

Not yet specified.
