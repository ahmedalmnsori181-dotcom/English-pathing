
/* =========================================
   ENGLISH PATH 2.0
   Service Worker
   Offline support and cache management
========================================= */

"use strict";

const CACHE_NAME = "english-path-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.svg"
];

/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        APP_FILES.map(async file => {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn("Could not cache:", file, error);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name =>
            name.startsWith("english-path-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // لا نخزن طلبات المواقع الخارجية مثل YouTube
  if (url.origin !== self.location.origin) return;

  // معالجة التنقل بين صفحات التطبيق
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put("./index.html", copy);
            });
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match("./index.html")
          ) || new Response(
            "English Path is currently unavailable offline.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  // ملفات التطبيق: نستخدم النسخة المخزنة أولاً
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(response => {
        if (
          response &&
          response.ok &&
          response.type === "basic"
        ) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
