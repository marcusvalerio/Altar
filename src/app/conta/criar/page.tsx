import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";
import { RequestLinkForm } from "../forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Criar conta" subtitle="Só precisamos do seu e-mail." back={{ href: "/conta/", label: "Conta" }} />
      <RequestLinkForm mode="signup" />
    </Screen>
  );
}
