const CACHE='cl-v3';
const ASSETS=['/','/index.html','/styles.css','/app.js','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).catch(()=>caches.match('/index.html'))));});
self.addEventListener('message',e=>{if(e.data?.type==='REST_DONE')self.registration.showNotification('COACH LION 🦁',{body:'¡Descanso terminado! A darle al hierro 💪',icon:'/icon-192.png',vibrate:[200,100,200,100,400],tag:'rest'});});
