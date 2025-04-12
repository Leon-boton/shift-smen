const CACHE_NAME = "smena-app-cache-v2"; // меняй при каждом обновлении
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./work.css",
  "./script.js",
  "./smena.js",
  "./uploadSchedule.js",
  "./chat.js",
  "./manifest.json",
  "./icon/icons1.png",
  "./icon/icons.png",
  "./work/index.html",
  "./work/work.js",
  "./work/work.css"
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-database-compat.js"
];

// Установка: кэшируем все файлы
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Активация: очищаем старые кэши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Фетч: сначала из кэша, если нет — из сети
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((response) => {
      return response || fetch(event.request);
    })
  );
});