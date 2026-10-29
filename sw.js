// English Club service worker: makes the site installable and lets pages you have opened work offline.
// Pages: network first (so updates always show), falling back to the saved copy when offline.
// Files (scripts, styles, images, fonts on this site): served from the saved copy, refreshed in the background.
const CACHE = 'club-v2';
const CORE = ['./', './index.html', './assets/club.css', './assets/club.js', './assets/gate.js', './assets/sfx.js', './assets/icons/icon-192.png', './offline.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;      // Firebase, fonts and other sites go straight to the network
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./offline.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }).catch(() => m);
    return m || net;
  }));
});
