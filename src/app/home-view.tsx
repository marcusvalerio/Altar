"use client";

import Link from "next/link";
import { DevotionalCard, SpecialCard } from "@/components/cards";
import { MonthCalendar, pickMonth } from "@/components/month-calendar";
import { Screen, Wordmark } from "@/components/ui";
import { contentMonths, devotionals, firstDate, getDevotional, lastDate } from "@/content/devotionals";
import { longDate, weekday } from "@/lib/dates";
import { completed, useToday } from "@/lib/state";

export function HomeView() {
  const today = useToday();
  const done = completed.useValue();

  return (
    <Screen>
      <header className="flex items-center justify-between pt-2">
        <Wordmark />
      </header>

      {/* A data só existe no aparelho (exportação estática): espaço reservado até hidratar. */}
      <section aria-live="polite" className="mt-10 min-h-[4.75rem]">
        {today && (
          <div className="animate-fade">
            <h1 className="font-display text-[2.5rem] leading-none text-ink">{longDate(today)}</h1>
            <p className="mt-2 text-[0.9375rem] text-muted">{weekday(today)}</p>
          </div>
        )}
      </section>

      <div className="mt-8 min-h-[22rem]">{today && <TodaySection today={today} done={done} />}</div>

      {today && (
        <>
          <NextSpecial today={today} />
          <section className="animate-rise delay-2 mt-12 rounded-[24px] border border-line-soft p-5 sm:p-6">
            <MonthCalendar {...pickMonth(today, contentMonths)} today={today} completed={done} variant="compact" />
            <Link href="/calendario/" className="mt-4 inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
              Ver calendário
            </Link>
          </section>
        </>
      )}
    </Screen>
  );
}

function TodaySection({ today, done }: { today: string; done: Record<string, string> }) {
  const d = getDevotional(today);
  if (d) return <DevotionalCard devotional={d} done={Boolean(done[d.id])} />;

  // Fora do período com conteúdo: nada é inventado — mostramos o que existe.
  if (firstDate && today < firstDate) {
    const first = devotionals[0];
    return (
      <div>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-muted">
          Ainda não há leitura para hoje. As leituras começam em {longDate(first.date)}.
        </p>
        <DevotionalCard devotional={first} kicker="Primeira leitura" done={Boolean(done[first.id])} />
      </div>
    );
  }
  const last = devotionals[devotionals.length - 1];
  return (
    <div>
      <p className="mb-4 text-[0.9375rem] leading-relaxed text-muted">
        Ainda não há leitura para hoje. As leituras disponíveis vão até {lastDate ? longDate(lastDate) : ""}.
      </p>
      <DevotionalCard devotional={last} kicker="Última leitura disponível" done={Boolean(done[last.id])} />
    </div>
  );
}

/** Próxima data especial — contexto discreto, nunca o assunto principal. */
function NextSpecial({ today }: { today: string }) {
  const next = devotionals.find((d) => d.isSpecial && d.date > today);
  if (!next) return null;
  const days = Math.round((Date.parse(next.date) - Date.parse(today)) / 86_400_000);
  if (days > 21) return null;
  return (
    <section className="animate-rise delay-1 mt-10" aria-label="Próxima data especial">
      <p className="eyebrow mb-3">Em breve</p>
      <SpecialCard devotional={next} compact />
    </section>
  );
}
