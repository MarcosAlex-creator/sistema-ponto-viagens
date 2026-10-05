const CACHE_NAME = 'ponto-viagens-v2.2';
const ARQUIVOS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icone-app.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARQUIVOS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(nomes => 
            nomes.filter(nome => nome !== CACHE_NAME)
                 .map(obsoleto => caches.delete(obsoleto))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(respostaCache => 
            respostaCache || fetch(e.request)
        )
    );
});
