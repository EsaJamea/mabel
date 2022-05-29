self.addEventListener('install', function (event) {
  console.log('serviceworker installed!');
  event.waitUntil(
      caches.open('static').then(function (cache) {
          cache.addAll([
              '/',
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
          ]);
      })
  );
});

self.addEventListener('activate', function () {
  console.log('serviceworker activated!');
});

self.addEventListener('fetch', function(event){
  event.respondWith(
      caches.match(event.request)
      .then(function(res){
          if(res){
              return res;
          }else{
              return fetch(event.request);
          }
      })
  );
})

