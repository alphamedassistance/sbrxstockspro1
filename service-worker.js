const CACHE_NAME = 'rxstocks-pro-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // External CDN libraries required for PDF generation
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

// Install Event: Caches all critical files immediately
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker ...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all files');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// Activate Event: Clean up old caches if versions change
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker ....');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache.', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch Event: Offline-First Strategy
// 1. Check cache. 
// 2. If in cache, return cached version (works offline).
// 3. If not in cache, fetch from network and return.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cache if found
                if (response) {
                    return response;
                }
                // Else try network
                return fetch(event.request).catch(() => {
                    // Optional: You could return a custom offline page here if needed
                    // For now, if both fail, the browser shows its standard offline error
                    console.log('Fetch failed; returning offline page if available.');
                });
            })
    );
});