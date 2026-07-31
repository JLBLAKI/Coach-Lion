const CACHE='cl-v14';
const ASSETS=['/','/index.html','/styles.css','/app.js','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.filter(a=>{return true;}).map(a=>new Request(a,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('supabase.co')||e.request.url.includes('googleapis.com')||e.request.url.includes('fal.run')){
    e.respondWith(fetch(e.request).catch(()=>new Response('{"error":"offline"}',{headers:{'Content-Type':'application/json'}})));return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    if(r.ok&&e.request.method==='GET'){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));}
    return r;
  }).catch(()=>caches.match('/index.html'))));
});
let notifSchedule=null;
setInterval(()=>{
  if(!notifSchedule)return;
  const now=new Date();
  if(now.getHours()===notifSchedule.hour&&now.getMinutes()===notifSchedule.minute){
    self.registration.showNotification('COACH LION 🦁',{body:'¡Es hora de entrenar, bestia! 💪',icon:'/icon-192.png',badge:'/icon-192.png',vibrate:[200,100,200,100,400],tag:'daily-reminder'});
  }
},60000);
self.addEventListener('message',e=>{
  if(e.data?.type==='REST_DONE')self.registration.showNotification('COACH LION 🦁',{body:'¡Descanso terminado! A darle 💪',icon:'/icon-192.png',vibrate:[200,100,200],tag:'rest'});
  if(e.data?.type==='SCHEDULE_NOTIF')notifSchedule={hour:e.data.hour,minute:e.data.minute};
  if(e.data?.type==='CANCEL_NOTIF')notifSchedule=null;
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  if(e.action==='open'||!e.action){e.waitUntil(clients.matchAll({type:'window'}).then(cs=>{for(const c of cs)if('focus' in c)return c.focus();if(clients.openWindow)return clients.openWindow('/');}).catch(()=>{}));}
});
