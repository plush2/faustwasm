
const CACHE_NAME = 'FAUST_DSP-static'; // Cache name without versioning

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching datas");
            return cache.addAll([
                '/FAUST_DSP/',
                '/FAUST_DSP/faust-ui/index.js',
                '/FAUST_DSP/faust-ui/index.css',
                '/FAUST_DSP/faustwasm/index.js',
                '/FAUST_DSP/FAUST_DSP.js',
                '/FAUST_DSP/FAUST_DSP.wasm',
                '/FAUST_DSP/FAUST_DSP.json',
            ]).catch(error => {
                // Catch and log any errors during the caching process
                console.error('Failed to cache resources during install:', error);
            });
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        // Delete caches that do not match the current cache name
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/*
self.addEventListener('fetch', event => {
    console.log("event.request", event.request);
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return the cached response if found, else fetch from network
            return response || fetch(event.request).catch(() => {
                // Fallback content or page for failed network requests
                return caches.match('./offline.html');
            });
        })
    );
});
*/

/*
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Get the resource from the cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                // If the resource was not in the cache, try the network
                const fetchResponse = await fetch(event.request);
                // Save the resource in the cache and return it
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            } catch (e) {
                // Network access failure
                console.log('Network access error', CACHE_NAME);
            }
        }
    })());
});
*/

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        if (event.request.method !== 'GET') {
            // Only handle GET requests
            return fetch(event.request);
        }
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const fetchResponse = await fetch(event.request);
                // Ensure the response is valid before caching it
                if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
                    cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            } catch (e) {
                console.log('Network access error', e);
                // Network access failure
                console.log('Network access error', CACHE_NAME);
            }
        }
    })());
});