// ===========================================================
// MAMATA — Service worker (basic offline shell + PWA installability)
// ===========================================================
const CACHE_NAME = "mamata-cache-v1";
const SHELL_FILES = [
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/layout.js",
  "/manifest.json",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for navigation/API, cache-first for static shell assets
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return; // never cache writes / Firestore calls

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok && request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
