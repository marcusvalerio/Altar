// Gerado por scripts/generate-sw.mjs — não editar.
const CACHE = "altar-8320b663fba4";
const PRECACHE = ["/","/calendario/","/favoritos/","/mais/","/mais/sobre/","/mais/conteudo/","/mais/privacidade/","/devocional/2026-10-01/","/devocional/2026-10-02/","/devocional/2026-10-03/","/devocional/2026-10-04/","/devocional/2026-10-05/","/devocional/2026-10-06/","/devocional/2026-10-07/","/devocional/2026-10-08/","/devocional/2026-10-09/","/devocional/2026-10-10/","/devocional/2026-10-11/","/devocional/2026-10-12/","/devocional/2026-10-13/","/devocional/2026-10-14/","/devocional/2026-10-15/","/devocional/2026-10-16/","/devocional/2026-10-17/","/devocional/2026-10-18/","/devocional/2026-10-19/","/devocional/2026-10-20/","/devocional/2026-10-21/","/devocional/2026-10-22/","/devocional/2026-10-23/","/devocional/2026-10-24/","/devocional/2026-10-25/","/devocional/2026-10-26/","/devocional/2026-10-27/","/devocional/2026-10-28/","/devocional/2026-10-29/","/devocional/2026-10-30/","/devocional/2026-10-31/","/manifest.webmanifest","/icons/icon.svg","/icons/icon-192.png","/icons/icon-512.png"];
const NEVER = [/^\/api\//, /^\/conta\//];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("altar-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || NEVER.some((re) => re.test(url.pathname))) return;

  // Páginas: rede primeiro, cache quando offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Arquivos versionados do build e ícones: cache primeiro.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => "focus" in c);
      return open ? open.focus() : self.clients.openWindow("/");
    }),
  );
});
