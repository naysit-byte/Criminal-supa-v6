const V = 'v8';
const CACHE = 'paanya-' + V;

self.addEventListener('install', e => {
  self.skipWaiting();
  // ไม่ precache เลย — ป้องกัน install fail ถ้า network มีปัญหา
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// fetch handler — REQUIRED สำหรับ PWA installability
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = e.request.url;
  // ไม่ intercept API
  if (u.includes('supabase.co') || u.includes('googleapis.com') ||
      u.includes('fonts.g') || u.includes('anthropic')) return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const c = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
