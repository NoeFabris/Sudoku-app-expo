// Improved service worker for better performance
const CACHE_NAME = 'sudoku-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/styles/main.css',
  // Add other important static assets here
];

// Maximum number of items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't cache API calls or third-party requests
  if (url.pathname.startsWith('/api/') || !url.hostname.includes(self.location.hostname)) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Network-first for other requests
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Activate event - clean up old caches and limit cache size
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Remove old cache versions
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Limit cache size
      limitCacheSize()
    ]).then(() => self.clients.claim())
  );
});

// Helper function to limit cache size
async function limitCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  if (keys.length > MAX_DYNAMIC_CACHE_ITEMS) {
    // Remove oldest items if cache exceeds limit
    for (let i = 0; i < keys.length - MAX_DYNAMIC_CACHE_ITEMS; i++) {
      await cache.delete(keys[i]);
    }
  }
} 