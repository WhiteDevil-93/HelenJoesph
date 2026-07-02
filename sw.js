// Titrate SW v4.3 - KILL SWITCH: clears all caches, never caches new content
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
