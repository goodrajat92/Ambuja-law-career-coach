/**
 * Loads every src/data/news/YYYY-MM-DD.json snapshot at build time and
 * flattens them into one list. Used by the News page and Home's top
 * headlines. Filtering itself happens client-side (see NewsExplorer.astro)
 * over the same data, embedded into the page as JSON.
 */
export interface NewsItem {
  id: string;
  headline: string;
  link: string;
  publishedAt: string;
  sourceName: string;
  country: string;
  category: string;
  summary: string;
}

// import.meta.glob runs at build time; each module is one day's JSON array.
const modules = import.meta.glob<{ default: NewsItem[] }>('../data/news/*.json', { eager: true });

export const newsItems: NewsItem[] = Object.values(modules)
  .flatMap((m) => m.default)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function topHeadlines(n = 5): NewsItem[] {
  return newsItems.slice(0, n);
}
