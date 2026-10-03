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
        <h2 id="prefs" className="eyebrow animate-rise mb-3 px-1">
          Preferências
        </h2>
        {/* Grupo único, como nas configurações do sistema: blocos separados por fio. */}
        <div className="animate-rise delay-1 divide-y divide-line-soft overflow-hidden rounded-[24px] border border-line-soft bg-surface shadow-[var(--shadow)]">
          <div className="p-5">
            <PreferenceSettings />
          </div>
          <div className="p-5">
            <NotificationSettings />
          </div>
        </div>
      </section>

      <nav aria-label="Sobre" className="animate-rise delay-2 mt-12">
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex min-h-14 items-center justify-between py-3 text-[1rem] text-ink transition-colors hover:text-accent-ink">
                {l.label}
                <IconChevronRight size={18} className="text-muted transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-12 text-center text-xs text-muted">ALTAR · Devocional Espírita · versão 1.0</p>
    </Screen>
  );
}
