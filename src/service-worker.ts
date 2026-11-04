/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Service worker minimal : met en cache les fichiers de l'app pour un démarrage rapide.
// Les notifications push s'y ajouteront avec l'issue des rappels.
import { build, files, version } from "$service-worker";

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `atout-faire-${version}`;
const FICHIERS = [...build, ...files];

sw.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)));
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (cles) => {
      for (const cle of cles) {
        if (cle !== CACHE) await caches.delete(cle);
      }
    }),
  );
});

sw.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== sw.location.origin || !FICHIERS.includes(url.pathname)) {
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then((reponse) => reponse ?? fetch(event.request)),
  );
});
