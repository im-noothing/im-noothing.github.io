// sw.js

const CACHE_NAME = 'math-quiz-cache-v1';
const urlsToCache = [
  '/', // Cache the root path (index.html)
  'index.html',
  'style.css',
  'script.js',
  'icon-192.png', // Cache the icons
  'icon-512.png'
  // Add other assets like sounds or images if you have them
];

// Install event: Cache the app shell
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  // Add this line to force the waiting service worker to become the active service worker
  self.skipWaiting(); // *** Added this line ***
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: Clean up old caches and take control of clients
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  // Add this line to immediately control the current page
  self.clients.claim(); // *** Added this line ***
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached assets when offline
self.addEventListener('fetch', function(event) {
  // Prevent the default browser response and instead respond with a cached copy if available
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request);
      })
  );
});