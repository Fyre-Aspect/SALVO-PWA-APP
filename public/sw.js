// SALVO service worker — Phase 1
// Cache-first for shell assets; network-first with cache fallback for API.

const CACHE_VERSION = "salvo-v1";
const SHELL_ASSETS = [
  "/",
  "/auth",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache the SSE stream
  if (url.pathname.startsWith("/api/distress/stream")) return;

  // Network-first for API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => caches.match("/"))
    )
  );
});

// Stub for background sync — Phase 3 will queue offline confirmations
self.addEventListener("sync", (event) => {
  if (event.tag === "salvo-sync-confirmations") {
    // TODO: drain queued confirmations
  }
});
