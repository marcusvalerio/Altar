/**
 * Arquitetura para uma futura biblioteca de CITAÇÕES LITERAIS verificadas.
 *
 * Intencionalmente vazia no MVP. Nenhuma citação deve ser adicionada sem
 * obra, edição e página conferidas — nunca gerar ou "completar" citações.
 * Citação literal é diferente de "Fonte de inspiração" (InspirationSource).
 */

export type QuoteVerificationStatus = "unverified" | "in_review" | "verified" | "rejected";

export type VerifiedQuote = {
  id: string;
  /** Texto literal, exatamente como na edição consultada. */
  text: string;
  author: string;
  /** Distinguir obra original, tradução e edição (direitos autorais). */
  work: string;
  originalWork?: string;
  translator?: string;
  edition: string;
  publisher?: string;
  year?: number;
  chapter?: string;
  question?: string;
  page?: string;
  /** Onde a citação foi conferida (ex.: exemplar físico, PDF da editora). */
  sourceOfVerification: string;
  status: QuoteVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  /** Situação de direitos: domínio público, licença, citação curta (art. 46 da Lei 9.610/98)… */
  rights: "public_domain" | "licensed" | "short_quotation" | "unknown";
};

export const verifiedQuotes: VerifiedQuote[] = [];

/** Só citações verificadas podem ser exibidas. */
export function displayableQuotes() {
  return verifiedQuotes.filter((q) => q.status === "verified" && q.rights !== "unknown");
}
