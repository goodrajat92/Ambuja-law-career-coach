# CLAUDE.md — Project Context

Read this file fully at the start of every session. It is the source of truth for this project.

---

## 1. What We're Building

A personal **career and growth coach website** for a corporate lawyer in India.

- **User:** Early-career lawyer at a Gurugram law firm, working in **investment, venture capital, and startup law**.
- **Goal:** Grow her career and develop holistically: legal knowledge, drafting skills, business acumen, awareness of trends, and daily motivation.
- **Nature:** Learning project that grows over time. New features get added often, so **everything must be modular and extensible**. Never rebuild from scratch.
- **Privacy:** The repo is public. Do not put personal details (name, employer, age) anywhere in code or content.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Astro** (latest stable), TypeScript |
| Styling | **Tailwind CSS** + `@tailwindcss/typography` |
| Content | Astro **content collections** (Markdown/MDX with typed frontmatter) |
| Interactivity | Small **Astro islands** (vanilla TS or Preact only where needed) |
| Hosting | **GitHub Pages** (public repo) |
| Automation | **GitHub Actions** (daily cron + deploy on push) |
| Search | **Pagefind** (static search, added in a later phase) |
| Personal data (notes, progress) | **Browser storage** (localStorage / IndexedDB), with export/import |
| Optional AI | Claude API, called **only from GitHub Actions**, never from the browser |

### Hard Constraints
- **Static site only.** There is no server or backend.
- **No API keys in the frontend.** Secrets live only in GitHub Actions secrets.
- **`astro.config.mjs` must set `site` and `base`** correctly for GitHub Pages (`https://<user>.github.io/<repo>`). All internal links must use the base path. Use a helper for this.
- **Keep dependencies minimal.** Justify any new package.

---

## 3. Site Structure (Tabs)

Navigation is driven by one config file: `src/data/nav.ts`. **Adding a tab or sub-tab = adding one entry there.**

### 3.1 Home (`/`)
- **Quote of the Day** from famous personalities, rotated deterministically by date (same quote all day, changes daily).
  - Source: `src/data/quotes.json` with `{ text, author, context? }`.
  - Only well-attributed quotes. Aim for 365+ entries eventually.
- **Today's top legal news:** 3–5 headlines linking to the News tab.
- **Today's practice prompt:** Links to Practice.
- **Continue learning:** The last viewed Learn topic (from localStorage).
- **Streak and progress widget:** Days active, exercises done (localStorage).
- **Quick navigation cards** to every tab.

### 3.2 Learn (`/learn`)
A structured library of laws, concepts, and skills. Content collection: `src/content/learn/`.

**Categories (initial):**
- **Company law:** Companies Act 2013, share capital, board and shareholder matters
- **Securities and capital markets:** SEBI regulations (ICDR, LODR, SAST, PIT, AIF)
- **Foreign investment:** FEMA, FDI policy, pricing guidelines, ODI
- **Venture capital and startup deals:** Term sheets, SHA/SSA, CCPS/CCDs, convertible notes, ESOPs, cap tables, liquidation preference, anti-dilution
- **M&A and due diligence**
- **Competition law:** Merger control, deal value threshold
- **Insolvency (IBC)**
- **Contracts:** Indian Contract Act, boilerplate, indemnities, reps and warranties
- **Tax basics for deals:** Stamp duty and investment-related tax
- **Data protection and tech:** DPDP Act 2023, IT law, AI regulation
- **Dispute resolution:** Arbitration and Conciliation Act
- **GIFT City / IFSC**
- **Business skills for lawyers:** Reading financials, valuation basics, negotiation, client management

**Topic frontmatter:**
```yaml
title: string
category: string
level: beginner | intermediate | advanced
tags: string[]
summary: string
readingTime: number
lastReviewed: date
sources: { title: string, url: string }[]   # primary sources: statutes, SEBI/RBI/MCA sites
related: string[]                           # slugs of related topics
```

**Features:** Filter by category, level, and tags. "Mark as read." Key-takeaways box. Related topics. Link to matching practice exercises.

**Accuracy rules:** Laws change. Cite primary sources, show `lastReviewed`, and show an "Educational only, not legal advice; verify current law" note on every topic. Never invent section numbers or citations. If unsure, leave a `TODO: verify` marker.

### 3.3 Practice (`/practice`)
Hands-on skill building, organized as **sub-tabs**. Content collection: `src/content/practice/`.

**Sub-tabs (initial):**
- **Drafting:** Clauses and documents (NDA, term sheet, SHA clauses such as ROFR, tag/drag-along, anti-dilution, board rights; board resolutions; legal notices)
- **Contract review:** Spot issues in a flawed clause or agreement
- **Legal research and memos:** Research a question and write a memo
- **Client communication:** Emails explaining legal points in plain language
- **Negotiation scenarios:** Investor vs. founder positions
- **Case and deal analysis:** Break down a judgment or transaction
- **Quizzes and flashcards:** Quick recall, with spaced repetition later

**Exercise frontmatter:**
```yaml
title: string
subTab: drafting | review | research | communication | negotiation | analysis | quiz
difficulty: easy | medium | hard
timeMinutes: number
skills: string[]
relatedLearn: string[]
```

**Exercise page layout:** Brief/scenario → instructions → a writing area (autosaved to localStorage) → timer (optional) → self-assessment **rubric checklist** → **model answer** (hidden until revealed) → self-score saved to progress.

**Daily practice prompt:** Chosen deterministically by date from the exercise pool (optionally AI-generated; see §5).

### 3.4 News (`/news`)
Daily legal news from India and around the world.

- **Filters:** Country/region (India, US, UK, EU, Singapore, Global), **category**, **date range**, source, plus keyword search.
- **Categories:** Securities/SEBI, VC and PE, Startups, M&A, FEMA/FDI, Company law, Competition, Tax, Data and tech/AI, Arbitration, Insolvency, Regulatory updates, Other.
- **Each item:** Headline, source, date, country, category, **short original summary**, link to the original.
- **Copyright rule:** Never store or display full article text. Headline, a short original summary, and a link only.
- Filtering is done client-side over JSON data.
- **Keep about 90 days** of archive and prune older files automatically.

### 3.5 Think Ahead (`/think-ahead`)
Trends, foresight, and career strategy. Content collection: `src/content/trends/`.

- **Trend briefs:** AI in law and legaltech, the startup funding climate, GIFT City, regulatory direction, cross-border deals
- **Career paths:** Partner track, in-house/GC, fund counsel, policy, legaltech
- **Skills roadmap:** What to learn next, with links into Learn and Practice
- **Reading list:** Books, newsletters, podcasts
- **Weekly reflection prompts:** Answers are saved to Notes
- **Optional:** A weekly AI-generated "what's changing" brief built from the past week's news (see §5)

### 3.6 Notes (`/notes`)
A personal notebook. **Private data stays in the browser.**

- **Notes:** Create, edit, and delete notes with Markdown support, title, tags, and timestamps
- **Search and filter** by tag
- **"Save to notes"** buttons on news items, Learn topics, and practice answers (stores a link and excerpt)
- **Storage:** IndexedDB (or localStorage for v1)
- **Export and import** notes as JSON. This is critical because browser data can be lost.
- Show a clear notice: "Notes are stored on this device only."
- **Future:** Optional cloud sync (e.g., Supabase) for phone and laptop sync. Design the storage layer behind an interface so it can be swapped.

---

## 4. Design System

### Look and Feel
- **Modern, clean, and visually attractive.** Professional, but not stuffy.
- **Generous whitespace, soft rounded cards, subtle shadows, smooth micro-interactions.** Respect `prefers-reduced-motion`.
- **A calm, focused reading experience** for long content.

### Themes
- **Light and dark** themes, plus a toggle in the header.
- **Default:** Follow system preference. The user's choice persists in localStorage.
- **No flash of the wrong theme:** Set the theme with an inline script in `<head>` before paint.
- **Colors:** Define all colors as CSS variables / Tailwind tokens (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`, etc.). **Never hardcode colors in components.**

### Suggested Palette (adjustable)
- **Primary:** Deep indigo/navy for trust and professionalism
- **Accent:** Warm amber/gold for highlights, streaks, and quotes
- **Category colors:** A small, consistent set for news and learn tags
- **Contrast:** Must pass **WCAG AA** in both themes

### Typography
- **UI and body:** Inter (or similar sans), self-hosted via `@fontsource`
- **Headings and quotes:** An elegant serif (e.g., Fraunces or Source Serif) for a legal and editorial feel
- **Long-form content:** Use Tailwind `prose` with a comfortable line length (about 70ch)

### Responsive (mobile-first, mandatory)
- **Every page must work on phone (360px+), tablet, and laptop.**
- **Navigation:** A top nav on desktop, and a **bottom tab bar or hamburger menu** on mobile.
- **Layouts:** Cards go from one column on mobile to a grid on larger screens.
- **Tap targets:** At least 44px. No horizontal scrolling on the page body; wide tables scroll inside their own container.
- **Before finishing any feature:** Check it at mobile and desktop widths **and** in both themes.

### Accessibility
- Semantic HTML, keyboard navigable, visible focus states, alt text, and ARIA only where needed.

---

## 5. Automation (GitHub Actions)

### One Workflow: `.github/workflows/build-deploy.yml`
- **Triggers:** `push` to `main`, `schedule` (daily at **00:30 UTC = 6:00 AM IST**), and `workflow_dispatch` (manual run).
- **Steps on schedule or manual run:**
  1. Fetch news
  2. (Optional) Summarize and categorize with the Claude API
  3. Update the daily practice prompt
  4. Commit data
  5. **Build and deploy to GitHub Pages in the same run**
- **Why one workflow:** Commits made by the Action's `GITHUB_TOKEN` do **not** trigger other workflows, so fetch, build, and deploy must all be in one workflow.
- **Concurrency:** Use a concurrency group to avoid overlapping deploys.

### News Pipeline: `scripts/fetch-news.mjs`
- **Sources** live in config at `src/data/news-sources.json` (`{ name, url, type: rss|api, country, defaultCategory }`). Adding a source = adding a JSON entry.
- **Starting sources to evaluate** (verify that each feed or API actually works and that its terms allow this use):
  - **India:** LiveLaw, Bar & Bench, SCC Online Blog, SEBI, RBI, and MCA press releases/updates, plus IFSCA
  - **Global:** SCOTUSblog, CourtListener API, US Federal Register API, UK and EU regulators
- **Processing:**
  - Dedupe by URL
  - Tag country and category (keyword rules first; AI optional)
  - Write `src/data/news/YYYY-MM-DD.json`
  - Prune files older than 90 days
- **Failure handling:** Must not fail the whole build if one source is down. Log it and continue.

### Optional AI Step: `scripts/ai-enrich.mjs`
- **Uses the Claude API** with the key in secret `ANTHROPIC_API_KEY` and the model set by env var `ANTHROPIC_MODEL`. Default to a small, cheap model.
- **Tasks:**
  - Write a 1–2 sentence original summary per news item
  - Assign a category
  - Generate the daily practice prompt
  - Generate the weekly trend brief
- **Graceful fallback:** If the key is missing or a call fails, the site still builds without AI output.
- **Keep costs low:** Batch items and cap tokens.

---

## 6. Project Structure

```
/
├─ CLAUDE.md                 # this file
├─ ROADMAP.md                # ideas backlog + phase status (keep updated)
├─ astro.config.mjs
├─ .github/workflows/build-deploy.yml
├─ scripts/
│  ├─ fetch-news.mjs
│  └─ ai-enrich.mjs
├─ src/
│  ├─ components/            # reusable UI (Card, Tag, FilterBar, ThemeToggle, QuoteCard...)
│  ├─ layouts/               # BaseLayout, ContentLayout
│  ├─ lib/                   # helpers: dates, storage interface, base-path links, daily rotation
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ learn/
│  │  ├─ practice/
│  │  ├─ news/
│  │  ├─ think-ahead/
│  │  └─ notes/
│  ├─ content/
│  │  ├─ learn/
│  │  ├─ practice/
│  │  └─ trends/
│  ├─ data/
│  │  ├─ nav.ts
│  │  ├─ quotes.json
│  │  ├─ news-sources.json
│  │  └─ news/               # generated daily JSON
│  └─ styles/                # global.css with theme tokens
└─ public/                   # favicon, icons, manifest
```

---

## 7. Build Phases

Work through these in order. Mark progress in `ROADMAP.md`.

- **Phase 0 — Foundation:**
  - Scaffold Astro, Tailwind, and TypeScript
  - Theme tokens and light/dark toggle
  - BaseLayout
  - Responsive nav driven by `nav.ts`
  - Placeholder pages for all tabs
  - GitHub Pages deploy workflow
  - **Deploy, then verify on phone and laptop**
- **Phase 1 — Home and quotes:**
  - Quote of the Day (seed at least 60 quotes)
  - Navigation cards
  - Layout for the streak and progress widget
- **Phase 2 — News:**
  - Fetch pipeline, daily cron, and JSON data
  - News page with filters (country, category, date, source, search)
  - Top headlines on Home
- **Phase 3 — Learn:**
  - Content collection schema
  - Listing with filters and topic pages
  - Seed about 10 high-quality topics in investment and startup law
- **Phase 4 — Practice:**
  - Sub-tabs and exercise template (editor, timer, rubric, hidden model answer)
  - Seed 2–3 exercises per sub-tab
  - Daily prompt
- **Phase 5 — Notes:**
  - Storage interface (IndexedDB)
  - CRUD, tags, search, and export/import
  - "Save to notes" across the site
- **Phase 6 — Think Ahead:**
  - Trend briefs, career paths, skills roadmap, reading list, reflections
- **Phase 7 — Polish:**
  - Pagefind search
  - **PWA** (installable on phone home screen, offline reading)
  - Lighthouse audit (aim for 90+ on mobile)
  - Optional AI enrichment

---

## 8. Working Rules for Claude Code

1. **One feature per branch.** Keep commits small with clear messages.
2. **Reuse existing components, layouts, and tokens** before creating new ones. Extend; don't rewrite.
3. **`npm run build` must pass** before any feature is considered done.
4. **Check every UI change** at mobile width and desktop width, **in both light and dark themes**.
5. **Never commit secrets.** Never put API keys in client code.
6. **New content types** go into content collections with a typed schema (Zod).
7. **New tabs and sub-tabs** go through `nav.ts`. No hardcoded nav anywhere else.
8. **Legal content must cite primary sources and include the educational disclaimer.** Never fabricate laws, sections, cases, or citations.
9. **Respect copyright:** No copying article text, song lyrics, or book passages. News items are summaries plus links only.
10. **Update `ROADMAP.md`** after finishing a feature, and add new ideas there.
11. **Ask before** large refactors, adding major dependencies, or changing the architecture.
12. **Keep code readable and commented enough** for a learner to follow.
