"use client";

import Link from "next/link";
import { useState } from "react";
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

  return (
    <Screen>
      <ScreenHeader title="Calendário" subtitle="Escolha um dia para ler." />

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
          <MonthCalendar year={year} month={month} today={today} completed={done} variant="full" selected={selected} onSelect={setPicked} />
        )}
      </div>

      <section aria-live="polite" className="mt-8 min-h-[11rem]">
        {d && (
          <div key={d.id} className="animate-rise">
            <Link
              href={`/devocional/${d.id}/`}
              className={`group block rounded-[24px] p-6 transition-colors ${
                d.isSpecial ? "bg-special text-special-ink" : "border border-line-soft bg-surface hover:border-line"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`eyebrow ${d.isSpecial ? "text-special-muted" : ""}`}>
                  {dayMonthUpper(d.date)} <span aria-hidden="true">·</span> {weekday(d.date)}
                </p>
                {done[d.id] && (
                  <span className={`inline-flex items-center gap-1 text-xs ${d.isSpecial ? "text-special-muted" : "text-muted"}`}>
                    <IconCheck size={14} /> concluída
                  </span>
                )}
              </div>
              {d.commemorativeDate && <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-special-accent">{d.commemorativeDate.label}</p>}
              <p className="mt-3 font-display text-[1.75rem] leading-tight">{d.title}</p>
              <p className={`mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-medium ${d.isSpecial ? "" : "text-ink"}`}>
                Ler <IconArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </p>
            </Link>
            <div className="mt-3 flex justify-end">
              <CompleteToggle id={d.id} />
            </div>
          </div>
        )}
      </section>
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
