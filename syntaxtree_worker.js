// jsSyntaxTree - A syntax tree graph generator
// (c)2020 Andre Eisenbach <andre@ironcreek.net>

const CACHE_VERSION = 8;
const CACHE_NAME = `syntaxtree-cache-v${CACHE_VERSION}`;
const CACHE_FILES = [
  "/syntaxtree/",
  "/syntaxtree/index.html",
  "/syntaxtree/default.css",
  "/syntaxtree/syntaxtree_icon.png",
  "/syntaxtree/syntaxtree.webmanifest",
  "/syntaxtree/canvas.js",
  "/syntaxtree/highlight.js",
  "/syntaxtree/parser.js",
  "/syntaxtree/syntaxtree.js",
  "/syntaxtree/tip.js",
  "/syntaxtree/tokenizer.js",
  "/syntaxtree/tree.js",
  "/syntaxtree/icons/highlighter.svg",
  "/syntaxtree/icons/palette.svg",
  "/syntaxtree/icons/subscript.svg",
  "/syntaxtree/icons/triangle.svg",
  "/syntaxtree/icons/vertical_align_bottom.svg",
  "/syntaxtree/icons/vertical_align_center.svg",
  "/syntaxtree/icons/vertical_align_top.svg",
];

async function cacheStore(request, response) {
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
  console.info("[Service Worker] Install");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache
          .addAll(
            CACHE_FILES.map(
              (url) => new Request(url, { cache: "reload", mode: "no-cors" }),
            ),
          )
          .then(() => {
            console.info("[Service Worker] Resources pre-fetched.");
          }),
      )
      .catch((error) => console.error("[Service Worker] Pre-fetching failed")),
  );
});

self.addEventListener("activate", (event) => {
  console.info("[Service Worker] Activate");

  event.waitUntil(
    caches.keys().then((key_list) =>
      Promise.all(
        key_list.map((key) => {
          if (key === CACHE_NAME) return;
          console.log(`[Service Worker] Deleting cache ${key} ...`);
          return caches.delete(key);
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  console.info(`[Service Worker] Fetching ${event.request.url} ...`);
  event.respondWith(cacheFirst(event.request));
});
