const CACHE_NAME="rtps-admin-v1";
const APP_SHELL=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  if(u.hostname.includes("googleapis.com")||u.hostname.includes("gstatic.com")||u.hostname.includes("firebaseio.com")) return;
  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
    return r;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
