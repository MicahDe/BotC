self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("ear-training-cache").then((cache) => {
            return cache.addAll(["/index.html", "/main.bundle.js", "/main.css", "/manifest.json", "/icon-128x128.png", "/icon-256x256.png", "/icon-512x512.png"]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
