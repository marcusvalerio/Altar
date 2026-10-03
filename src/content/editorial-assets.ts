/**
 * Recursos VISUAIS associados a datas — não são conteúdo editorial.
 *
 * O arquivo-fonte não fornece ilustrações. As composições abaixo são
 * gráficas, abstratas e provisórias (componentes SVG em
 * src/components/illustrations.tsx), até que ilustrações autorais sejam
 * encomendadas. Para trocar, basta apontar `illustration` para outro id.
 */

export type IllustrationId = "memoria" | "fraternidade";

// Só datas marcadas com "CARD ESPECIAL:" no arquivo-fonte devem receber ilustração.
// A edição de outubro/2026 não marca nenhuma data especial.
// Exemplo: "2026-10-02": { id: "fraternidade", provisional: true },
export const illustrationByDate: Record<string, { id: IllustrationId; provisional: true }> = {};

export type BannerId = "nao-violencia" | "kardec" | "criancas" | "onu" | "finados";

/**
 * Faixas comemorativas animadas (src/components/date-banners.tsx), por dia
 * do ano ("MM-DD") — valem para qualquer edição. A faixa só aparece em dias
 * que têm leitura.
 */
export const bannerByDay: Record<string, BannerId> = {
  "10-02": "nao-violencia",
  "10-03": "kardec",
  "10-12": "criancas",
  "10-24": "onu",
  "11-02": "finados",
};
