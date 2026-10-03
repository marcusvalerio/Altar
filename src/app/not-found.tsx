import { ButtonLink, Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
      <p className="font-display text-[1.5rem] leading-snug text-ink">Não conseguimos abrir esta leitura agora.</p>
      <p className="mt-3 text-[0.9375rem] text-muted">Tente novamente.</p>
      <ButtonLink href="/" variant="quiet" className="mt-10">
        Voltar ao início
      </ButtonLink>
    </Screen>
  );
}
