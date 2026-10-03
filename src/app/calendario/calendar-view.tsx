"use client";

import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { DateBanner } from "@/components/date-banners";
import { ease } from "@/components/motion";
import { IconArrowRight, IconCheck, IconChevronLeft, IconChevronRight } from "@/components/icons";
import { MonthCalendar, pickMonth } from "@/components/month-calendar";
import { CompleteToggle } from "@/components/reader";
import { Screen, ScreenHeader } from "@/components/ui";
import { contentMonths, devotionals, getDevotional } from "@/content/devotionals";
import { dayMonthUpper, monthName, weekday } from "@/lib/dates";
import { completed, useToday } from "@/lib/state";

export function CalendarView() {
  const today = useToday();
  const done = completed.useValue();
  const [chosenMonth, setChosenMonth] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const initial = pickMonth(today, contentMonths);
  const ym = chosenMonth ?? `${initial.year}-${String(initial.month).padStart(2, "0")}`;
  const [year, month] = ym.split("-").map(Number);
  const idx = contentMonths.indexOf(ym);

  const fallback = today && getDevotional(today) && today.startsWith(ym) ? today : devotionals.find((d) => d.date.startsWith(ym))?.date;
  const selected = picked && picked.startsWith(ym) ? picked : fallback;
  const d = selected ? getDevotional(selected) : undefined;

  // Direção da troca: um dia adiante entra pela direita, um dia atrás pela esquerda.
  const [dir, setDir] = useState(1);
  const select = (iso: string) => {
    setDir(selected && iso < selected ? -1 : 1);
    setPicked(iso);
  };
  const monthDays = devotionals.filter((x) => x.date.startsWith(ym));

  return (
    <Screen>
      <ScreenHeader title="Calendário" subtitle="O índice da edição. Escolha um dia para ler." />

      {contentMonths.length > 1 && (
        <div className="mb-4 flex items-center justify-between">
          <MonthStep disabled={idx <= 0} onClick={() => setChosenMonth(contentMonths[idx - 1])} label="Mês anterior">
            <IconChevronLeft size={20} />
          </MonthStep>
          <span className="text-sm capitalize text-muted">
            {monthName(month)} {year}
          </span>
          <MonthStep disabled={idx >= contentMonths.length - 1} onClick={() => setChosenMonth(contentMonths[idx + 1])} label="Próximo mês">
            <IconChevronRight size={20} />
          </MonthStep>
        </div>
      )}

      <div className="min-h-[22rem]">
        {today !== null && (
          <MonthCalendar year={year} month={month} today={today} completed={done} variant="full" selected={selected} onSelect={select} />
        )}
      </div>

      <section aria-live="polite" className="relative mt-8 min-h-[12rem]">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          {d && (
            <m.div
              key={d.id}
              custom={dir}
              variants={{
                enter: (k: number) => ({ opacity: 0, x: 14 * k, filter: "blur(3px)" }),
                center: { opacity: 1, x: 0, filter: "blur(0px)" },
                exit: (k: number) => ({ opacity: 0, x: -10 * k, filter: "blur(2px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: ease.settle }}
            >
              <Link
                href={`/devocional/${d.id}/`}
                className={`group block overflow-hidden rounded-[24px] p-6 transition-[border-color,transform] duration-300 active:scale-[0.99] ${
                  d.isSpecial ? "bg-special text-special-ink" : "border border-line-soft bg-surface hover:border-line"
                }`}
              >
                <DateBanner date={d.date} className="-mx-3 -mt-3 mb-5" />
                <div className="flex items-start justify-between gap-3">
                  <p className={`eyebrow ${d.isSpecial ? "text-special-muted" : ""}`}>
                    {dayMonthUpper(d.date)} <span aria-hidden="true">·</span> {weekday(d.date)}
                  </p>
                  {done[d.id] && (
                    <span className={`inline-flex items-center gap-1 text-xs ${d.isSpecial ? "text-special-muted" : "text-muted"}`}>
                      <IconCheck size={14} /> lida
                    </span>
                  )}
                </div>
                {d.commemorativeDate && <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-special-accent">{d.commemorativeDate.label}</p>}
                <p className="mt-3 font-display text-[1.75rem] leading-tight">{d.title}</p>
                <p className={`mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-medium ${d.isSpecial ? "" : "text-ink"}`}>
                  Ler <IconArrowRight size={18} className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-1" />
                </p>
              </Link>
              <div className="mt-3 flex justify-end">
                <CompleteToggle id={d.id} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </section>

      {/* Índice: todos os títulos do mês, como o sumário de um livro. */}
      {monthDays.length > 0 && (
        <section aria-labelledby="indice" className="mt-14">
          <h2 id="indice" className="eyebrow mb-2">
            Sumário
          </h2>
          <ol className="divide-y divide-line-soft border-y border-line-soft">
            {monthDays.map((x) => {
              const active = x.date === selected;
              return (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => select(x.date)}
                    aria-current={active ? "true" : undefined}
                    className="group flex min-h-12 w-full items-baseline gap-4 py-3 text-left"
                  >
                    <span className={`w-6 shrink-0 text-sm tabular-nums transition-colors ${active ? "text-ink" : "text-muted"}`}>{x.date.slice(8)}</span>
                    <span className={`flex-1 font-display text-[1.0625rem] leading-snug transition-colors ${active ? "text-ink" : "text-ink-2 group-hover:text-ink"}`}>
                      {x.title}
                    </span>
                    {done[x.id] && <IconCheck size={14} className="shrink-0 text-mustard-ink" aria-label="lida" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </Screen>
  );
}

function MonthStep({ disabled, onClick, label, children }: { disabled: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={label} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-ink disabled:opacity-30">
      {children}
    </button>
  );
}
