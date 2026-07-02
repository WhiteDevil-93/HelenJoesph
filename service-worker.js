// Kill switch - v4.1
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.keys().then(names => Promise.all(names.map(n => caches.delete(n)))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))).then(() => self.clients.claim());
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
