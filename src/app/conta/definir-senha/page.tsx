import type { Metadata } from "next";
import { Suspense } from "react";
import { Screen, ScreenHeader } from "@/components/ui";
import { SetPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Criar senha", robots: { index: false } };

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Sua senha" />
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </Screen>
  );
}
