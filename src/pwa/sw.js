// Replaced at build time with versioned, local application assets only.
const CACHE = "__CACHE_NAME__";
const ASSETS = __APP_ASSETS__;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Also include scripts/styles injected into HTML by the existing Cesium plugin.
    const html = await fetch("/index.html", { cache: "reload" });
    if (!html.ok) throw new Error("App shell unavailable");
    const text = await html.clone().text();
    const injected = [...text.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => new URL(match[1], self.location.origin))
      .filter(url => url.origin === self.location.origin && !url.search).map(url => url.pathname);
    await cache.addAll([...new Set([...ASSETS, ...injected])]);
    await cache.put("/index.html", html);
    // Let an existing session finish before activating a newer application version.
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("bairro-vivo-shell-") && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  // Never cache ion, Bing, R2, GeoJSON, credentials or community submissions.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    if (url.searchParams.get("experience") === "technical" || !["/", "/index.html"].includes(url.pathname)) return;
    event.respondWith(fetch(request).catch(async () => (await caches.open(CACHE)).match("/index.html")));
    return;
  }
  if (url.search) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Only pre-cached application files are served from cache. No tile runtime cache.
    return (await cache.match(request)) ?? fetch(request);
  })());
});
