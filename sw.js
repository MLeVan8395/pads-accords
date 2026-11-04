// Pads d'accords : fonctionnement hors ligne.
// Page et manifeste : version en ligne d'abord (les modifications faites sur GitHub arrivent tout de suite),
// copie enregistrée si pas de connexion. Icônes et polices : copie enregistrée d'abord.
// Si tu ajoutes un fichier, ajoute-le à FICHIERS et change VERSION.
const VERSION='pads-accords-3';
const FICHIERS=["./","index.html","manifest.webmanifest","icones/icone-192.png","icones/icone-512.png","icones/apple-touch-icon.png"];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const enLigneDabord=req=>fetch(req,{cache:'no-store'}).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(VERSION).then(x=>x.put(req,c)); } return r; }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./')));
const copieDabord=req=>caches.match(req).then(r=>r||fetch(req).then(n=>{ if(n.ok||n.type==='opaque'){ const c=n.clone(); caches.open(VERSION).then(x=>x.put(req,c)); } return n; }));
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(req.mode==='navigate'||/\.(html|js|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/')) e.respondWith(enLigneDabord(req));
    else e.respondWith(copieDabord(req));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) e.respondWith(copieDabord(req));
});
