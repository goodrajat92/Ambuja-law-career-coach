#!/usr/bin/env node
/**
 * Daily news fetch pipeline (Phase 2, CLAUDE.md §5).
 *
 * Reads src/data/news-sources.json, pulls each source's feed/API, tags
 * country + category, dedupes by URL, and writes a snapshot to
 * src/data/news/YYYY-MM-DD.json (today, in IST). Then prunes snapshots
 * older than 90 days.
 *
 * A source that is down or changes shape must never fail the whole
 * build: every source is wrapped in try/catch and just logged + skipped.
 *
 * No dependencies beyond Node's built-ins: sources are small, well-formed
 * RSS/Atom feeds or JSON APIs, so a couple of tiny regex-based parsers are
 * enough and keep this script dependency-free per CLAUDE.md's "keep
 * dependencies minimal" rule.
 *
 * Copyright rule: we only ever keep a headline, a short excerpt from the
 * feed's own teaser/summary field (never the full article body), and a
 * link back to the source. scripts/ai-enrich.mjs can later replace the
 * excerpt with a short original summary.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'src/data/news-sources.json');
const NEWS_DIR = path.join(ROOT, 'src/data/news');

const RETENTION_DAYS = 90;
const MAX_ITEMS_PER_SOURCE = 15;
const FETCH_TIMEOUT_MS = 15_000;

/** 'YYYY-MM-DD' for a Date, in IST (matches src/lib/dates.ts's isoDate()). */
function isoDateIST(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// ---- Category keyword rules --------------------------------------------
// Matched against "title. excerpt" in lowercase. First match wins; order
// matters, so more specific categories are listed before general ones.
// Keep in sync with newsCategories slugs in src/data/taxonomy.ts.
const CATEGORY_RULES = [
  ['securities', ['sebi', 'ipo', 'listing obligation', 'lodr', 'icdr', 'sast', 'insider trading', 'pit regulations', 'alternative investment fund', ' aif ', 'stock exchange', 'nse', 'bse']],
  ['fema-fdi', ['fema', 'fdi ', 'foreign direct investment', 'external commercial borrowing', ' ecb ', 'overseas direct investment', ' odi ', 'foreign exchange management']],
  ['vc-pe', ['venture capital', 'private equity', 'angel investor', 'series a', 'series b', 'series c', 'funding round', 'term sheet']],
  ['startups', ['startup', 'unicorn', 'dpiit', 'founder']],
  ['mna', ['merger', 'acquisition', 'amalgamation', 'demerger', 'takeover', 'm&a']],
  ['competition', ['competition commission', ' cci ', 'antitrust', 'combination regulation', 'deal value threshold']],
  ['insolvency', ['insolvency', 'bankruptcy code', ' ibc ', 'nclt', 'resolution plan', 'liquidation', 'insolvency professional']],
  ['tax', [' gst ', 'income tax', 'stamp duty', 'cbdt', 'transfer pricing', 'tax tribunal']],
  ['data-tech', ['dpdp', 'data protection', 'artificial intelligence', 'ai regulation', 'it act', 'cybersecurity', 'data privacy']],
  ['arbitration', ['arbitration', 'conciliation', 'arbitral tribunal', 'arbitral award']],
  ['company-law', ['companies act', ' mca ', 'registrar of companies', ' roc ', 'board resolution', 'annual general meeting', 'shareholder']],
  ['regulatory', ['circular', 'notification', 'guidelines', 'press release', 'consultation paper']],
];

function categorize(title, excerpt, fallback) {
  const haystack = ` ${title} ${excerpt} `.toLowerCase();
  for (const [category, keywords] of CATEGORY_RULES) {
    if (keywords.some((k) => haystack.includes(k))) return category;
  }
  return fallback || 'other';
}

// ---- Tiny XML helpers (no dependency) -----------------------------------
function decodeEntities(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function stripTags(str = '') {
  return decodeEntities(str.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * Parses a feed's date string, tolerating the odd non-standard format
 * (e.g. SEBI's "24 Sep, 2026 +0530", with no time and a stray comma).
 * Returns an ISO string, or null if the date truly can't be read.
 */
function parseDate(raw) {
  if (!raw) return null;
  let d = new Date(raw);
  if (isNaN(d.getTime())) {
    d = new Date(raw.replace(',', ''));
  }
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function tagContent(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

/** Parses RSS <item> and Atom <entry> feeds without a dependency. */
function parseFeed(xml) {
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = [...xml.matchAll(isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);

  return blocks.map((block) => {
    const title = stripTags(tagContent(block, 'title'));
    let link = tagContent(block, 'link');
    if (isAtom || !link) {
      const hrefMatch = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i);
      if (hrefMatch) link = hrefMatch[1];
    }
    const pubRaw = tagContent(block, 'pubDate') || tagContent(block, 'published') || tagContent(block, 'updated') || tagContent(block, 'dc:date');
    // Some feeds (e.g. ESMA) carry no date tag at all, only an embedded
    // <time datetime="..."> inside the (escaped) HTML description.
    const embeddedDatetime = block.match(/datetime=(?:&quot;|")([^"&]+)/);
    const publishedAt = parseDate(pubRaw) || (embeddedDatetime && parseDate(embeddedDatetime[1]));
    const excerptRaw = tagContent(block, 'description') || tagContent(block, 'summary') || tagContent(block, 'content');
    const excerpt = stripTags(excerptRaw).slice(0, 220);
    return { title, link: link.trim(), publishedAt, excerpt };
  });
}

function parseFederalRegister(json) {
  const data = JSON.parse(json);
  return (data.results || []).map((r) => ({
    title: r.title || '',
    link: r.html_url || '',
    publishedAt: r.publication_date ? new Date(r.publication_date).toISOString() : null,
    excerpt: (r.abstract || '').slice(0, 220),
  }));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CounselCompassBot/1.0; +https://goodrajat92.github.io/Ambuja-law-career-coach/)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function canonicalUrl(u) {
  try {
    const parsed = new URL(u);
    parsed.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return u;
  }
}

async function fetchSource(source) {
  const raw = await fetchWithTimeout(source.url);
  const items = source.format === 'federal-register' ? parseFederalRegister(raw) : parseFeed(raw);

  return items
    .filter((it) => it.title && it.link)
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((it) => ({
      id: canonicalUrl(it.link),
      headline: it.title,
      link: it.link,
      publishedAt: it.publishedAt || new Date().toISOString(),
      sourceName: source.name,
      country: source.country,
      category: categorize(it.title, it.excerpt, source.defaultCategory),
      summary: it.excerpt,
    }));
}

async function main() {
  const sources = JSON.parse(await readFile(SOURCES_PATH, 'utf-8'));
  const byId = new Map();

  for (const source of sources) {
    try {
      const items = await fetchSource(source);
      for (const item of items) byId.set(item.id, item);
      console.log(`[fetch-news] ${source.name}: ${items.length} item(s)`);
    } catch (err) {
      // A down or changed source must never fail the whole build.
      console.warn(`[fetch-news] SKIPPED ${source.name} (${source.url}): ${err.message}`);
    }
  }

  const items = [...byId.values()].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  await mkdir(NEWS_DIR, { recursive: true });
  const today = isoDateIST();
  await writeFile(path.join(NEWS_DIR, `${today}.json`), JSON.stringify(items, null, 2) + '\n');
  console.log(`[fetch-news] wrote ${items.length} item(s) to src/data/news/${today}.json`);

  // Prune snapshots older than RETENTION_DAYS.
  const cutoff = Date.now() - RETENTION_DAYS * 86_400_000;
  const files = await readdir(NEWS_DIR).catch(() => []);
  for (const file of files) {
    const m = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m) continue;
    if (new Date(`${m[1]}T00:00:00Z`).getTime() < cutoff) {
      await unlink(path.join(NEWS_DIR, file));
      console.log(`[fetch-news] pruned ${file} (older than ${RETENTION_DAYS} days)`);
    }
  }
}

main().catch((err) => {
  // Even an unexpected top-level failure should not fail the build: log
  // and exit 0 so `npm run build` still runs off whatever data exists.
  console.error('[fetch-news] unexpected failure:', err);
});
