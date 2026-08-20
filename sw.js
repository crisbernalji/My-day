const CACHE='my-day-v2'; const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const c=x.clone();caches.open(CACHE).then(k=>k.put(e.request,c));return x}).catch(()=>caches.match('./'))))});
self.addEventListener('message',e=>{if(e.data?.type==='NOTIFY') self.registration.showNotification(e.data.title||'My Day',{body:e.data.body||'',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:e.data.tag||'my-day'})});
