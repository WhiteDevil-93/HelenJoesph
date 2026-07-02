
// Kill switch - unregister all service workers and clear caches
self.addEventListener('install', e=>{self.skipWaiting()});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(names=>Promise.all(names.map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{e.respondWith(fetch(e.request))});
