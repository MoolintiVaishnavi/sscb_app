const CACHE = 'sscb-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',  // ← add this
  './icon-512.png'   // ← and this if you have it
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (
    e.request.url.includes('firebaseio') ||
    e.request.url.includes('googleapis') ||
    e.request.url.includes('gstatic.com') ||  // ← add this
    e.request.url.includes('firebasejs')       // ← and this
  ) {
    return; // let browser handle it directly
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(e.request).then(cached =>
          cached || new Response('Not found', { status: 404 })
        )
      )
  );
});
