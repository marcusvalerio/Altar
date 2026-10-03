"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBookmark, IconCalendar, IconMore, IconToday } from "./icons";

const ITEMS = [
  { href: "/", label: "Início", Icon: IconToday },
  { href: "/calendario/", label: "Calendário", Icon: IconCalendar },
  { href: "/favoritos/", label: "Favoritos", Icon: IconBookmark },
  { href: "/mais/", label: "Mais", Icon: IconMore },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  // A leitura é imersiva: sem barra de navegação.
  if (pathname.startsWith("/devocional")) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] tracking-wide transition-colors duration-300 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="relative transition-transform duration-300 ease-[var(--ease-settle)] group-active:scale-90">
                  <Icon size={22} />
                  {/* O ponto azul acende na aba escolhida (só CSS: nada é medido na troca de tela). */}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-1/2 -ml-[2px] h-1 w-1 rounded-full bg-accent transition-[opacity,transform] duration-500 ease-[var(--ease-settle)] ${
                      active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                </span>
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
