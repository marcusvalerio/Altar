import data from "./generated/devotionals.json";
import type { ContentBundle, Devotional } from "./types";

const bundle = data as ContentBundle;

export const contentMeta = bundle.meta;
export const contentIssues = bundle.issues;
export const devotionals: Devotional[] = bundle.devotionals;

const byId = new Map(devotionals.map((d) => [d.id, d]));

export function getDevotional(id: string): Devotional | undefined {
  return byId.get(id);
}

export function hasDevotional(id: string) {
  return byId.has(id);
}

export const firstDate = devotionals[0]?.date;
export const lastDate = devotionals[devotionals.length - 1]?.date;

export function neighbours(id: string) {
  const i = devotionals.findIndex((d) => d.id === id);
  return {
    previous: i > 0 ? devotionals[i - 1] : undefined,
    next: i >= 0 && i < devotionals.length - 1 ? devotionals[i + 1] : undefined,
  };
}

/** Meses (yyyy-mm) que possuem conteúdo. */
export const contentMonths = Array.from(new Set(devotionals.map((d) => d.date.slice(0, 7))));

/** Divide um campo em parágrafos, preservando o texto de cada um. */
export function paragraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text.split(/\n{2,}/);
}
