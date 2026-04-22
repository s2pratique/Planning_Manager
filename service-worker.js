/**
 * Service Worker pour Formation Manager PWA
 * Permet le fonctionnement hors ligne et la mise en cache
 */

const CACHE_NAME = 'formation-manager-v1';
const urlsToCache = [
  './index.html',
  './app.js',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache ouvert');
        // Ajout des fichiers un par un pour éviter les erreurs
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn('[Service Worker] Échec du cache pour:', url);
              return Promise.resolve(); // Continue même en cas d'erreur
            });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Installation réussie');
        return self.skipWaiting();
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Activation réussie');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes - Stratégie Network First avec Cache Fallback
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes vers Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    // Essayer d'abord le réseau
    fetch(event.request)
      .then(response => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type === 'error') {
          throw new Error('Réponse réseau invalide');
        }
        
        // Clone la réponse pour la mettre en cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, utiliser le cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Réponse depuis le cache:', event.request.url);
            return cachedResponse;
          }
          
          // Si pas de cache et pas de réseau, retourner une page d'erreur simple
          if (event.request.destination === 'document') {
            return new Response(
              '<html><body><h1>Pas de connexion</h1><p>Veuillez vérifier votre connexion internet.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          
          return new Response('Offline - Resource not available', { status: 503 });
        });
      })
  );
});
