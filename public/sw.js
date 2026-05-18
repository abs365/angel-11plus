// Angel 11+ Service Worker
// Bump CACHE_VER whenever you need to force a full cache flush on all clients.
const CACHE_VER    = 'v2';
const STATIC_CACHE = `angel-static-${CACHE_VER}`;
const PAGES_CACHE  = `angel-pages-${CACHE_VER}`;
const OFFLINE_PAGE = '/offline.html';
const MAX_PAGES    = 50;

// ── Pre-cache ─────────────────────────────────────────────────────────────────
// Core app shell — fetched & stored at install time so they are available
// offline even on the very first relaunch from the home screen.
const PRECACHE_PAGES = [
  '/',
  '/dashboard',
  '/english',
  '/maths',
  '/vocabulary',
  '/writing',
  '/progress',
  '/mock-test',
  '/offline.html',
];

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing…');

  event.waitUntil(
    (async () => {
      // Cache pages with cache:'reload' so we bypass the HTTP cache and always
      // store fresh HTML at install time (important for Vercel deployments).
      const pagesCache  = await caches.open(PAGES_CACHE);
      const staticCache = await caches.open(STATIC_CACHE);

      const pageResults = await Promise.allSettled(
        PRECACHE_PAGES.map((url) =>
          pagesCache
            .add(new Request(url, { cache: 'reload' }))
            .then(() => console.log('[SW] Precached page:', url))
            .catch((err) => console.warn('[SW] Precache failed for page:', url, err))
        )
      );

      const assetResults = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          staticCache
            .add(new Request(url, { cache: 'reload' }))
            .then(() => console.log('[SW] Precached asset:', url))
            .catch((err) => console.warn('[SW] Precache failed for asset:', url, err))
        )
      );

      const pagesFailed  = pageResults .filter((r) => r.status === 'rejected').length;
      const assetsFailed = assetResults.filter((r) => r.status === 'rejected').length;
      console.log(
        `[SW] Install complete. Pages: ${PRECACHE_PAGES.length - pagesFailed}/${PRECACHE_PAGES.length} cached.`,
        `Assets: ${PRECACHE_ASSETS.length - assetsFailed}/${PRECACHE_ASSETS.length} cached.`
      );

      // Always skipWaiting so the new SW activates immediately.
      // pwa.ts uses controllerchange to detect the update and prompt the user.
      self.skipWaiting();
    })()
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating…');

  event.waitUntil(
    (async () => {
      // Delete every cache bucket that doesn't belong to this version.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );

      // Take control of all open clients immediately (no reload required).
      await self.clients.claim();
      console.log('[SW] Active and controlling all clients.');
    })()
  );
});

// ── Messages ──────────────────────────────────────────────────────────────────
// Kept for backwards compatibility — SKIP_WAITING is now called automatically
// in install, but honour explicit messages from older pwa.ts builds.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message.');
    self.skipWaiting();
  }
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept same-origin GET requests over http(s).
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;

  // Never intercept: API routes (OpenAI proxy, Supabase), Next.js HMR.
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // /_next/static/ — content-hashed, immutable. Cache-first, no expiry.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Public static assets (icons, images, manifest). Cache-first.
  if (
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?)(\?.*)?$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Page navigations — network-first, fall back to cached page, then offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request));
    return;
  }
});

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    console.warn('[SW] Cache-first fetch failed (offline?):', request.url);
    return new Response('', { status: 503 });
  }
}

async function networkFirstNavigate(request) {
  console.log('[SW] Navigate:', request.url);
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, res.clone());
      trimCache(PAGES_CACHE, MAX_PAGES); // fire-and-forget
      console.log('[SW] Route cached:', request.url);
    }
    return res;
  } catch {
    console.log('[SW] Offline — checking page cache for:', request.url);

    // 1. Exact cached page match.
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving from page cache:', request.url);
      return cached;
    }

    // 2. Try matching without query string (RSC params, etc.).
    const stripped = new URL(request.url);
    stripped.search = '';
    const strippedCached = await caches.match(stripped.toString());
    if (strippedCached) {
      console.log('[SW] Serving stripped-URL cache hit:', stripped.toString());
      return strippedCached;
    }

    // 3. Final fallback: offline.html.
    console.log('[SW] No cache hit — serving offline.html');
    const offline = await caches.match(OFFLINE_PAGE);
    if (offline) return offline;

    // 4. Absolute last resort (offline.html itself wasn't cached).
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
      '<body style="font-family:sans-serif;text-align:center;padding:3rem">' +
      '<h1>You\'re offline</h1><p>Please reconnect and try again.</p>' +
      '<a href="/dashboard">Go to Dashboard</a></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) {
    await cache.delete(keys[i]);
  }
}
