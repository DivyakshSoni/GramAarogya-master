const CACHE_NAME = "gramaarogya-v1"
const OFFLINE_URL = "/offline"

const STATIC_ASSETS = [
  "/",
  "/health-check",
  "/consultation",
  "/health-records",
  "/medicine",
  "/g-map",
  "/find-doctor",
  "/news-help",
  "/offline",
]

// Install: cache critical pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // If some pages fail to cache, continue anyway
        console.log("Some assets could not be cached")
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache, then offline page
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== "GET") return
  if (event.request.url.includes("/api/") || event.request.url.includes("127.0.0.1:5000")) return
  if (event.request.url.includes("overpass-api.de")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline use
        if (response.ok) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          // If HTML page requested, show offline page
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match(OFFLINE_URL)
          }
          return new Response("Offline", { status: 503 })
        })
      })
  )
})
