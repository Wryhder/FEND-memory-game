// Name of cache to be created
const pageCache = 'cacheV1';

// Resources to tbe cached
const urlsToCache = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(pageCache)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          console.log('Found', event.request, ' in cache');
          return response;
        } else {
          console.log('Could not find', event.request, ' in cache, FETCHING!');
          return fetch(event.request)
            .then(function (response) {
              const clonedResponse = response.clone();
              caches.open(pageCache)
                .then(function (cache) {
                  cache.put(event.request, clonedResponse);
                })
              return response;
            })
            .catch(function (err) {
              console.error(err);
            });
        }
      })
  );
})