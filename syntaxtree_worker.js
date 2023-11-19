const CACHE_VERSION = 3;
const CACHE_NAME = `syntaxtree-cache-v${CACHE_VERSION}`;
const CACHE_FILES = [
  '/',
  '/index.html',
  '/default.css',
  '/syntaxtree_icon.png',
  '/syntaxtree.webmanifest',
  '/canvas.js',
  '/parser.js',
  '/syntaxtree.js',
  '/tip.js',
  '/tokenizer.js',
  '/tree.js',
];

self.addEventListener('install', (event) => {
  console.info('[Service Worker] Install');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache
        .addAll(CACHE_FILES.map((url) => new Request(url, {mode: 'no-cors'})))
        .then(() => {
          console.info('[Service Worker] Resources pre-fetched.');
        })
      )     
      .catch((error) => console.error('[Service Worker] Pre-fetching failed'))
  );
});

self.addEventListener('activate', (event) => {
  console.info('[Service Worker] Activate');

  event.waitUntil(caches.keys().then((key_list) => 
    Promise.all(key_list.map((key) => {
      if (key === CACHE_NAME) return;
      console.log(`[Service Worker] Deleting cache ${key} ...`);
      return caches.delete(key);
    }))
  ));
});

self.addEventListener('fetch', (event) => {
  console.info(`[Service Worker] Fetching ${event.request.url} ...`);
  if (event.request.method !== 'GET') return;

  event.respondWith((async() => {
    const cache = await caches.open(CACHE_NAME);
    const cached_response = await cache.match(event.request);

    if (cached_response) {
      // If cached, also attempt to update entry in the background
      event.waitUntil(cache.add(event.request).catch(() => {}));
      return cached_response;
    }

    return fetch(event.request);
  })());
});
