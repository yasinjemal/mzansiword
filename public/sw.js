// Minimal hand-written service worker: precache the shell, cache-first for
// hashed static assets, network-only for /api/ (guesses must be validated
// server-side), network-first with cache fallback for pages.
const CACHE = "mw-v1";
const SHELL = ["/", "/how-to-play", "/rules", "/privacy"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // network only

  // Immutable build assets + icons: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Pages: network-first so the daily puzzle stays fresh.
  event.respondWith(
    fetch(request).catch(() =>
      caches
        .match(request)
        .then((hit) => hit ?? caches.match("/"))
        .then((hit) => hit ?? Response.error()),
    ),
  );
});
