import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Privacidade" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Privacidade" back={{ href: "/mais/", label: "Mais" }} />
      <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink">
        <p>O ALTAR não pede cadastro, login, e-mail ou senha.</p>
        <p>
          Suas preferências, favoritos, leituras concluídas e o horário do lembrete ficam guardados apenas neste aparelho,
          no armazenamento do navegador. Nada disso é enviado para servidores.
        </p>
        <p>Não há anúncios, rastreamento ou compartilhamento de dados com terceiros.</p>
        <p>
          As imagens de compartilhamento são geradas no próprio aparelho. Elas só saem dele quando você escolhe enviá-las.
        </p>
        <p className="text-muted">
          Para apagar tudo, limpe os dados deste site nas configurações do navegador.
        </p>
      </div>
    </Screen>
  );
}
