"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import type { Devotional } from "@/content/types";
import { renderShareImage } from "@/lib/share-image";
import { THEMES, TEXT_SIZES, completed, favorites, markCompleted, preferences, setPreferences, toggleFavorite, unmarkCompleted } from "@/lib/state";
import { useHydrated } from "@/lib/store";
import { IconArrowLeft, IconBookmark, IconCheck, IconClose, IconDownload, IconShare, IconTextSize } from "./icons";
import { ease, spring } from "./motion";
import { Button } from "./ui";

/* ------------------------------------------------------------------------- */
/* Barra superior: voltar · tamanho do texto/tema · favoritar · progresso     */
/* ------------------------------------------------------------------------- */

export function ReaderBar({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { progress, hidden } = useScrollState();
  const tucked = hidden && !open;

  function goBack() {
    const sameOrigin = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (sameOrigin && window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      {/* Ao descer, a barra se recolhe e deixa só a linha de progresso; ao subir, volta. */}
      <div
        className="border-b border-line-soft bg-bg/85 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-settle)] supports-[backdrop-filter]:bg-bg/75"
        style={{ transform: tucked ? "translateY(calc(-100% + 2px))" : "none" }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-2 sm:px-4">
          <button type="button" onClick={goBack} className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted transition-colors hover:text-ink">
            <IconArrowLeft size={20} className="transition-transform duration-300 ease-[var(--ease-settle)] group-hover:-translate-x-0.5 group-active:-translate-x-1" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="reading-settings"
              aria-label="Tamanho do texto e tema"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-ink"
            >
              <IconTextSize size={22} />
            </button>
            <FavoriteButton id={id} />
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Progresso da leitura"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-[2px] w-full"
        >
          <div className="h-full origin-left bg-mustard transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      {open && <ReadingSettings onClose={() => setOpen(false)} />}
    </div>
  );
}

function ReadingSettings({ onClose }: { onClose: () => void }) {
  const prefs = preferences.useValue();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element).closest?.("[aria-controls='reading-settings']")) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  return (
    <div id="reading-settings" ref={ref} className="animate-rise mx-auto max-w-2xl px-3 pt-2 sm:px-4">
      <div className="ml-auto max-w-sm rounded-3xl border border-line-soft bg-surface p-5 shadow-[var(--shadow)]">
        <SettingsGroups prefs={prefs} />
      </div>
    </div>
  );
}

/** Controles de tamanho do texto e tema (usados na leitura e em Mais). */
export function SettingsGroups({ prefs }: { prefs: ReturnType<typeof preferences.useValue> }) {
  const uid = useId();
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="eyebrow mb-3">Tamanho do texto</legend>
        <div className="relative grid grid-cols-4 gap-1 rounded-[18px] bg-surface-2/70 p-1">
          {TEXT_SIZES.map((s, i) => (
            <Segment key={s.value} group={`${uid}-size`} active={prefs.textSize === s.value} onClick={() => setPreferences({ textSize: s.value })} label={s.label}>
              <span className="font-display" style={{ fontSize: `${15 + i * 3}px` }} aria-hidden="true">
                Aa
              </span>
            </Segment>
          ))}
        </div>
        {/* Prévia viva: o tamanho muda suavemente, como na leitura. */}
        <p aria-hidden="true" className="mt-3 font-display leading-snug text-ink-2 transition-[font-size] duration-500 ease-[var(--ease-settle)]" style={{ fontSize: "var(--reading-size)" }}>
          Assim fica o texto da leitura.
        </p>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Tema</legend>
        <div className="relative grid grid-cols-3 gap-1 rounded-[18px] bg-surface-2/70 p-1">
          {THEMES.map((t) => (
            <Segment key={t.value} group={`${uid}-theme`} active={prefs.theme === t.value} onClick={() => setPreferences({ theme: t.value })} label={t.label}>
              <span className="inline-flex items-center gap-2 text-[0.8125rem]">
                <ThemeSwatch value={t.value} />
                {t.label}
              </span>
            </Segment>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Amostra de papel do tema: claro, escuro ou meio a meio (automático). */
function ThemeSwatch({ value }: { value: string }) {
  const bg = value === "light" ? "#EBEBDF" : value === "dark" ? "#141312" : "linear-gradient(135deg, #EBEBDF 50%, #141312 50%)";
  return <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: bg }} />;
}

function Segment({ group, active, onClick, label, children }: { group: string; active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`relative flex min-h-12 items-center justify-center rounded-[14px] transition-colors duration-300 active:scale-[0.97] ${active ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {/* A pílula desliza até a opção escolhida. */}
      {active && <m.span layoutId={group} transition={spring.place} className="absolute inset-0 rounded-[14px] bg-surface shadow-[0_1px_2px_rgb(67_49_39/0.12),0_6px_16px_-10px_rgb(67_49_39/0.4)]" />}
      <span className="relative">{children}</span>
    </button>
  );
}

/** Progresso da leitura e se a barra deve se recolher (descendo, longe do topo). */
function useScrollState() {
  const [state, setState] = useState({ progress: 0, hidden: false });
  useEffect(() => {
    let raf = 0;
    let last = window.scrollY;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 1;
      const delta = y - last;
      last = y;
      setState((prev) => {
        let hidden = prev.hidden;
        if (y < 120 || progress > 0.985) hidden = false;
        else if (delta > 6) hidden = true;
        else if (delta < -6) hidden = false;
        return prev.progress === progress && prev.hidden === hidden ? prev : { progress, hidden };
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return state;
}

/* ------------------------------------------------------------------------- */

export function FavoriteButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const list = favorites.useValue();
  const hydrated = useHydrated();
  const active = hydrated && list.some((f) => f.id === id);
  const [pulse, setPulse] = useState(0);
  const label = active ? "Remover dos favoritos" : "Favoritar";

  // Ao guardar: o marcador assenta e um anel fino se abre e some. Ao remover: só esvazia.
  const icon = (
    <span className="relative inline-flex">
      <m.span key={pulse} initial={pulse && active ? { scale: 0.7 } : false} animate={{ scale: 1 }} transition={spring.touch} className="inline-flex">
        <IconBookmark size={withLabel ? 20 : 22} filled={active} className={`transition-colors duration-300 ${active ? "text-mustard-ink" : ""}`} />
      </m.span>
      <AnimatePresence>
        {pulse > 0 && active && (
          <m.span
            key={pulse}
            aria-hidden="true"
            initial={{ opacity: 0.6, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: ease.settle }}
            className="absolute inset-0 rounded-full border border-mustard"
          />
        )}
      </AnimatePresence>
    </span>
  );

  const onClick = () => {
    toggleFavorite(id);
    setPulse((n) => n + 1);
  };

  if (withLabel) {
    return (
      <Button variant="quiet" onClick={onClick} aria-pressed={active}>
        {icon}
        {active ? "Guardado" : "Favoritar"}
      </Button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink active:scale-95"
    >
      {icon}
    </button>
  );
}

/* ------------------------------------------------------------------------- */
/* Conclusão                                                                  */
/* ------------------------------------------------------------------------- */

export function Completion({ devotional }: { devotional: Devotional }) {
  const done = completed.useValue();
  const hydrated = useHydrated();
  const isDone = hydrated && Boolean(done[devotional.id]);
  // A sequência só acontece quando a pessoa acabou de marcar (não ao reabrir um dia já feito).
  const [justMarked, setJustMarked] = useState(false);
  const enter = (delay: number) =>
    justMarked
      ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, delay, ease: ease.settle } }
      : { initial: false as const };

  return (
    <section aria-live="polite" className="mt-24 text-center">
      <AnimatePresence mode="wait" initial={false}>
        {isDone ? (
          <m.div key="done" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            {/* Um ponto de luz, envolto por um traço que se fecha devagar. */}
            <div aria-hidden="true" className="relative mx-auto mb-7 h-14 w-14">
              <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90" fill="none">
                <m.circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="var(--mustard)"
                  strokeWidth="1"
                  initial={justMarked ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: ease.settle }}
                />
              </svg>
              <m.span
                className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] block h-2.5 w-2.5 rounded-full bg-mustard"
                initial={justMarked ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ ...spring.place, delay: 0.15 }}
              />
            </div>
            <m.p {...enter(0.35)} className="eyebrow inline-flex items-center gap-1.5 text-ink">
              <IconCheck size={14} /> Leitura concluída
            </m.p>
            {devotional.closingPhrase && (
              <m.p {...enter(0.6)} className="mx-auto mt-8 max-w-[28rem] text-balance font-display text-[calc(var(--reading-size)*1.35)] leading-[1.25] text-ink">
                {devotional.closingPhrase}
              </m.p>
            )}
            <m.p {...enter(0.9)} className="mx-auto mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-muted">
              Que essa reflexão permaneça
              <br />
              com você ao longo do dia.
            </m.p>
            <m.div {...enter(1.15)}>
              <button
                type="button"
                onClick={() => {
                  unmarkCompleted(devotional.id);
                  setJustMarked(false);
                }}
                className="mt-3 inline-flex min-h-11 items-center px-3 text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Desmarcar
              </button>
            </m.div>
          </m.div>
        ) : (
          <m.div key="todo" exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.28, ease: ease.calm } }}>
            <Button
              onClick={() => {
                setJustMarked(true);
                markCompleted(devotional.id);
              }}
              disabled={!hydrated}
            >
              <IconCheck size={18} /> Marcar como concluída
            </Button>
            <p className="mt-3 text-xs text-muted">O dia fica marcado no calendário.</p>
          </m.div>
        )}
      </AnimatePresence>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <FavoriteButton id={devotional.id} withLabel />
        <ShareButton devotional={devotional} />
      </div>
    </section>
  );
}

/** Marcar/desmarcar um dia fora da leitura (ex.: no calendário). */
export function CompleteToggle({ id }: { id: string }) {
  const done = completed.useValue();
  const hydrated = useHydrated();
  const isDone = hydrated && Boolean(done[id]);
  return (
    <button
      type="button"
      aria-pressed={isDone}
      disabled={!hydrated}
      onClick={() => (isDone ? unmarkCompleted(id) : markCompleted(id))}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-300 ${
        isDone ? "border-mustard bg-mustard text-[#2b211b]" : "border-line text-ink hover:border-ink"
      }`}
    >
      <IconCheck size={16} />
      {isDone ? "Concluída" : "Marcar como concluída"}
    </button>
  );
}

/* ------------------------------------------------------------------------- */
/* Compartilhamento                                                           */
/* ------------------------------------------------------------------------- */

export function ShareButton({ devotional }: { devotional: Devotional }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => () => (image ? URL.revokeObjectURL(image.url) : undefined), [image]);

  async function open() {
    dialog.current?.showModal();
    setNote("");
    if (image) return setState("ready");
    setState("loading");
    try {
      const blob = await renderShareImage(devotional);
      setImage({ blob, url: URL.createObjectURL(blob) });
      setState("ready");
    } catch {
      setState("error");
    }
  }

  const fileName = `altar-${devotional.id}.png`;

  async function share() {
    if (!image) return;
    const file = new File([image.blob], fileName, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "ALTAR · Devocional Espírita" });
      } catch {
        // Usuário cancelou: nada a fazer.
      }
    } else {
      download();
      setNote("Seu aparelho não abriu o compartilhamento. A imagem foi salva.");
    }
  }

  function download() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image.url;
    a.download = fileName;
    a.click();
  }

  return (
    <>
      <Button variant="quiet" onClick={open} className="group">
        <IconShare size={20} className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:-translate-y-0.5" /> Compartilhar
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="share-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="sheet m-auto w-[min(92vw,26rem)] rounded-[28px] bg-surface p-0 text-ink shadow-[var(--shadow)] backdrop:bg-[#141312]/55 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 id="share-title" className="eyebrow text-ink">
              Compartilhar
            </h2>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar" className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-ink">
              <IconClose size={20} />
            </button>
          </div>
          <div className="mx-auto mt-3 aspect-[9/16] max-h-[56vh] overflow-hidden rounded-2xl bg-surface-2">
            {state === "ready" && image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={`Imagem para compartilhar: ${devotional.closingPhrase ?? devotional.title}`} className="animate-fade h-full w-full object-contain" />
            )}
            {state === "loading" && <p className="flex h-full items-center justify-center text-sm text-muted">Preparando a imagem…</p>}
            {state === "error" && (
              <p className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
                Não conseguimos preparar a imagem agora. Tente novamente.
              </p>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted">1080 × 1920 · Stories e Status</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="quiet" onClick={download} disabled={state !== "ready"}>
              <IconDownload size={18} /> Salvar
            </Button>
            <Button onClick={share} disabled={state !== "ready"}>
              <IconShare size={18} /> Enviar
            </Button>
          </div>
          {note && <p className="mt-3 text-center text-xs text-muted">{note}</p>}
        </div>
      </dialog>
    </>
  );
}
