/**
 * Recursos VISUAIS associados a datas — não são conteúdo editorial.
 *
 * O arquivo-fonte não fornece ilustrações. As composições abaixo são
 * gráficas, abstratas e provisórias (componentes SVG em
 * src/components/illustrations.tsx), até que ilustrações autorais sejam
 * encomendadas. Para trocar, basta apontar `illustration` para outro id.
 */

export type IllustrationId = "memoria" | "fraternidade";

export const illustrationByDate: Record<string, { id: IllustrationId; provisional: true }> = {
  "2026-11-02": { id: "memoria", provisional: true },
  "2026-11-20": { id: "fraternidade", provisional: true },
};
