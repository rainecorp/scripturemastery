/* sw.js — app-shell service worker (T15b)
   ===========================================================================
   Strategy: network-first, falling back to cache when offline.

   NOT cache-first, on purpose. There are no production users yet (ROADMAP.md's
   own BUILD MODE banner) and this app is being actively, rapidly iterated on
   ticket by ticket. A cache-first service worker with no auto-bumped version
   would silently serve stale app code to anyone who already installed it,
   with no way for them to know a newer version exists — the exact kind of
   staleness bug that is hard to diagnose from the outside. Network-first
   means an online visit always gets the latest files (and, as a side effect,
   keeps re-populating the cache with them); only a genuinely offline visit
   falls back to whatever was last successfully fetched. That is also exactly
   what "installs to a phone home screen and fully loads with the network
   off" (ROADMAP.md's T15 DoD) needs.

   A service worker does NOT control the very page that first registers it —
   only requests made AFTER activation go through its fetch handler — so a
   pure "cache whatever gets fetched" approach leaves the entire first visit
   uncached and offline still fails right after that first install. install()
   below fetches index.html itself and regex-scans it for every <script src>
   and <link href> it references, then precaches all of them plus the two
   self-hosted font files (referenced from CSS, not from index.html, so the
   scan can't find them on its own). Deriving the list from index.html at
   install time — instead of hand-maintaining a duplicate file list here —
   means a future ticket that adds a new js/*.js or css/*.css file to
   index.html's own script/link tags is automatically covered; nothing in
   this file needs to change alongside it.

   CACHE_NAME is versioned by hand. Bump it when the caching STRATEGY changes
   (not on every ticket — the network-first fetch handler already keeps the
   cache reasonably fresh on its own); bumping forces every open tab's old
   cache to be dropped on the next activate. */
const CACHE_NAME = "sq-shell-v1";
const EXTRA_ASSETS = ["./", "fonts/cinzel-latin.woff2", "fonts/cinzel-latin-ext.woff2"];

async function discoverShellAssets(){
  const res = await fetch("index.html");
  const html = await res.text();
  const urls = new Set(EXTRA_ASSETS);
  urls.add("index.html");
  const re = /<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/gi;
  let m;
  while((m = re.exec(html)) !== null){
    if(!/^https?:|^\/\//i.test(m[1])) urls.add(m[1]); // same-origin only
  }
  return [...urls];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    discoverShellAssets()
      .then((assets) => caches.open(CACHE_NAME).then((cache) =>
        // One failed file (a stale path, a fetch hiccup) must not sink the
        // whole install — cache what succeeds, and the network-first fetch
        // handler will fill in anything missed on the next successful visit.
        Promise.all(assets.map((url) => cache.add(url).catch(() => {})))
      ))
      .catch(() => {}) // offline on first install entirely -- not fatal
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // same-origin only -- nothing external to cache today

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("index.html") : undefined))
      )
  );
});
