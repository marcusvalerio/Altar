import Link from "next/link";
import type { Devotional } from "@/content/types";
import { dayMonthUpper, shortDate, weekday } from "@/lib/dates";
import { IconArrowRight, IconCheck } from "./icons";
import { DateIllustration, hasIllustration } from "./illustrations";
import { ButtonLink } from "./ui";

/** Card editorial do dia. `kicker` explica o contexto quando não é "hoje". */
export function DevotionalCard({ devotional, kicker, done }: { devotional: Devotional; kicker?: string; done?: boolean }) {
  if (devotional.isSpecial) return <SpecialCard devotional={devotional} kicker={kicker} done={done} />;
  const [day, month] = shortDate(devotional.date).split(" ");
  return (
    <article className="animate-rise relative overflow-hidden rounded-[28px] border border-line-soft bg-surface p-7 shadow-[var(--shadow)] sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-line-soft" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-24 h-48 w-48 rounded-full border border-line-soft" />
      <div className="flex items-start justify-between">
        <p className="font-display leading-none text-ink">
          <span className="text-[2.75rem] tabular-nums">{day}</span>
          <span className="ml-2 align-top text-sm tracking-[0.2em] text-muted">{month}</span>
        </p>
        {done && <DoneTag />}
      </div>
      {kicker && <p className="eyebrow mt-6 text-accent-ink">{kicker}</p>}
      <h2 className={`font-display text-[2rem] leading-[1.1] text-ink ${kicker ? "mt-2" : "mt-8"}`}>{devotional.title}</h2>
      <p className="mt-4 max-w-[22rem] text-[0.9375rem] leading-relaxed text-muted">
        Uma leitura para alguns minutos
        <br />
        de presença.
      </p>
      <ButtonLink href={`/devocional/${devotional.id}/`} className="mt-8">
        Ler devocional
      </ButtonLink>
    </article>
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
