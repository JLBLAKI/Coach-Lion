const CACHE='cl-v7';
const ASSETS=['/','/index.html','/styles.css','/app.js','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  // Cache-first for static assets, network-first for Supabase API calls
  if(e.request.url.includes('supabase.co')||e.request.url.includes('generativelanguage.googleapis')||e.request.url.includes('fal.run')){
    e.respondWith(fetch(e.request).catch(()=>new Response('{"error":"offline"}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(res=>{
    if(res.ok&&e.request.method==='GET'){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(e.request,clone));}
    return res;
  }).catch(()=>caches.match('/index.html'))));
});
self.addEventListener('message',e=>{
  if(e.data?.type==='REST_DONE')self.registration.showNotification('COACH LION 🦁',{body:'¡Descanso terminado! A darle al hierro 💪',icon:'/icon-192.png',vibrate:[200,100,200,100,400],tag:'rest'});
});
