// Angel 11+ Service Worker
// Bump CACHE_VER on each deploy that requires a cache flush.
const CACHE_VER    = 'v1';
const STATIC_CACHE = `angel-static-${CACHE_VER}`;
const PAGES_CACHE  = `angel-pages-${CACHE_VER}`;
const OFFLINE_PAGE = '/offline.html';
const MAX_PAGES    = 50;

// Pre-cache these on install so offline.html is always available.
const PRECACHE_URLS = [
  OFFLINE_PAGE,
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        // allSettled: one failing asset won't abort the whole precache.
        Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      )
  );
  // Don't skipWaiting here.  lib/pwa.ts sends SKIP_WAITING on first install
  // and the update toast sends it on user-confirmed updates.
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Messages ──────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests over http(s).
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;

  // Never intercept: API routes (OpenAI/Supabase proxied), HMR.
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // Next.js content-hashed static bundles — immutable, cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Public static assets — cache-first.
  if (
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?)(\?.*)?$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Full page navigations — network-first, cached fallback, then offline page.
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
    return new Response('', { status: 503 });
  }
}

async function networkFirstNavigate(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, res.clone());
      trimCache(PAGES_CACHE, MAX_PAGES); // fire-and-forget
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_PAGE);
    return offline ?? new Response('Offline', { status: 503 });
  }
}

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) {
    await cache.delete(keys[i]);
  }
}
