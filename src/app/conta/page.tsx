import type { Metadata } from "next";
import { Suspense } from "react";
import { Screen, ScreenHeader } from "@/components/ui";
import { AccountHome, WelcomeNote } from "./forms";

export const metadata: Metadata = { title: "Conta" };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Conta" subtitle="Opcional. A leitura nunca depende dela." back={{ href: "/mais/", label: "Mais" }} />
      <Suspense>
        <WelcomeNote />
      </Suspense>
      <AccountHome />
    </Screen>
  );
}
