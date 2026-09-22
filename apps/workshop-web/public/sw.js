const CACHE_NAME = "grupo-j-oficinas-static-20260922-security";
const OFFLINE_URL = "/offline.html";

// Strictly non-sensitive static assets only
const PRECACHE_ASSETS = [
  "/brand/grupo-j-horizontal.png",
  "/brand/grupo-j-profile.png",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable.png"
];

// Sensitive keywords to NEVER cache under any circumstance
const SENSITIVE_PATTERNS = [
  "/api/",
  "/auth/",
  "/token",
  "/login",
  "cpf",
  "voucher",
  "checkin",
  "financeiro",
  "repasse",
  "ordem-de-servico",
  "webhook"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") {
    return;
  }

  // Never cache sensitive endpoints or APIs
  const isSensitive = SENSITIVE_PATTERNS.some((pattern) =>
    url.pathname.toLowerCase().includes(pattern)
  );

  if (isSensitive) {
    event.respondWith(
      fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
        return new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Navigation requests: Network-first with offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Cache only known public, same-origin static paths.
  if (
    url.origin === self.location.origin && (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/brand/")
    )
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
