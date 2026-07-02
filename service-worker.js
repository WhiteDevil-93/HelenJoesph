// Titrate legacy SW kill-switch v4.3
// This overwrites the old v3.0 cache-first service worker
const KILL = 'titrate-kill-v4-3';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
