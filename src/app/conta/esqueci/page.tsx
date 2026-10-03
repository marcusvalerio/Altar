import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";
import { RequestLinkForm } from "../forms";

export const metadata: Metadata = { title: "Nova senha" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Nova senha" subtitle="Informe o e-mail da sua conta." back={{ href: "/conta/", label: "Conta" }} />
      <RequestLinkForm mode="reset" />
    </Screen>
  );
}
