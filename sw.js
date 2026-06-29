const CACHE_NAME = 'wood-slide-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/engine.js',
    './js/ui.js',
    './js/pwa.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
