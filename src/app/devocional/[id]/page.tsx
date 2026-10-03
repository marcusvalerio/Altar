import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";
import { DateBanner, editionFor } from "@/components/date-banners";
import { DateIllustration, hasIllustration } from "@/components/illustrations";
import { Completion, ReaderBar } from "@/components/reader";
import { devotionals, getDevotional, neighbours, paragraphs } from "@/content/devotionals";
import { accessibleDate, shortDate, weekday } from "@/lib/dates";

export const dynamicParams = false;

export function generateStaticParams() {
  return devotionals.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = getDevotional((await params).id);
  return d ? { title: `${d.title} — ${shortDate(d.date)}` } : {};
}

/**
 * A página mais importante: uma página de livro.
 * Ordem fixa: reflexão → interiorização → prece → prática → frase final → fonte.
 * O texto é renderizado exatamente como no arquivo-fonte.
 */
export default async function DevotionalPage({ params }: { params: Promise<{ id: string }> }) {
  const d = getDevotional((await params).id);
  if (!d) notFound();
  const { previous, next } = neighbours(d.id);
  const edition = editionFor(d.date);

  return (
    <>
      <ReaderBar id={d.id} />
      {edition && (
        // Edição especial: a página ganha um banho de cor da data, que se perde no papel.
        <div
          aria-hidden="true"
          className="animate-fade pointer-events-none absolute inset-x-0 top-0 h-[34rem]"
          style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${edition.color} 22%, transparent), transparent)` }}
        />
      )}
      <main className="relative mx-auto w-full max-w-[38rem] px-6 pb-[calc(env(safe-area-inset-bottom)+4rem)] pt-[calc(env(safe-area-inset-top)+6rem)] sm:px-8">
        <article lang="pt-BR">
          <header>
            {d.isSpecial && hasIllustration(d.date) && (
              <DateIllustration date={d.date} className="animate-rise -mx-2 mb-10 aspect-[16/9] rounded-[24px] bg-special sm:mx-0" />
            )}
            {edition && (
              <>
                <p className="eyebrow animate-rise mb-3 text-ink">Edição especial</p>
                <DateBanner date={d.date} className="animate-rise delay-1 mb-10 shadow-[var(--shadow)]" />
              </>
            )}
            <p className="eyebrow animate-rise delay-1">
              <time dateTime={d.date} aria-label={accessibleDate(d.date)}>
                {shortDate(d.date)} <span aria-hidden="true">·</span> {weekday(d.date)}
              </time>
            </p>
            {d.commemorativeDate && (
              <p className="animate-rise delay-2 mt-4 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-terracotta">{d.commemorativeDate.label}</p>
            )}
            <h1 className="reading-title animate-rise delay-2 mt-4 font-display text-ink">{d.title}</h1>
            <div aria-hidden="true" className="animate-draw delay-4 mt-8 h-[3px] w-10 rounded-full bg-mustard" />
          </header>

          <Section label="Reflexão" className="mt-12">
            <div className="reading">
              {paragraphs(d.reflection).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>

          {d.interiorization && (
            <Section label="Momento de interiorização">
              <div className="border-y border-line-soft py-10 text-center">
                <span aria-hidden="true" className="animate-breathe mx-auto mb-7 block h-2 w-2 rounded-full bg-accent" />
                {paragraphs(d.interiorization).map((p, i) => (
                  <p key={i} className="mx-auto max-w-[30rem] font-display text-[calc(var(--reading-size)*1.3)] leading-[1.35] text-ink">
                    {p}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {d.prayer && (
            <Section label="Prece">
              <div className="reading border-l-2 border-mustard/70 pl-6 text-ink-2">
                {paragraphs(d.prayer).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Section>
          )}

          {d.practice && (
            <Section label="Prática do dia">
              <div className="reading rounded-[20px] bg-surface-2/60 px-6 py-5">
                {paragraphs(d.practice).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Section>
          )}

          {d.closingPhrase && (
            <section aria-label="Frase final" className="reveal my-28 text-center">
              <p className="eyebrow mb-8">Frase final</p>
              <p className="closing-phrase mx-auto max-w-[32rem] text-balance font-display text-ink">{d.closingPhrase}</p>
            </section>
          )}

          {/* Fonte: somente ao final, discreta. "Fonte de inspiração" ≠ citação literal. Rótulo vem do arquivo. */}
          {d.source && (
            <footer className="border-t border-line-soft pt-6">
              <p className="eyebrow">{d.source.label.toLowerCase()}</p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{d.source.text}</p>
            </footer>
          )}
        </article>

        <Completion devotional={d} />

        <nav aria-label="Outros dias" className="mt-20 grid grid-cols-2 gap-3 border-t border-line-soft pt-6 text-sm">
          {previous ? (
            <Link href={`/devocional/${previous.id}/`} className="group flex min-h-11 flex-col gap-1 rounded-xl py-2 text-muted hover:text-ink">
              <span className="inline-flex items-center gap-1.5 text-xs">
                <IconArrowLeft size={14} /> {shortDate(previous.date)}
              </span>
              <span className="font-display text-base text-ink">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/devocional/${next.id}/`} className="group flex min-h-11 flex-col items-end gap-1 rounded-xl py-2 text-right text-muted hover:text-ink">
              <span className="inline-flex items-center gap-1.5 text-xs">
                {shortDate(next.date)} <IconArrowRight size={14} />
              </span>
              <span className="font-display text-base text-ink">{next.title}</span>
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}

function Section({ label, children, className = "mt-16" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={label} className={className}>
      <h2 className="eyebrow mb-5">{label}</h2>
      {children}
    </section>
  );
}
