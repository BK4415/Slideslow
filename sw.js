const CACHE_NAME = 'premium-wood-slide-v1';
const ASSETS = [
    'index.html',
    'about.html',
    'privacy.html',
    'terms.html',
    'guide.html',
    'css/style.css',
    'js/engine.js',
    'js/ui.js',
    'js/pwa.js',
    'json/ratings.json',
    'assets/images/photo1.jpg',
    'assets/images/photo2.jpg',
    'assets/images/photo3.jpg',
    'assets/images/photo4.jpg',
    'assets/images/photo5.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
