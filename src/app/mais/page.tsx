import type { Metadata } from "next";
import Link from "next/link";
import { IconChevronRight } from "@/components/icons";
import { Screen, ScreenHeader } from "@/components/ui";
import { NotificationSettings, PreferenceSettings } from "./settings";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  { href: "/mais/sobre/", label: "Sobre o ALTAR" },
  { href: "/mais/conteudo/", label: "Sobre o conteúdo" },
  { href: "/mais/privacidade/", label: "Privacidade" },
];

export default function Page() {
  return (
    <Screen>
      <ScreenHeader title="Mais" />

      <section aria-labelledby="prefs">
        <h2 id="prefs" className="font-display text-[1.375rem] text-ink">
          Preferências
        </h2>
        <div className="mt-5 rounded-[24px] border border-line-soft bg-surface p-5">
          <PreferenceSettings />
        </div>
        <div className="mt-3 rounded-[24px] border border-line-soft bg-surface p-5">
          <NotificationSettings />
        </div>
      </section>

      <nav aria-label="Sobre" className="mt-12">
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex min-h-14 items-center justify-between py-3 text-[1rem] text-ink hover:text-accent-ink">
                {l.label}
                <IconChevronRight size={18} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-12 text-center text-xs text-muted">ALTAR · Devocional Espírita · versão 1.0</p>
    </Screen>
  );
}
