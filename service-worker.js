const cacheName = "1giu-vepro-mod";
const assets = [
    "./",

    "./index.html",

    "./fonts/roboto/RobotoMono-Bold.ttf",
    "./fonts/roboto/RobotoMono-Bold.woff",
    "./fonts/roboto/RobotoMono-Bold.woff2",
    "./fonts/roboto/RobotoMono-Regular.ttf",
    "./fonts/roboto/RobotoMono-Regular.woff",
    "./fonts/roboto/RobotoMono-Regular.woff2",

    "./css/fonts.css",
    "./css/variables.css",
    "./css/header.css",
    "./css/footer.css",
    "./css/upgrades.css",
    "./css/style.css",

    "./js/ExpantaNum.js",
    "./js/script.js",
    "./js/pwa.js",

    "./icon/icon192x192.png",
    "./icon/icon512x512.png",

    "./changelog.md"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assets))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith((async () => {
        try {
            const res = await fetch(event.request);
            (await caches.open(cacheName)).put(event.request, res.clone());
            return res;
        }
        catch (err) {
            return await caches.match(event.request);
        }
    })());
});