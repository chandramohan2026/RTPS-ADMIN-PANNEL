const CACHE = "rtps-admin-v2";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const u = new URL(event.request.url);

  // Keep Firebase/auth/Firestore traffic live; do not cache it.
  if (u.hostname.includes("googleapis.com") ||
      u.hostname.includes("gstatic.com") ||
      u.hostname.includes("firebaseio.com")) return;

  event.respondWith(
    fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(event.request).then(r => r || caches.match("./index.html")))
  );
});
