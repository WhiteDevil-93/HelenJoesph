// Titrate Service Worker v4.1 - Aggressive cache busting
const CACHE_NAME = 'titrate-v4.1';
const FILES = ['./','./index.html','./app.js','./data.json'];

// Install: cache files
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(names=>Promise.all(
      names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n))
    )).then(()=>self.clients.claim())
  );
});

// Fetch: network-first with 2-second timeout, then cache fallback
self.addEventListener('fetch',e=>{
  e.respondWith(
    fetch(e.request,{cache:'no-store'}).then(r=>{
      // Update cache with fresh response
      const clone=r.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
      return r;
    }).catch(()=>{
      // Fallback to cache
      return caches.match(e.request);
    })
  );
});
