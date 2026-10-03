// Gera db/seed/<edição>.sql a partir dos dados JÁ VALIDADOS.
// Uso: npm run content:sql   → depois: psql "$DATABASE_URL" -f db/seed/2026-10.sql
// A gravação é idempotente: a edição é substituída por completo, em uma transação.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { OUTPUT_FILE } from "./lib.mjs";

const data = JSON.parse(readFileSync(OUTPUT_FILE, "utf8"));
if (data.issues.some((i) => i.level === "error")) {
  console.error("[neon] O conteúdo tem erros de validação. Corrija o arquivo-fonte antes de gravar no banco.");
  process.exit(1);
}

// Dollar-quoting com etiqueta única: o texto entra sem nenhum escape/alteração.
const TAG = "$altar$";
const q = (v) => {
  if (v === undefined || v === null) return "NULL";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (String(v).includes(TAG)) throw new Error("Texto contém o delimitador SQL reservado.");
  return `${TAG}${v}${TAG}`;
};
const arr = (list) => `ARRAY[${list.map(q).join(", ")}]::text[]`;

const { meta, devotionals, issues } = data;
const edition = `${meta.year}-${String(meta.month).padStart(2, "0")}`;

const statements = [
  `DELETE FROM editions WHERE id = ${q(edition)}`,
  `INSERT INTO editions (id, year, month, heading, subtitle, source_file, source_sha256, technical_normalizations)
   VALUES (${q(edition)}, ${meta.year}, ${meta.month}, ${q(meta.heading)}, ${q(meta.subtitle)}, ${q(meta.sourceFile)}, ${q(meta.sha256)}, ${arr(meta.technicalNormalizations)})`,
  ...meta.editorialNotes.map(
    (n, i) => `INSERT INTO editorial_notes (edition_id, position, title, paragraphs) VALUES (${q(edition)}, ${i + 1}, ${q(n.title)}, ${arr(n.paragraphs)})`,
  ),
  ...devotionals.map((d) => {
    const hash = createHash("sha256").update(JSON.stringify(d)).digest("hex");
    return `INSERT INTO devotionals (date, edition_id, source_day_label, title, reflection, interiorization, prayer, practice, closing_phrase, source_label, source_text, commemorative_label, is_special, content_sha256)
   VALUES (${q(d.date)}, ${q(edition)}, ${q(d.sourceDayLabel)}, ${q(d.title)}, ${q(d.reflection)}, ${q(d.interiorization)}, ${q(d.prayer)}, ${q(d.practice)}, ${q(d.closingPhrase)}, ${q(d.source?.label)}, ${q(d.source?.text)}, ${q(d.commemorativeDate?.label)}, ${d.isSpecial}, ${q(hash)})`;
  }),
  ...issues.map(
    (i) => `INSERT INTO import_issues (edition_id, level, location, message) VALUES (${q(edition)}, ${q(i.level)}, ${q(i.where)}, ${q(i.message)})`,
  ),
];

mkdirSync("db/seed", { recursive: true });
const file = `db/seed/${edition}.sql`;
writeFileSync(file, `-- Gerado por scripts/content/neon-sql.mjs — não editar.\nBEGIN;\n${statements.join(";\n")};\nCOMMIT;\n`);
console.log(`[neon] ${file} — ${devotionals.length} dias, ${statements.length} comandos`);
