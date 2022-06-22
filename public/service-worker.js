const files = [
    '/home',
    '/css/main.css',
    '/css/signup.css',
    '/img/logo-1.png',
    '/img/menu.svg',
    '/favicon.ico',
    '/icons/icon-32x32.png',
    '/icons/icon-48x48.png',
    '/icons/icon-64x64.png',
    '/icons/icon-96x96.png',
    '/icons/icon-144x44.png',
    '/icons/icon-256x256.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', function (event) {
    console.log('serviceworker installed!');
    event.waitUntil(
        caches.open('static').then(function (cache) {
            files.forEach(url => {
                console.log('cache.add %s', url);
                cache.add(url).catch(function (reason) {
                    return console.log(url + " failed: " + String(reason));
                });
            });
        })
    );
});

self.addEventListener('activate', function () {
    console.log('serviceworker activated!');
});

self.addEventListener('fetch', async function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (res) {
                if (res) {
                    console.log('load from cache' + res);
                    return res;
                } else {
                    if (!addToCache(event.request.url)) 
                        return fetch(event.request);
                }
            })
    );
});

function addToCache(url) {

    if (url.includes('imgedb') || url.includes('/adv')) {
        caches.open('static').then(function (cache) {
            cache.add(url)
                .then(function (x) {
                    console.log(url + 'cached');
                    return true;
                })
                .catch(function (x) {
                    console.log(url + 'error');
                });
        })
    }
    return false;

}

