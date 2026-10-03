"use client";

// Quando a leitura é aberta pelo card, o título e a linha chegam voando do
// card (View Transition). Nesse caso eles não fazem a entrada própria — senão
// as duas animações brigariam. Aberta de qualquer outro jeito, a entrada acontece.
import { type JSX, ViewTransition, useEffect } from "react";

let arriving: string | null = null;

export function markArrival(id: string) {
  arriving = id;
}

export function Arrive<T extends keyof JSX.IntrinsicElements>({
  id,
  as,
  enter,
  className = "",
  children,
}: {
  id: string;
  as: T;
  /** Classes de entrada (ex.: "animate-rise delay-2"), omitidas quando vem do card. */
  enter: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const fromCard = typeof window !== "undefined" && arriving === id;
  const Tag = as as unknown as React.ElementType;
  // Vale uma vez: a próxima abertura do mesmo dia (por outro caminho) volta a ter entrada.
  useEffect(() => {
    if (fromCard) setTimeout(() => (arriving = null), 0);
  }, [fromCard]);
  return <Tag className={`${className} ${fromCard ? "" : enter}`} aria-hidden={as === "div" ? true : undefined}>{children}</Tag>;
}

/**
 * Nome compartilhado com o card, ativo só quando a leitura foi aberta por ele.
 * Vindo de qualquer outro lugar não há View Transition — a tela troca na hora.
 */
export function MorphFrom({ id, name, share, children }: { id: string; name: string; share: string; children: React.ReactNode }) {
  const fromCard = typeof window !== "undefined" && arriving === id;
  if (!fromCard) return children;
  return (
    <ViewTransition name={name} share={share} default="none">
      {children}
    </ViewTransition>
  );
}
