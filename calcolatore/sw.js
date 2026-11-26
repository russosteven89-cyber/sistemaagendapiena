/* Calcolatore sull'iPad: funziona anche senza rete.
   Prima prova la rete (al massimo 4 secondi), così le versioni nuove arrivano da sole; senza rete usa la copia salvata. */
var CACHE = 'calcolatore-724080e4ff88';
var FILE = ['./', 'index.html', 'contenuto.bin?v=724080e4ff88', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'favicon.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf('calcolatore-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(new Promise(function(fatto){
    var finito = false;
    function dallaCopia(){
      if(finito) return;
      caches.match(r, {ignoreSearch: r.mode === 'navigate'}).then(function(m){
        if(finito) return;
        if(m){ finito = true; fatto(m); }
      });
    }
    var t = setTimeout(dallaCopia, 4000);
    fetch(r).then(function(risp){
      clearTimeout(t);
      if(risp && risp.ok){ var copia = risp.clone(); caches.open(CACHE).then(function(c){ c.put(r, copia); }); }
      if(!finito){ finito = true; fatto(risp); }
    }).catch(function(){
      clearTimeout(t);
      caches.match(r, {ignoreSearch: r.mode === 'navigate'}).then(function(m){
        if(finito) return;
        finito = true;
        fatto(m || new Response('Senza rete e senza copia salvata: apri il calcolatore una volta con la rete.', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}}));
      });
    });
  }));
});
