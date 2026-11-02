/* Schuluhr Offline-Speicher. Version erhöhen, wenn die App geändert wird. */
const CACHE_NAME = 'schuluhr-v1';
const APP_ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('schuluhr-') && key!==CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  // Bei Internetzugang aktuelle Version, ohne Internet gespeicherte Version.
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const responseClone=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone)));
    }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
});
