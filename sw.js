/*
 * MEDICA Service Worker — Cache-First Offline-Ready Strategy
 *
 * Strategy: Cache-First for ALL requests (pages, scripts, styles, fonts, icons).
 * On install: pre-cache all app shell assets and data files.
 * On activate: delete outdated caches and immediately claim clients.
 * On fetch: ALWAYS serve from cache first, with background revalidation when online.
 *
 * Compatible with: Chrome for Android, Safari iOS 11.3+, Firefox, Edge.
 */

const CACHE_NAME = 'medica-v9';
const OFFLINE_FALLBACK = './index.html';

// Complete manifest of all assets that make up the app shell and runtime
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './landing-1.html',
  './landing-2.html',
  './landing-3.html',
  './landing-welcome.html',
  './settings.html',
  './manifest.json',
  './style/fonts.css',
  './style/page-transitions.css',
  './style/index.css',
  './style/landing-1.css',
  './style/landing-2.css',
  './style/landing-3.css',
  './style/settings.css',
  './js/app.js',
  './js/db.js',
  './js/i18n.js',
  './js/medicine-db.js',
  './js/medicine-form.js',
  './js/onboarding.js',
  './js/settings.js',
  './js/tts.js',
  './assets/medica.svg',
  './assets/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf',
  './assets/icons/icon.svg',
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-144.png',
  './assets/icons/icon-152.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png'
];

// ── Install: pre-cache all app files ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pre-cache every asset individually so one failure does not break the batch
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            // cache: 'reload' bypasses stale HTTP cache during SW install
            const req = new Request(url, { cache: 'reload' });
            const res = await fetch(req);
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} for ${url}`);
            }
            await cache.put(req, res);
          } catch (err) {
            console.warn('[SW] Precache failed for:', url, err);
          }
        })
      );

      // Ensure root URL aliases match the cached index.html
      try {
        const indexMatch = await cache.match('./index.html');
        if (indexMatch) {
          await cache.put(new Request('./'), indexMatch.clone());
          await cache.put(new Request(self.registration.scope), indexMatch.clone());
        }
      } catch (err) {
        console.warn('[SW] Root alias error:', err);
      }
    }).then(() => {
      // Activate immediately — don't wait for existing pages to close
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up old caches & take control ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Message: support manual skipWaiting trigger ──────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch: ALWAYS serve from Cache First ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1. Try matching cache first (ignoreSearch: true handles queries like ?launch=1)
      let cached = await cache.match(request, { ignoreSearch: true });

      // 2. Navigation fallback matching: normalize root and clean URLs
      if (!cached && request.mode === 'navigate') {
        const path = url.pathname;
        if (path === '/' || path.endsWith('/') || path.endsWith('/index.html')) {
          cached = (await cache.match('./index.html', { ignoreSearch: true })) ||
                   (await cache.match('index.html', { ignoreSearch: true })) ||
                   (await cache.match('./', { ignoreSearch: true }));
        } else {
          // Check matching file by basename
          const filename = path.substring(path.lastIndexOf('/') + 1);
          if (filename) {
            cached = (await cache.match(`./${filename}`, { ignoreSearch: true })) ||
                     (await cache.match(filename, { ignoreSearch: true }));
          }
        }
      }

      // 3. Cache HIT: Return immediately from cache (ALWAYS run app from cache)
      if (cached) {
        // Revalidate in background when online to keep cache up-to-date
        if (navigator.onLine) {
          event.waitUntil(
            fetch(request)
              .then(async (networkRes) => {
                if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
                  await cache.put(request, networkRes.clone());
                }
              })
              .catch(() => {
                // Ignore network errors in background revalidation
              })
          );
        }
        return cached;
      }

      // 4. Cache MISS: Fetch from network and store in cache for next time
      try {
        const networkResponse = await fetch(request);
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // 5. Offline Fallbacks
        if (request.mode === 'navigate') {
          const offlinePage = (await cache.match(OFFLINE_FALLBACK, { ignoreSearch: true })) ||
                              (await cache.match('./index.html', { ignoreSearch: true })) ||
                              (await cache.match('index.html', { ignoreSearch: true }));
          if (offlinePage) return offlinePage;
        }

        if (request.destination === 'image') {
          const fallbackImg = await cache.match('./assets/medica.svg', { ignoreSearch: true });
          if (fallbackImg) return fallbackImg;
        }

        throw err;
      }
    })()
  );
});
