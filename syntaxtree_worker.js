// jsSyntaxTree - A syntax tree graph generator
// (c)2020 Andre Eisenbach <andre@ironcreek.net>

const CACHE_VERSION = 15;
const CACHE_NAME = `syntaxtree-cache-v${CACHE_VERSION}`;
const CACHE_FILES = [
  "./",
  "index.html",
  "default.css",
  "syntaxtree_icon.png",
  "syntaxtree.webmanifest",
  "canvas.js",
  "svg_canvas.js",
  "highlight.js",
  "parser.js",
  "syntaxtree.js",
  "tip.js",
  "tokenizer.js",
  "tree.js",
  "icons/highlighter.svg",
  "icons/palette.svg",
  "icons/subscript.svg",
  "icons/triangle.svg",
  "icons/terminal_lines.svg",
  "icons/download_png.svg",
  "icons/download_svg.svg",
  "icons/vertical_align_bottom.svg",
  "icons/vertical_align_center.svg",
  "icons/vertical_align_top.svg",
];

async function cacheStore(request, response) {
  if (!response || response.status !== 200 || response.type !== "basic") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
}

async function cacheFirst(request) {
  const cached_response = await caches.match(request);
  if (cached_response) {
    console.info(`[Service Worker] Returning cached ${request.url} ...`);
    return cached_response;
  }

  const network_response = await fetch(request);
  cacheStore(request, network_response.clone());
  return network_response;
}

self.addEventListener("install", (event) => {
  console.info(`[Service Worker] Install version ${CACHE_NAME}`);

  const urlsToCache = CACHE_FILES.map(
    (path) => new URL(path, self.registration.scope).href,
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => {
        console.info("[Service Worker] Resources pre-fetched.");
      })
      .catch((error) =>
        console.error("[Service Worker] Pre-fetching failed:", error),
      ),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.info(`[Service Worker] Activate version ${CACHE_NAME}`);

  event.waitUntil(
    caches.keys().then((key_list) =>
      Promise.all(
        key_list.map((key) => {
          if (key === CACHE_NAME) return;
          console.log(
            `[Service Worker] Deleting cache ${key}, latest is ${CACHE_NAME} ...`,
          );
          return caches.delete(key);
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  console.info(
    `[Service Worker] Fetching ${event.request.url} version ${CACHE_NAME} ...`,
  );
  event.respondWith(cacheFirst(event.request));
});
