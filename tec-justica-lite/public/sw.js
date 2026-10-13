/**
 * Service Worker — Tec Justiça Lite (PWA)
 *
 * Estratégia:
 * - Cache-First para assets estáticos (HTML, CSS, JS, fontes, imagens)
 * - Network-First para chamadas à API (/api/*)
 * - Fallback offline para requisições de navegação
 */

const CACHE_NAME = 'tecjustica-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// ─── Instalação ──────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// ─── Ativação — Limpeza de caches antigos ────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// ─── Interceptação de requisições ────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Requisições de API: Network-First (nunca cachear análise de IA)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Você está offline. A consulta de IA requer conexão com a internet.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }),
    );
    return;
  }

  // Fontes do Google e assets estáticos: Cache-First
  if (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      }),
    );
    return;
  }

  // Navegação e demais assets: Cache-First com fallback para rede
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cachear respostas bem-sucedidas de assets
          if (
            response.ok &&
            request.method === 'GET' &&
            url.origin === self.location.origin
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback offline para navegação
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    }),
  );
});
