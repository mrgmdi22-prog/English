// English Club service worker: makes the site installable and lets pages you have opened work offline.
// Pages: from the network, but if the network is slow (weak school Wi-Fi) the saved copy is shown after a few
// seconds instead of a frozen screen; the fresh copy is still saved for next time.
// Files (scripts, styles, images on this site): the saved copy at once, refreshed in the background.
const CACHE = 'club-v3';
const CORE = ['./', './index.html', './assets/club.css', './assets/club.js', './assets/gate.js', './assets/sfx.js', './assets/icons/icon-192.png', './offline.html'];
const WAIT = 3500;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function save(req, res) { if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); } return res; }
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;      // Firebase, fonts and other sites go straight to the network
  if (r.mode === 'navigate') {
    const net = fetch(r).then(res => save(r, res));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(new Promise(resolve => {
      let done = false; const give = x => { if (!done && x) { done = true; resolve(x); } };
      net.then(give, () => caches.match(r, { ignoreSearch: true }).then(m => give(m || caches.match('./offline.html'))));
      // slow network: show the saved copy if there is one, keep waiting for the network if there is not
      setTimeout(() => { if (!done) caches.match(r, { ignoreSearch: true }).then(m => give(m)); }, WAIT);
    }));
    return;
  }
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => save(r, res));
    if (m) { e.waitUntil(net.catch(() => {})); return m; }
    return net.catch(() => new Response('', { status: 504 }));
  }));
});
