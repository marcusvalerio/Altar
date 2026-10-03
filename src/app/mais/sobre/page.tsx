import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Sobre o ALTAR" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader back={{ href: "/mais/", label: "Mais" }} />
      <div className="animate-rise mt-10 text-center">
        <h1 className="font-display text-[3.25rem] leading-none tracking-[0.06em] text-ink">ALTAR</h1>
        <p className="eyebrow mt-4">Devocional Espírita</p>
        <div aria-hidden="true" className="mx-auto my-12 h-[3px] w-10 rounded-full bg-mustard" />
        <p className="mx-auto max-w-xs font-display text-[1.375rem] leading-snug text-ink">
          Um espaço digital para alguns minutos
          <br />
          de leitura, reflexão e interiorização.
        </p>
      </div>
    </Screen>
  );
}
