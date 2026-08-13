const CACHE_NAME = "autonomia-pops-v3";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// INSTALAÇÃO
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

// ATIVAÇÃO
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// REQUISIÇÕES
self.addEventListener("fetch", event => {

  // Só trata requisições GET
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(response => {

        // Não salva respostas inválidas
        if (!response || response.status !== 200) {
          return response;
        }

        const copia = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, copia);
          })
          .catch(() => {});

        return response;
      })

      .catch(() => {

        return caches.match(event.request)
          .then(cached => {

            if (cached) {
              return cached;
            }

            return caches.match("./index.html");
          });

      })

  );

});
