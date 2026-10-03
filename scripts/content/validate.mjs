// Valida o conteúdo editorial. Falha (exit 1) em qualquer erro.
// Uso: npm run content:validate            (estrito — usado no build)
//      npm run content:validate -- --warn-only   (apenas avisa — usado no dev)
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { OUTPUT_FILE, parseSource, readSource, toPublicData, validate } from "./lib.mjs";
import { printIssues } from "./report.mjs";

const warnOnly = process.argv.includes("--warn-only");
const { text, sha256 } = readSource();
const parsed = parseSource(text);
const issues = validate(parsed);

// Os dados usados pelo app precisam corresponder exatamente ao arquivo-fonte.
// Qualquer edição manual em devotionals.json (ex.: uma prece alterada) é erro.
let committed;
try {
  committed = JSON.parse(readFileSync(OUTPUT_FILE, "utf8"));
} catch {
  issues.push({ level: "error", where: OUTPUT_FILE, message: "Arquivo gerado ausente. Rode npm run content:import." });
}
if (committed) {
  const expected = toPublicData(parsed, sha256);
  if (committed.meta?.sha256 !== sha256) {
    issues.push({ level: "error", where: OUTPUT_FILE, message: "Dados gerados a partir de outra versão do arquivo-fonte. Rode npm run content:import." });
  } else if (!isDeepStrictEqual({ meta: committed.meta, devotionals: committed.devotionals }, expected)) {
    issues.push({ level: "error", where: OUTPUT_FILE, message: "Os dados gerados não correspondem ao arquivo-fonte (edição manual?). Rode npm run content:import." });
  }
}

console.log(`[conteúdo] validando ${parsed.devotionals.length} dias de ${parsed.meta.heading}`);
const { errors, warnings } = printIssues(issues);
console.log(`  ${errors.length} erro(s), ${warnings.length} aviso(s)`);
if (errors.length && !warnOnly) process.exit(1);
