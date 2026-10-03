"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import type { Devotional } from "@/content/types";
import { dayMonthUpper, shortDate, weekday } from "@/lib/dates";
import { IconArrowRight, IconCheck } from "./icons";
import { DateBanner, bannerFor } from "./date-banners";
import { DateIllustration, hasIllustration } from "./illustrations";
import { markArrival } from "./arrival";
import { ButtonLink } from "./ui";

/** Card editorial do dia. `kicker` explica o contexto quando não é "hoje". */
export function DevotionalCard({ devotional, kicker, done }: { devotional: Devotional; kicker?: string; done?: boolean }) {
  if (devotional.isSpecial) return <SpecialCard devotional={devotional} kicker={kicker} done={done} />;
  const [day, month] = shortDate(devotional.date).split(" ");
  const edition = bannerFor(devotional.date);
  return (
    <article className="animate-rise relative">
      {/* A superfície do card se expande e se dissolve ao abrir a leitura. */}
      <ViewTransition name={`surface-${devotional.id}`} share="surface" default="none">
        <div aria-hidden="true" className="absolute inset-0 rounded-[28px] border border-line-soft bg-surface shadow-[var(--shadow)]" />
      </ViewTransition>
      <div className="relative overflow-hidden rounded-[28px] p-7 sm:p-9">
        <CardOrbits />
        {edition && <DateBanner date={devotional.date} className="-mx-3 -mt-3 mb-7 sm:-mx-5 sm:-mt-5" />}
        <div className="relative flex items-start justify-between">
          <p className="font-display leading-none text-ink">
            <span className="text-[2.75rem] tabular-nums">{day}</span>
            <span className="ml-2 align-top text-sm tracking-[0.2em] text-muted">{month}</span>
          </p>
          {done && <DoneTag />}
        </div>
        {kicker && <p className="eyebrow mt-6 text-accent-ink">{kicker}</p>}
        <ViewTransition name={`title-${devotional.id}`} share="morph" default="none">
          <h2 className={`relative font-display text-[2rem] leading-[1.1] text-ink ${kicker ? "mt-2" : "mt-8"}`}>{devotional.title}</h2>
        </ViewTransition>
        <ViewTransition name={`rule-${devotional.id}`} share="morph" default="none">
          <div aria-hidden="true" className="mt-5 h-[3px] w-10 rounded-full bg-mustard" />
        </ViewTransition>
        <p className="mt-5 max-w-[22rem] text-[0.9375rem] leading-relaxed text-muted">
          Uma leitura para alguns minutos
          <br />
          de presença.
        </p>
        <ButtonLink href={`/devocional/${devotional.id}/`} onClick={() => markArrival(devotional.id)} className="group mt-8">
          Ler devocional
          <IconArrowRight size={18} className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-1" />
        </ButtonLink>
      </div>
    </article>
  );
}

/** Duas órbitas finas que giram muito devagar no canto do card. */
function CardOrbits() {
  return (
    <div aria-hidden="true" className="card-orbits pointer-events-none absolute -right-20 -top-20 h-56 w-56">
      <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
        <path d="M100 8C152 6 194 46 192 100C190 152 150 192 98 192C46 190 8 150 10 98C12 48 50 10 100 8Z" stroke="var(--line-soft)" />
        <path d="M128 -10C176 -8 214 34 210 84C206 132 166 168 120 164C72 160 40 120 44 72C48 26 84 -12 128 -10Z" stroke="var(--line-soft)" />
      </svg>
    </div>
  );
}

/** Data especial: porta de entrada editorial (rótulo vem do arquivo-fonte). */
export function SpecialCard({ devotional, kicker, done, compact }: { devotional: Devotional; kicker?: string; done?: boolean; compact?: boolean }) {
  const label = devotional.commemorativeDate?.label ?? "";
  return (
    <article className="animate-rise overflow-hidden rounded-[28px] bg-special text-special-ink shadow-[var(--shadow)]">
      {hasIllustration(devotional.date) && !compact && <DateIllustration date={devotional.date} className="aspect-[16/9] w-full" />}
      <div className={compact ? "p-6" : "p-7 sm:p-9"}>
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow text-special-muted">{dayMonthUpper(devotional.date)}</p>
          {done && <DoneTag onSpecial />}
        </div>
        {kicker && <p className="eyebrow mt-4 text-special-accent">{kicker}</p>}
        <p className={`text-[0.8125rem] font-medium uppercase leading-snug tracking-[0.14em] text-special-accent ${kicker ? "mt-1" : "mt-4"}`}>{label}</p>
        <h2 className={`mt-3 font-display leading-[1.12] ${compact ? "text-[1.5rem]" : "text-[2rem]"}`}>{devotional.title}</h2>
        {compact ? (
          <Link
            href={`/devocional/${devotional.id}/`}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium underline-offset-4 hover:underline"
          >
            Ler reflexão <IconArrowRight size={18} />
          </Link>
        ) : (
          <ButtonLink href={`/devocional/${devotional.id}/`} variant="onSpecial" className="mt-8">
            Ler reflexão
          </ButtonLink>
        )}
      </div>
    </article>
  );
}

function DoneTag({ onSpecial }: { onSpecial?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.75rem] ${onSpecial ? "text-special-muted" : "text-muted"}`}>
      <IconCheck size={14} /> Leitura concluída
    </span>
  );
}

/** Linha de lista (Favoritos, Calendário). */
export function DevotionalRow({ devotional, note }: { devotional: Devotional; note?: string }) {
  return (
    <Link href={`/devocional/${devotional.id}/`} className="group block py-5">
      <p className="eyebrow">
        {shortDate(devotional.date)} <span aria-hidden="true">·</span> {weekday(devotional.date)}
      </p>
      <p className="mt-1.5 font-display text-[1.375rem] leading-snug text-ink transition-colors group-hover:text-accent-ink">{devotional.title}</p>
      {note && <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">{note}</p>}
    </Link>
  );
}
