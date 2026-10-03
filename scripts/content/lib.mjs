// Importador do conteúdo editorial do ALTAR.
//
// Regra: este código NÃO escreve, resume ou corrige conteúdo devocional.
// Ele apenas recorta o arquivo-fonte em campos estruturados e verifica,
// por reconstrução (round-trip), que nada foi perdido, alterado ou deslocado.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const SOURCE_FILE = "content/source/devocional_outubro_2026.txt";
export const OUTPUT_FILE = "src/content/generated/devotionals.json";

const MONTHS = {
  JANEIRO: 1, FEVEREIRO: 2, "MARÇO": 3, ABRIL: 4, MAIO: 5, JUNHO: 6,
  JULHO: 7, AGOSTO: 8, SETEMBRO: 9, OUTUBRO: 10, NOVEMBRO: 11, DEZEMBRO: 12,
};

// Cabeçalhos de seção, na ordem obrigatória. Algumas seções aceitam variantes
// de rótulo; o rótulo original é preservado para exibição e reconstrução.
export const SECTIONS = [
  { headings: ["REFLEXÃO"], key: "reflection" },
  { headings: ["MOMENTO DE INTERIORIZAÇÃO"], key: "interiorization" },
  { headings: ["PRECE"], key: "prayer" },
  { headings: ["PRÁTICA DO DIA"], key: "practice" },
  { headings: ["FRASE FINAL"], key: "closingPhrase" },
  { headings: ["FONTE DE INSPIRAÇÃO", "FONTE DE INSPIRAÇÃO / REFERÊNCIA"], key: "source" },
];
const HEADING_TO_KEY = new Map(SECTIONS.flatMap((s) => s.headings.map((h) => [h, s.key])));
const SECTION_NAMES = SECTIONS.map((s) => s.headings[0]);

const SEPARATOR = /^=+$/;
const DAY_LINE = /^DIA (\d{2}) — (\d{2})\/(\d{2})(?:\/(\d{4}))?$/;
const THEME_LINE = /^TEMA: (.+)$/;
const SPECIAL_LINE = /^CARD ESPECIAL: (.+)$/;
const TRAILER_LINE = /^NOTAS? DE VERIFICAÇÃO EDITORIAL$/;
const HEADING_PATTERNS = [/^DEVOCIONAL — ([A-ZÇ]+)\/(\d{4})$/, /^EDIÇÃO ([A-ZÇ]+) DE (\d{4})$/];

// Marcadores de citação deixados por ferramentas de geração de texto
// (caracteres de uso privado U+E200…U+E202, ex.: "citeturn0search1").
// Não são texto editorial e ficariam visíveis como lixo na tela. São removidos
// por uma regra técnica explícita, e CADA remoção é reportada pelo validador.
const CITATION_MARKER = /[ \t]*cite[^\n]*/g;
const PRIVATE_USE = /[-]/;

const pad = (n) => String(n).padStart(2, "0");

export function readSource(path = SOURCE_FILE) {
  const raw = readFileSync(path, "utf8");
  return {
    raw,
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

/** Bloco de nota editorial: primeira linha em caixa alta vira título. */
function toNote(lines) {
  const content = trimBlankLines(lines.filter((l) => !SEPARATOR.test(l))).filter((l) => l.trim() !== "");
  if (!content.length) return null;
  const hasTitle = content[0] === content[0].toUpperCase() && /[A-Z]/.test(content[0]);
  return { title: hasTitle ? content[0] : "", paragraphs: hasTitle ? content.slice(1) : content };
}

/**
 * Faz o recorte do arquivo. Retorna dados + lista de problemas encontrados.
 * Problemas nunca são "consertados": são registrados para revisão editorial.
 */
export function parseSource(originalText) {
  const issues = [];
  const error = (where, message) => issues.push({ level: "error", where, message });
  const warn = (where, message) => issues.push({ level: "warning", where, message });

  // ---- Normalização técnica (reportada) ---------------------------------------
  const removedMarkers = [];
  const lines = originalText.split("\n").map((line, i) =>
    line.replace(CITATION_MARKER, (m) => {
      removedMarkers.push({ line: i + 1, marker: m.trim().replace(/[-]/g, "·") });
      return "";
    }),
  );

  // ---- Localiza dias e notas finais -----------------------------------------
  const dayStarts = lines.flatMap((l, i) => (DAY_LINE.test(l) ? [i] : []));
  const trailerStart = lines.findIndex((l, i) => TRAILER_LINE.test(l) && i > (dayStarts.at(-1) ?? -1));
  const end = trailerStart === -1 ? lines.length : trailerStart;

  const head = trimBlankLines(lines.slice(0, dayStarts[0] ?? lines.length).filter((l) => !SEPARATOR.test(l)));
  const heading = head[0] ?? "";
  const subtitle = head[1] ?? "";

  let year = null;
  let month = null;
  for (const line of head.slice(0, 3)) {
    for (const re of HEADING_PATTERNS) {
      const m = re.exec(line);
      if (m && MONTHS[m[1]]) {
        month = MONTHS[m[1]];
        year = Number(m[2]);
      }
    }
  }
  if (!month) error("cabeçalho", `Não foi possível identificar mês/ano no cabeçalho: "${head.slice(0, 3).join(" / ")}"`);

  const editorialNotes = [];
  const headNote = toNote(head.slice(2));
  if (headNote) editorialNotes.push(headNote);
  if (trailerStart !== -1) {
    const trailer = toNote(lines.slice(trailerStart));
    if (trailer) editorialNotes.push(trailer);
  }
  if (!editorialNotes.length) warn("cabeçalho", "Nenhuma nota editorial encontrada no arquivo.");

  // ---- Dias ------------------------------------------------------------------
  const devotionals = [];
  dayStarts.forEach((start, index) => {
    const stop = index + 1 < dayStarts.length ? dayStarts[index + 1] : end;
    const block = trimBlankLines(lines.slice(start, stop).filter((l) => !SEPARATOR.test(l)));
    const [, dayNumber, dd, mm, yyyy] = DAY_LINE.exec(block[0]);
    const label = `DIA ${dayNumber}`;

    if (dayNumber !== dd) error(label, `Número do dia (${dayNumber}) difere da data (${dd}/${mm}).`);
    if (month !== null && Number(mm) !== month) error(label, `Mês da data (${mm}) difere do mês do arquivo (${pad(month)}).`);
    if (yyyy && year !== null && Number(yyyy) !== year) error(label, `Ano da data (${yyyy}) difere do ano do arquivo (${year}).`);

    let cursor = 1;
    const themeMatch = THEME_LINE.exec(block[cursor] ?? "");
    let title = "";
    if (!themeMatch) {
      error(label, `Linha "TEMA:" ausente (encontrado: "${block[cursor] ?? ""}").`);
    } else {
      title = themeMatch[1];
      cursor++;
    }

    let commemorativeDate;
    const specialMatch = SPECIAL_LINE.exec(block[cursor] ?? "");
    if (specialMatch) {
      commemorativeDate = { label: specialMatch[1] };
      cursor++;
    }

    const found = [];
    let open = null;
    for (const line of block.slice(cursor)) {
      if (HEADING_TO_KEY.has(line)) {
        open = { heading: line, key: HEADING_TO_KEY.get(line), lines: [] };
        found.push(open);
      } else if (open) {
        open.lines.push(line);
      } else if (line.trim() !== "") {
        error(label, `Texto fora de qualquer seção: "${line}"`);
      }
    }

    const order = found.map((s) => SECTION_NAMES[SECTIONS.findIndex((x) => x.key === s.key)]).join(" → ");
    const expected = SECTION_NAMES.join(" → ");
    if (order !== expected) {
      error(label, `Seções fora do padrão. Esperado: ${expected}. Encontrado: ${order || "(nenhuma)"}.`);
    }

    const fields = {};
    const headings = {};
    for (const section of found) {
      if (fields[section.key] !== undefined) {
        error(label, `Seção duplicada: ${section.heading}.`);
        continue;
      }
      fields[section.key] = trimBlankLines(section.lines).join("\n");
      headings[section.key] = section.heading;
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
      source:
        fields.source !== undefined
          ? { kind: "inspiration", label: headings.source, text: fields.source }
          : undefined,
      ...(commemorativeDate ? { commemorativeDate } : {}),
      isSpecial: Boolean(commemorativeDate),
      // Apenas para a verificação de round-trip.
      _dayLine: block[0],
      _raw: block.join("\n"),
    });
  });

  for (const m of removedMarkers) {
    warn(`linha ${m.line}`, `Marcador técnico de citação removido: "${m.marker}" — recomenda-se limpar o arquivo-fonte.`);
  }

  return {
    meta: {
      sourceFile: SOURCE_FILE,
      heading,
      subtitle,
      year,
      month,
      editorialNotes,
      technicalNormalizations: removedMarkers.length
        ? [`${removedMarkers.length} marcador(es) técnico(s) de citação removido(s) (caracteres U+E200–U+E202).`]
        : [],
      fieldMapping: {
        title: "TEMA",
        "commemorativeDate.label": "CARD ESPECIAL",
        reflection: "REFLEXÃO",
        interiorization: "MOMENTO DE INTERIORIZAÇÃO",
        prayer: "PRECE",
        practice: "PRÁTICA DO DIA",
        closingPhrase: "FRASE FINAL",
        "source.text": "FONTE DE INSPIRAÇÃO (/ REFERÊNCIA)",
      },
    },
    devotionals,
    issues,
  };
}

/** Reconstrói o bloco de um dia a partir dos campos estruturados. */
export function serializeDevotional(d) {
  const out = [d._dayLine, `TEMA: ${d.title}`];
  if (d.commemorativeDate) out.push(`CARD ESPECIAL: ${d.commemorativeDate.label}`);
  for (const { key, headings } of SECTIONS) {
    const value = key === "source" ? d.source?.text : d[key];
    if (value === undefined) continue;
    out.push("", key === "source" ? d.source.label : headings[0], value);
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

  // 1. Quantidade de dias = dias reais do mês.
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
    list.forEach((d, i) => {
      if (i > 0 && d.date <= list[i - 1].date) error(d.dayLabel, "Dias fora de ordem cronológica.");
    });
  }

  for (const d of list) {
    const where = d.dayLabel;
    if (!d.title.trim()) error(where, "Título (TEMA) vazio.");
    if (!d.reflection.trim()) error(where, "Reflexão vazia.");
    for (const { headings, key } of SECTIONS) {
      const value = key === "source" ? d.source?.text : d[key];
      if (value === undefined) error(where, `Seção ausente: ${headings[0]}.`);
      else if (!value.trim()) error(where, `Seção vazia: ${headings[0]}.`);
      else if (PRIVATE_USE.test(value)) error(where, `${headings[0]} contém caracteres invisíveis/técnicos.`);
    }

    // 2. Round-trip: a reconstrução deve ser idêntica ao bloco original.
    const rebuilt = serializeDevotional(d);
    if (rebuilt !== d._raw) {
      const a = rebuilt.split("\n");
      const b = d._raw.split("\n");
      const at = a.findIndex((line, i) => line !== b[i]);
      error(where, `Reconstrução difere do original na linha ${at + 1}: "${b[at] ?? ""}" ≠ "${a[at] ?? ""}".`);
    }

    // 3. Heurística de truncamento.
    for (const { headings, key } of SECTIONS) {
      const value = key === "source" ? d.source?.text : d[key];
      if (value && !/[.?!…”"»)]$/.test(value.trim())) {
        warn(where, `${headings[0]} não termina com pontuação final — verificar se o texto está completo.`);
      }
    }
  }

  return issues;
}

/** Dados prontos para o app (sem campos internos). */
export function toPublicData(parsed, sha256) {
  return {
    meta: { ...parsed.meta, sha256 },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    devotionals: parsed.devotionals.map(({ _raw, _dayLine, dayLabel, ...rest }) => ({
      ...rest,
      sourceDayLabel: dayLabel,
    })),
  };
}
