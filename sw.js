// KFLOW Service Worker - Cache para funcionamento offline
const CACHE_NAME = 'kflow-v1';
const urlsToCache = [
  '/KFLOW/',
  '/KFLOW/index.html'
];

// Instalar e cachear recursos
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições - Network first, cache fallback
self.addEventListener('fetch', function(event) {
  // Não cachear chamadas do Firebase
  if(event.request.url.includes('firestore') || 
     event.request.url.includes('firebase') ||
     event.request.url.includes('googleapis')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cachear resposta válida
        if(response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        // Offline: usar cache
        return caches.match(event.request);
      })
  );
});
