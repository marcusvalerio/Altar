// Gera out/sw.js depois do build: pré-carrega todas as páginas e recursos
// estáticos para que as leituras funcionem offline. Sem sincronização, sem backend.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const SKIP = [/\.txt$/, /^sw\.js$/, /\.map$/, /^404\/?/, /^_not-found/, /__next\./];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(OUT)
  .map((f) => relative(OUT, f).split(sep).join("/"))
  .filter((f) => !SKIP.some((re) => re.test(f)));

const hash = createHash("sha256");
for (const f of files.sort()) hash.update(f).update(readFileSync(join(OUT, f)));
const version = hash.digest("hex").slice(0, 12);

// "calendario/index.html" → "/calendario/" (trailingSlash: true)
const urls = files.map((f) => "/" + f.replace(/(^|\/)index\.html$/, "$1"));

const sw = `// Gerado por scripts/generate-sw.mjs — não editar.
const CACHE = "altar-${version}";
const PRECACHE = ${JSON.stringify(urls)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
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
  if (url.origin !== self.location.origin) return;

  // Páginas: rede primeiro (conteúdo atualizado), cache quando offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Recursos estáticos (versionados): cache primeiro.
  event.respondWith(
    caches.match(req, { ignoreSearch: url.pathname.startsWith("/_next/static/") ? false : true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icons/"))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
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

writeFileSync(join(OUT, "sw.js"), sw);
console.log(`[offline] out/sw.js — ${urls.length} arquivos, versão ${version}`);
