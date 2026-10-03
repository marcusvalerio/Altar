// Gera src/content/generated/devotionals.json a partir do arquivo-fonte.
// Uso: npm run content:import
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { OUTPUT_FILE, SOURCE_FILE, parseSource, readSource, toPublicData, validate } from "./lib.mjs";
import { printIssues } from "./report.mjs";

const { text, sha256 } = readSource();
const parsed = parseSource(text);
const issues = validate(parsed);
const data = { ...toPublicData(parsed, sha256), issues };

mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2) + "\n");

console.log(`[conteúdo] ${SOURCE_FILE} → ${OUTPUT_FILE} (${data.devotionals.length} dias)`);
printIssues(issues);
