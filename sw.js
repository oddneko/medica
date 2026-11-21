/*
 * MEDICA Service Worker — Offline-First Cache Strategy
 *
 * Strategy: Cache-First for static assets, Network-First for navigations.
 * On install: pre-cache all app shell assets.
 * On activate: delete outdated caches.
 * On fetch: serve from cache, fall back to network, then offline fallback.
 *
 * Compatible with: Chrome for Android, Safari iOS 11.3+, Firefox, Edge.
 */

const CACHE_NAME = 'medica-v6';
const OFFLINE_FALLBACK = '/index.html';

// All static assets that make up the app shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/landing-1.html',
  '/landing-welcome.html',
  '/landing-2.html',
  '/landing-3.html',
  '/settings.html',
  '/manifest.json',
  '/style/index.css',
  '/style/landing-1.css',
  '/style/landing-2.css',
  '/style/landing-3.css',
  '/style/settings.css',
  '/js/app.js',
  '/js/db.js',
  '/js/medicine-db.js',
  '/js/onboarding.js',
  '/js/settings.js',
  '/js/tts.js',
  '/js/i18n.js',
  '/assets/medica.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// ── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll will reject if any single asset fails — use individual adds
      // so a missing icon doesn't block the whole install.
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Failed to precache:', url, err);
          })
        )
      );
    }).then(() => {
      // Activate immediately — don't wait for existing pages to close
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────
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

// ── Fetch: Cache-First for assets, Network-First for HTML navigations ─────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests (POST, etc.)
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    // ── HTML Navigation: Network-First ────────────────────────────────────
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
        .catch(() => caches.match(OFFLINE_FALLBACK))
    );
  } else {
    // ── Static Assets: Cache-First ────────────────────────────────────────
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((networkResponse) => {
          // Cache successful responses dynamically (images, fonts, etc.)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return networkResponse;
        }).catch(() => {
          // For image requests return SVG fallback
          if (request.destination === 'image') {
            return caches.match('/assets/medica.svg');
          }
        });
      })
    );
  }
});
