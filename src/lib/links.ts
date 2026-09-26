/**
 * Base-path helpers.
 *
 * The site is served from a sub-path on GitHub Pages (see `base` in
 * astro.config.mjs). Always build internal links with `url()` so they
 * include that base, e.g. url('/learn') -> '/Ambuja-law-career-coach/learn'.
 */

// Astro's BASE_URL may or may not end with '/', so normalise it once.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Prefix an internal path with the site's base path. */
export function url(path = '/'): string {
  const clean = path.replace(/^\/+/, '');
  return clean ? `${BASE}/${clean}` : `${BASE}/`;
}

/** Remove the base path (and trailing slash) from a pathname: '/base/learn/' -> '/learn'. */
export function stripBase(pathname: string): string {
  let p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/**
 * Is `href` (an un-prefixed path like '/learn') the current section?
 * Home only matches exactly; other tabs also match their sub-pages.
 */
export function isActive(currentPathname: string, href: string): boolean {
  const current = stripBase(currentPathname);
  if (href === '/') return current === '/';
  return current === href || current.startsWith(`${href}/`);
}
