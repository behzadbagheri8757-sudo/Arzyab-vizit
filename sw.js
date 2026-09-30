/* Service Worker — ارزیاب مغازه‌ها v2.3 */
const CACHE_NAME = 'shop-evaluator-v2.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(err => console.log('Cache addAll failed:', err)))
      .then(() => self.skipWaiting()) // انتقال به داخل waitUntil
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // انتقال به داخل waitUntil
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // استراتژی ویژه برای بارگذاری صفحه (Navigation)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // استراتژی Cache First برای سایر فایل‌ها
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      });
    })
  );
});
