/**
 * Anywhere Learning — Service Worker
 * Provides basic offline caching for the mobile app.
 * - Caches store pages on first visit
 * - Serves cached pages when offline
 * - Does NOT cache account/auth pages (always need fresh data)
 */

const CACHE_NAME = 'al-store-v1';

// Pages to pre-cache on install
const PRECACHE_URLS = [
  '/shop',
];

// Patterns that should NEVER be cached
const NEVER_CACHE = [
  '/account',
  '/sign-in',
  '/sign-up',
  '/api/',
  '/checkout',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip caching for paths that should always be fresh
  if (NEVER_CACHE.some((pattern) => url.pathname.startsWith(pattern))) return;

  // Network-first strategy: try network, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for store pages and product images
        if (
          response.ok &&
          (url.pathname.startsWith('/shop') ||
            url.pathname.startsWith('/products/') ||
            url.pathname === '/')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Offline: try to serve from cache
        caches.match(request).then(
          (cached) =>
            cached ||
            new Response(
              '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf9f6;color:#374151;text-align:center;padding:2rem}h1{color:#588157;font-size:1.5rem;margin-bottom:0.5rem}p{color:#9ca3af;font-size:0.95rem}</style></head><body><div><h1>You\'re offline</h1><p>Check your internet connection and try again.</p></div></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html' } }
            )
        )
      )
  );
});
