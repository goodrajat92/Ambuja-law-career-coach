/**
 * Service worker: offline reading for already-visited pages (Phase 7,
 * CLAUDE.md's "PWA ... offline reading").
 *
 * Strategy, deliberately simple for a static, content-updating site:
 *  - Navigations (page loads): network-first, so visitors always get
 *    today's content when online; cache is only the offline fallback.
 *    Each successful navigation is cached as it's served, so the pages
 *    someone has actually read become available offline.
 *  - Static assets (JS/CSS/fonts/images): cache-first, since a given
 *    build's asset files are content-hashed and never change under a
 *    given filename.
 *
 * Bump CACHE_VERSION when this file's strategy changes; old caches are
 * removed on activate.
 */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `counsel-compass-${CACHE_VERSION}`;
const BASE = self.registration.scope; // e.g. https://…/Ambuja-law-career-coach/
const OFFLINE_URL = `${BASE}offline`;
const PRECACHE = [OFFLINE_URL, `${BASE}manifest.webmanifest`];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
    )
  );
});
