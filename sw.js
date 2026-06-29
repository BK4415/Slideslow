/**
 * PREMIUM WOODEN SLIDE SERVICE WORKER
 * Version: 1.0.0
 * Strategy: Cache First, Network Fallback
 */

const CACHE_NAME = 'wood-slide-v1';

// List of all internal assets to cache
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './about.html',
    './privacy.html',
    './terms.html',
    './guide.html',
    './css/style.css',
    './js/engine.js',
    './js/ui.js',
    './js/stats.js',
    './js/pwa.js',
    './json/ratings.json',
    './manifest.json',
    // Placeholders for your assets (Service worker will not fail if these are missing yet)
    './assets/images/logo.png',
    './assets/images/photo1.jpg',
    './assets/images/photo2.jpg',
    './assets/images/photo3.jpg',
    './assets/images/photo4.jpg',
    './assets/images/photo5.jpg'
];

// Install: Cache all resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Pre-caching game assets');
                // We use addAll but wrap it so it doesn't fail the whole SW if 1 image is missing
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => cache.add(url))
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Serve from Cache, else Network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached file
                if (response) return response;

                // Otherwise try network
                return fetch(event.request).then((networkResponse) => {
                    // Check if valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Cache the new resource on the fly
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    // Fallback for missing photos/assets to prevent loading screen freeze
                    if (event.request.destination === 'image') {
                        return new Response('', { status: 404 });
                    }
                });
            })
    );
});
