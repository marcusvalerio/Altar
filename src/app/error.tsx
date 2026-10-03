"use client";

import { Button, ButtonLink, Screen } from "@/components/ui";

// Nunca mostramos o erro técnico para quem está lendo.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
      <p className="font-display text-[1.5rem] leading-snug text-ink">Não conseguimos abrir esta leitura agora.</p>
      <p className="mt-3 text-[0.9375rem] text-muted">Tente novamente.</p>
      <div className="mt-10 flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <ButtonLink href="/" variant="quiet">
          Início
        </ButtonLink>
      </div>
    </Screen>
  );
}
