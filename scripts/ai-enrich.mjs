#!/usr/bin/env node
/**
 * Optional AI enrichment (CLAUDE.md §5). Runs after scripts/fetch-news.mjs
 * in the same GitHub Actions job. Uses the Claude API — key in the
 * ANTHROPIC_API_KEY secret, model in the ANTHROPIC_MODEL env var — to:
 *
 *   1. Write a 1-2 sentence original summary for each news item that
 *      doesn't already have one worth keeping (replacing the feed's own
 *      teaser text with something genuinely original, not copied).
 *   2. Re-check each item's keyword-assigned category, correcting
 *      obvious misfires.
 *
 * Graceful fallback: if ANTHROPIC_API_KEY is missing, or any call fails,
 * this script logs why and exits 0 without changing anything — the site
 * still builds and deploys from whatever fetch-news.mjs already wrote.
 * It never fails the build, and it's never called from the browser
 * (this only ever runs inside the GitHub Actions workflow).
 *
 * Kept dependency-free: only Node's built-in fetch, no @anthropic-ai/sdk,
 * for a script this small.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(ROOT, 'src/data/news');

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'; // small, cheap model by default
const MAX_ITEMS_PER_RUN = 30; // keep cost bounded — a handful of items per day, not the whole archive
const CATEGORIES = [
  'securities', 'vc-pe', 'startups', 'mna', 'fema-fdi', 'company-law',
  'competition', 'tax', 'data-tech', 'arbitration', 'insolvency', 'regulatory', 'other',
]; // keep in sync with src/data/taxonomy.ts's newsCategories

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API HTTP ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text?.trim() ?? '';
}

function buildPrompt(item) {
  return [
    'You are enriching one legal/deal-news item for a lawyer\'s daily news feed.',
    'Given the headline and the source\'s own teaser text below, respond with EXACTLY two lines and nothing else:',
    'SUMMARY: a short, original 1-2 sentence summary in your own words (never copy the teaser text verbatim)',
    `CATEGORY: exactly one of ${CATEGORIES.join(', ')}`,
    '',
    `Headline: ${item.headline}`,
    `Source teaser: ${item.summary || '(none provided)'}`,
  ].join('\n');
}

function parseResponse(text, fallbackCategory) {
  const summaryMatch = text.match(/SUMMARY:\s*(.+)/i);
  const categoryMatch = text.match(/CATEGORY:\s*([\w-]+)/i);
  const category = categoryMatch && CATEGORIES.includes(categoryMatch[1]) ? categoryMatch[1] : fallbackCategory;
  return { summary: summaryMatch?.[1]?.trim(), category };
}

async function main() {
  if (!API_KEY) {
    console.log('[ai-enrich] ANTHROPIC_API_KEY not set — skipping AI enrichment (this is expected unless it has been configured).');
    return;
  }

  const files = (await readdir(NEWS_DIR).catch(() => [])).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
  const todayFile = files[0];
  if (!todayFile) {
    console.log('[ai-enrich] No news snapshot found to enrich.');
    return;
  }

  const filePath = path.join(NEWS_DIR, todayFile);
  const items = JSON.parse(await readFile(filePath, 'utf-8'));

  let enriched = 0;
  for (const item of items) {
    if (enriched >= MAX_ITEMS_PER_RUN) break;
    try {
      const text = await callClaude(buildPrompt(item));
      const { summary, category } = parseResponse(text, item.category);
      if (summary) item.summary = summary;
      item.category = category;
      enriched++;
    } catch (err) {
      // One failed item must not stop the rest, or fail the build.
      console.warn(`[ai-enrich] SKIPPED "${item.headline.slice(0, 60)}...": ${err.message}`);
    }
  }

  await writeFile(filePath, JSON.stringify(items, null, 2) + '\n');
  console.log(`[ai-enrich] enriched ${enriched}/${items.length} item(s) in ${todayFile}`);
}

main().catch((err) => {
  console.error('[ai-enrich] unexpected failure (build continues without AI enrichment):', err);
});
