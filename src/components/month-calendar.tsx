"use client";

import { m } from "motion/react";
import Link from "next/link";
import { useId } from "react";
import { bannerFor } from "./date-banners";
import { spring } from "./motion";
import { getDevotional } from "@/content/devotionals";
import { WEEKDAY_INITIALS, WEEKDAY_NAMES, accessibleDate, monthGrid, monthName } from "@/lib/dates";

type Props = {
  year: number;
  month: number;
  today: string | null;
  completed: Record<string, string>;
  /** compact = Home (links diretos); full = tela Calendário (seleção). */
  variant: "compact" | "full";
  selected?: string;
  onSelect?: (iso: string) => void;
};

export function MonthCalendar({ year, month, today, completed, variant, selected, onSelect }: Props) {
  const cells = monthGrid(year, month);
  const full = variant === "full";
  const pill = useId();

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        {full ? (
          <h2 className="font-display text-[1.75rem] capitalize leading-none text-ink">
            {monthName(month)} <span className="text-[1rem] text-muted">{year}</span>
          </h2>
        ) : (
          <h2 className="eyebrow text-ink">
            {monthName(month)} <span className="text-muted">{year}</span>
          </h2>
        )}
      </div>

      <div role="grid" aria-label={`${monthName(month)} de ${year}`} className="grid grid-cols-7 gap-y-1">
        <div role="row" className="contents">
          {WEEKDAY_INITIALS.map((d, i) => (
            <div role="columnheader" key={i} aria-label={WEEKDAY_NAMES[i]} className="pb-2 text-center text-[0.6875rem] font-medium text-muted">
              {d}
            </div>
          ))}
        </div>
        {chunk(cells, 7).map((week, w) => (
          <div role="row" className="contents" key={w}>
            {week.map((iso, i) => {
              if (!iso) return <div role="gridcell" key={`e${w}${i}`} />;
              const d = getDevotional(iso);
              const day = Number(iso.slice(8));
              const isToday = iso === today;
              const isRead = Boolean(completed[iso]);
              const isSelected = full && iso === selected;
              const isEdition = Boolean(d && (d.isSpecial || bannerFor(iso)));
              const label = [
                accessibleDate(iso),
                d ? d.title : "sem leitura",
                isToday ? "hoje" : "",
                isRead ? "leitura concluída" : "",
                d?.commemorativeDate ? `data especial: ${d.commemorativeDate.label.toLowerCase()}` : isEdition ? "edição especial" : "",
              ]
                .filter(Boolean)
                .join(". ");

              // Estados: lido = papel tingido de mostarda; hoje = um traço azul sob o número;
              // edição especial = um losango; selecionado = a pílula escura que desliza.
              const circle = `relative mx-auto flex items-center justify-center rounded-full tabular-nums transition-[color,background-color,transform] duration-300 active:scale-[0.94] ${
                full ? "h-11 w-11 text-[1rem]" : "h-9 w-9 text-[0.8125rem]"
              } ${
                isSelected
                  ? "text-bg"
                  : isRead
                    ? "bg-mustard/25 text-mustard-ink"
                    : d
                      ? "text-ink hover:bg-surface-2/70"
                      : "text-muted/40"
              }`;

              const inner = (
                <>
                  {isSelected && <m.span layoutId={pill} transition={spring.place} className="absolute inset-0 rounded-full bg-ink" />}
                  <span className="relative">{String(day).padStart(2, "0")}</span>
                  {isToday && (
                    <span aria-hidden="true" className={`absolute bottom-[5px] left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full ${isSelected ? "bg-bg" : "bg-accent"}`} />
                  )}
                  {isEdition && (
                    <span
                      aria-hidden="true"
                      className={`absolute right-[7px] top-[7px] h-[5px] w-[5px] rotate-45 ${isSelected ? "bg-bg" : "bg-terracotta"}`}
                    />
                  )}
                </>
              );

              return (
                <div role="gridcell" key={iso} className="py-0.5" aria-current={isToday ? "date" : undefined}>
                  {!d ? (
                    <span className={circle} aria-label={label}>
                      {inner}
                    </span>
                  ) : full ? (
                    <button type="button" className={circle} aria-label={label} aria-pressed={isSelected} onClick={() => onSelect?.(iso)}>
                      {inner}
                    </button>
                  ) : (
                    <Link href={`/devocional/${iso}/`} className={circle} aria-label={label}>
                      {inner}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.75rem] text-muted" aria-label="Legenda">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-[2px] w-3 rounded-full bg-accent" /> hoje
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-mustard/40" /> lida
        </li>
        {cells.some((iso) => iso && getDevotional(iso) && (getDevotional(iso)?.isSpecial || bannerFor(iso))) && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-terracotta" /> edição especial
          </li>
        )}
      </ul>
    </div>
  );
}

function chunk<T>(list: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Mês a exibir: o atual se tiver conteúdo; senão, o mês com conteúdo mais próximo. */
export function pickMonth(today: string | null, months: string[]) {
  const current = today?.slice(0, 7);
  const ym = current && months.includes(current) ? current : current && current > months[months.length - 1] ? months[months.length - 1] : months[0];
  const [year, month] = ym.split("-").map(Number);
  return { year, month };
}
