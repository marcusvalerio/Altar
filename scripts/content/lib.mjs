// Importador do conteúdo editorial do ALTAR.
//
// Regra: este código NÃO escreve, resume ou corrige conteúdo devocional.
// Ele apenas recorta o arquivo-fonte em campos estruturados e verifica,
// por reconstrução (round-trip), que nada foi perdido, alterado ou deslocado.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const SOURCE_FILE = "content/source/devocional_novembro_2026.txt";
export const OUTPUT_FILE = "src/content/generated/devotionals.json";

const MONTHS = {
  JANEIRO: 1, FEVEREIRO: 2, "MARÇO": 3, ABRIL: 4, MAIO: 5, JUNHO: 6,
  JULHO: 7, AGOSTO: 8, SETEMBRO: 9, OUTUBRO: 10, NOVEMBRO: 11, DEZEMBRO: 12,
};

// Cabeçalhos de seção, na ordem obrigatória em que aparecem no arquivo.
export const SECTIONS = [
  { heading: "REFLEXÃO", key: "reflection" },
  { heading: "MOMENTO DE INTERIORIZAÇÃO", key: "interiorization" },
  { heading: "PRECE", key: "prayer" },
  { heading: "PRÁTICA DO DIA", key: "practice" },
  { heading: "FRASE FINAL", key: "closingPhrase" },
  { heading: "FONTE DE INSPIRAÇÃO", key: "source" },
];

const SEPARATOR = /^=+$/;
const DAY_LINE = /^DIA (\d{2}) — (\d{2})\/(\d{2})$/;
const THEME_LINE = /^TEMA: (.+)$/;
const SPECIAL_LINE = /^CARD ESPECIAL: (.+)$/;

const pad = (n) => String(n).padStart(2, "0");

export function readSource(path = SOURCE_FILE) {
  const raw = readFileSync(path, "utf8");
  return {
    raw,
    // Única normalização: fim de linha. O texto em si não é tocado.
    text: raw.replace(/\r\n?/g, "\n"),
    sha256: createHash("sha256").update(raw).digest("hex"),
  };
}

/** Remove linhas vazias no início e no fim, preservando o interior. */
function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return lines.slice(start, end);
}

/**
 * Faz o recorte do arquivo. Retorna dados + lista de problemas encontrados.
 * Problemas nunca são "consertados": são registrados para revisão editorial.
 */
export function parseSource(text) {
  const issues = [];
  const error = (where, message) => issues.push({ level: "error", where, message });
  const warn = (where, message) => issues.push({ level: "warning", where, message });

  const chunks = [];
  let current = [];
  for (const line of text.split("\n")) {
    if (SEPARATOR.test(line)) {
      chunks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  chunks.push(current);

  // ---- Cabeçalho do arquivo -------------------------------------------------
  const head = trimBlankLines(chunks.shift() ?? []);
  const heading = head[0] ?? "";
  const subtitle = head[1] ?? "";
  const headingMatch = /^DEVOCIONAL — ([A-ZÇ]+)\/(\d{4})$/.exec(heading);
  let year = null;
  let month = null;
  if (!headingMatch || !MONTHS[headingMatch[1]]) {
    error("cabeçalho", `Não foi possível identificar mês/ano em: "${heading}"`);
  } else {
    month = MONTHS[headingMatch[1]];
    year = Number(headingMatch[2]);
  }

  let editorialNote = null;
  const noteIndex = head.indexOf("NOTA EDITORIAL DE CONFIABILIDADE");
  if (noteIndex === -1) {
    warn("cabeçalho", "Nota editorial de confiabilidade não encontrada.");
  } else {
    editorialNote = {
      title: head[noteIndex],
      paragraphs: trimBlankLines(head.slice(noteIndex + 1)).filter((l) => l.trim() !== ""),
    };
  }

  // ---- Dias ------------------------------------------------------------------
  const devotionals = [];
  chunks.forEach((chunk, index) => {
    const lines = trimBlankLines(chunk);
    const where = `bloco ${index + 1}`;
    if (lines.length === 0) {
      error(where, "Bloco vazio entre separadores.");
      return;
    }

    const dayMatch = DAY_LINE.exec(lines[0]);
    if (!dayMatch) {
      error(where, `Primeira linha não é um cabeçalho de dia: "${lines[0]}"`);
      return;
    }
    const [, dayNumber, dd, mm] = dayMatch;
    const label = `DIA ${dayNumber}`;
    if (dayNumber !== dd) {
      error(label, `Número do dia (${dayNumber}) difere da data (${dd}/${mm}).`);
    }
    if (month !== null && Number(mm) !== month) {
      error(label, `Mês da data (${mm}) difere do mês do arquivo (${pad(month)}).`);
    }

    let cursor = 1;
    const themeMatch = THEME_LINE.exec(lines[cursor] ?? "");
    let title = "";
    if (!themeMatch) {
      error(label, `Linha "TEMA:" ausente (encontrado: "${lines[cursor] ?? ""}").`);
    } else {
      title = themeMatch[1];
      cursor++;
    }

    let commemorativeDate;
    const specialMatch = SPECIAL_LINE.exec(lines[cursor] ?? "");
    if (specialMatch) {
      commemorativeDate = { label: specialMatch[1] };
      cursor++;
    }

    // Seções: cada cabeçalho conhecido abre uma seção que vai até o próximo.
    const known = new Map(SECTIONS.map((s) => [s.heading, s.key]));
    const found = [];
    let open = null;
    for (const line of lines.slice(cursor)) {
      if (known.has(line)) {
        open = { heading: line, key: known.get(line), lines: [] };
        found.push(open);
      } else if (open) {
        open.lines.push(line);
      } else if (line.trim() !== "") {
        error(label, `Texto fora de qualquer seção: "${line}"`);
      }
    }

    const order = found.map((s) => s.heading).join(" → ");
    const expected = SECTIONS.map((s) => s.heading).join(" → ");
    if (order !== expected) {
      error(label, `Seções fora do padrão. Esperado: ${expected}. Encontrado: ${order || "(nenhuma)"}.`);
    }

    const fields = {};
    for (const section of found) {
      if (fields[section.key] !== undefined) {
        error(label, `Seção duplicada: ${section.heading}.`);
        continue;
      }
      // Parágrafos são separados por linha em branco, exatamente como no arquivo.
      fields[section.key] = trimBlankLines(section.lines).join("\n");
    }

    const date = year ? `${year}-${mm}-${dd}` : `????-${mm}-${dd}`;
    devotionals.push({
      id: date,
      date,
      dayLabel: label,
      title,
      reflection: fields.reflection ?? "",
      interiorization: fields.interiorization,
      prayer: fields.prayer,
      practice: fields.practice,
      closingPhrase: fields.closingPhrase,
      source: fields.source !== undefined ? { kind: "inspiration", text: fields.source } : undefined,
      ...(commemorativeDate ? { commemorativeDate } : {}),
      isSpecial: Boolean(commemorativeDate),
      // Bloco original, usado apenas para a verificação de round-trip.
      _raw: lines.join("\n"),
    });
  });

  return {
    meta: {
      sourceFile: SOURCE_FILE,
      heading,
      subtitle,
      year,
      month,
      editorialNote,
      fieldMapping: {
        title: "TEMA",
        "commemorativeDate.label": "CARD ESPECIAL",
        reflection: "REFLEXÃO",
        interiorization: "MOMENTO DE INTERIORIZAÇÃO",
        prayer: "PRECE",
        practice: "PRÁTICA DO DIA",
        closingPhrase: "FRASE FINAL",
        "source.text": "FONTE DE INSPIRAÇÃO",
      },
    },
    devotionals,
    issues,
  };
}

/** Reconstrói o bloco de um dia a partir dos campos estruturados. */
export function serializeDevotional(d) {
  const out = [d.dayLabel + " — " + d.date.slice(8, 10) + "/" + d.date.slice(5, 7), `TEMA: ${d.title}`];
  if (d.commemorativeDate) out.push(`CARD ESPECIAL: ${d.commemorativeDate.label}`);
  for (const { heading, key } of SECTIONS) {
    const value = key === "source" ? d.source?.text : d[key];
    if (value === undefined) continue;
    out.push("", heading, value);
  }
  return out.join("\n");
}

/** Validação completa. Retorna a lista de problemas (vazia = tudo certo). */
export function validate(parsed) {
  const issues = [...parsed.issues];
  const error = (where, message) => issues.push({ level: "error", where, message });
  const warn = (where, message) => issues.push({ level: "warning", where, message });
  const { year, month } = parsed.meta;
  const list = parsed.devotionals;

  // 1. Quantidade de dias = dias reais do mês (novembro → 30; nunca 31).
  if (year && month) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (list.length !== daysInMonth) {
      error("arquivo", `Esperados ${daysInMonth} dias para ${pad(month)}/${year}; encontrados ${list.length}.`);
    }
    const seen = new Set();
    for (const d of list) {
      if (seen.has(d.date)) error(d.dayLabel, `Data duplicada: ${d.date}.`);
      seen.add(d.date);
      const day = Number(d.date.slice(8, 10));
      if (day < 1 || day > daysInMonth) error(d.dayLabel, `Data inexistente no mês: ${d.date}.`);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${pad(month)}-${pad(day)}`;
      if (!seen.has(date)) error("arquivo", `Data ausente: ${date}.`);
    }
    // Ordem cronológica.
    list.forEach((d, i) => {
      if (i > 0 && d.date <= list[i - 1].date) error(d.dayLabel, "Dias fora de ordem cronológica.");
    });
  }

  for (const d of list) {
    const where = d.dayLabel;
    // 2. Campos obrigatórios não vazios.
    if (!d.title.trim()) error(where, "Título (TEMA) vazio.");
    if (!d.reflection.trim()) error(where, "Reflexão vazia.");
    for (const { heading, key } of SECTIONS) {
      const value = key === "source" ? d.source?.text : d[key];
      if (value === undefined) error(where, `Seção ausente: ${heading}.`);
      else if (!value.trim()) error(where, `Seção vazia: ${heading}.`);
    }

    // 3. Round-trip: a reconstrução deve ser idêntica ao bloco original.
    //    Garante que nenhuma prece/reflexão/fonte foi alterada, truncada
    //    ou deslocada para outro dia durante a importação.
    const rebuilt = serializeDevotional(d);
    if (rebuilt !== d._raw) {
      const a = rebuilt.split("\n");
      const b = d._raw.split("\n");
      const at = a.findIndex((line, i) => line !== b[i]);
      error(where, `Reconstrução difere do original na linha ${at + 1}: "${b[at] ?? ""}" ≠ "${a[at] ?? ""}".`);
    }

    // 4. Heurística de truncamento: seções devem terminar em pontuação final.
    for (const { heading, key } of SECTIONS) {
      const value = key === "source" ? d.source?.text : d[key];
      if (value && !/[.?!…”"»)]$/.test(value.trim())) {
        warn(where, `${heading} não termina com pontuação final — verificar se o texto está completo.`);
      }
    }
  }

  return issues;
}

/** Dados prontos para o app (sem o bloco bruto). */
export function toPublicData(parsed, sha256) {
  return {
    meta: { ...parsed.meta, sha256 },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    devotionals: parsed.devotionals.map(({ _raw, dayLabel, ...rest }) => ({
      ...rest,
      sourceDayLabel: dayLabel,
    })),
  };
}
