// Gera public/sw.js antes do build: pré-carrega as páginas de leitura para que
// funcionem offline. Recursos estáticos (/_next/static) entram no cache na
// primeira visita. Contas e API nunca são guardadas em cache.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("src/content/generated/devotionals.json", "utf8"));
const pages = [
  "/",
  "/calendario/",
  "/favoritos/",
  "/mais/",
  "/mais/sobre/",
  "/mais/conteudo/",
  "/mais/privacidade/",
  ...data.devotionals.map((d) => `/devocional/${d.id}/`),
];
const assets = ["/manifest.webmanifest", "/icons/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];
const version = createHash("sha256")
  .update(JSON.stringify(pages) + data.meta.sha256 + Date.now())
  .digest("hex")
  .slice(0, 12);

const sw = `// Gerado por scripts/generate-sw.mjs — não editar.
const CACHE = "altar-${version}";
const PRECACHE = ${JSON.stringify([...pages, ...assets])};
const NEVER = [/^\\/api\\//, /^\\/conta\\//];

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
`;

writeFileSync("public/sw.js", sw);
console.log(`[offline] public/sw.js — ${pages.length} páginas, versão ${version}`);
