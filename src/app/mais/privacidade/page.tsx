import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Privacidade" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Privacidade" back={{ href: "/mais/", label: "Mais" }} />
      <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink">
        <p>O ALTAR pode ser lido sem cadastro, login, e-mail ou senha.</p>
        <p>
          Sem conta, suas preferências, favoritos, leituras concluídas e o horário do lembrete ficam guardados apenas neste
          aparelho, no armazenamento do navegador.
        </p>
        <p>
          Se você criar uma conta, guardamos seu e-mail, sua senha (de forma criptografada, sem possibilidade de leitura),
          seus favoritos, as leituras concluídas e as preferências de leitura, para que apareçam em qualquer aparelho. Você
          pode sair da conta quando quiser.
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
