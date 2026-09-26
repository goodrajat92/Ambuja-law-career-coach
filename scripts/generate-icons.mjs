#!/usr/bin/env node
/**
 * Regenerates public/icons/*.png from the SVG sources (public/favicon.svg,
 * public/icon-maskable.svg) whenever the brand mark changes. Not part of
 * the build — run manually: `npm run gen:icons`.
 *
 * Uses Playwright (a dev dependency already pulled in for this project's
 * own screenshot-based QA) to rasterize the SVG at exact pixel sizes,
 * rather than adding an image-processing dependency just for this.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const outDir = 'public/icons';
const targets = [
  { svg: 'public/favicon.svg', size: 192, file: 'icon-192.png' },
  { svg: 'public/favicon.svg', size: 512, file: 'icon-512.png' },
  { svg: 'public/favicon.svg', size: 180, file: 'apple-touch-icon.png' },
  { svg: 'public/icon-maskable.svg', size: 512, file: 'icon-maskable-512.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const t of targets) {
  const svg = readFileSync(t.svg, 'utf-8');
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg.replace('<svg ', `<svg width="${t.size}" height="${t.size}" `)}</body></html>`);
  await page.locator('svg').screenshot({ path: `${outDir}/${t.file}` });
  console.log('wrote', `${outDir}/${t.file}`);
}

await browser.close();
