/**
 * Modelo de dados do conteúdo editorial.
 *
 * O conteúdo vem exclusivamente de content/source/*.txt, recortado por
 * scripts/content/import.mjs. Nada aqui é gerado, resumido ou corrigido pelo app.
 */

/** "Fonte de inspiração" ≠ citação literal. Ver src/content/quotes.ts. */
export type InspirationSource = {
  kind: "inspiration";
  /** Rótulo da seção exatamente como no arquivo (ex.: "FONTE DE INSPIRAÇÃO / REFERÊNCIA"). */
  label: string;
  /** Texto exatamente como no arquivo (não é decomposto em autor/obra para não inferir dados). */
  text: string;
};

export type CommemorativeDate = {
  /** Rótulo exatamente como em "CARD ESPECIAL:" no arquivo. */
  label: string;
  /** Campos opcionais: só preenchidos se existirem no arquivo-fonte. */
  title?: string;
  description?: string;
};

export type Devotional = {
  /** ISO yyyy-mm-dd */
  id: string;
  date: string;
  /** Linha "TEMA:" do arquivo — o arquivo não possui um campo "título" separado. */
  title: string;
  /** Parágrafos separados por linha em branco ("\n\n"), como no arquivo. */
  reflection: string;
  interiorization?: string;
  prayer?: string;
  practice?: string;
  closingPhrase?: string;
  source?: InspirationSource;
  commemorativeDate?: CommemorativeDate;
  isSpecial: boolean;
  /** Ex.: "DIA 01" — rastreabilidade até o arquivo-fonte. */
  sourceDayLabel: string;
};

export type ContentIssue = { level: "error" | "warning"; where: string; message: string };

export type ContentBundle = {
  meta: {
    sourceFile: string;
    heading: string;
    subtitle: string;
    year: number;
    month: number;
    editorialNotes: { title: string; paragraphs: string[] }[];
    /** Normalizações técnicas aplicadas na importação (sempre reportadas). */
    technicalNormalizations: string[];
    fieldMapping: Record<string, string>;
    sha256: string;
  };
  devotionals: Devotional[];
  issues: ContentIssue[];
};
