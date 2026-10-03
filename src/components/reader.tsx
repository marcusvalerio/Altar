"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Devotional } from "@/content/types";
import { renderShareImage } from "@/lib/share-image";
import { THEMES, TEXT_SIZES, completed, favorites, markCompleted, preferences, setPreferences, toggleFavorite, unmarkCompleted } from "@/lib/state";
import { useHydrated } from "@/lib/store";
import { IconArrowLeft, IconBookmark, IconCheck, IconClose, IconDownload, IconShare, IconTextSize } from "./icons";
import { Button } from "./ui";

/* ------------------------------------------------------------------------- */
/* Barra superior: voltar · tamanho do texto/tema · favoritar · progresso     */
/* ------------------------------------------------------------------------- */

export function ReaderBar({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const progress = useScrollProgress();

  function goBack() {
    const sameOrigin = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (sameOrigin && window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="border-b border-line-soft bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-2 sm:px-4">
          <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted hover:text-ink">
            <IconArrowLeft size={20} />
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
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="eyebrow mb-2.5">Tamanho do texto</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {TEXT_SIZES.map((s, i) => (
            <Segment key={s.value} active={prefs.textSize === s.value} onClick={() => setPreferences({ textSize: s.value })} label={s.label}>
              <span className="font-display" style={{ fontSize: `${15 + i * 3}px` }} aria-hidden="true">
                Aa
              </span>
            </Segment>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-2.5">Tema</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {THEMES.map((t) => (
            <Segment key={t.value} active={prefs.theme === t.value} onClick={() => setPreferences({ theme: t.value })} label={t.label}>
              <span className="text-[0.8125rem]">{t.label}</span>
            </Segment>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function Segment({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex min-h-12 items-center justify-center rounded-2xl border transition-colors duration-300 ${
        active ? "border-ink bg-ink text-bg" : "border-line-soft text-ink hover:border-line"
      }`}
    >
      {children}
    </button>
  );
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1);
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
  return p;
}

/* ------------------------------------------------------------------------- */

export function FavoriteButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const list = favorites.useValue();
  const hydrated = useHydrated();
  const active = hydrated && list.some((f) => f.id === id);
  const [pulse, setPulse] = useState(0);
  const label = active ? "Remover dos favoritos" : "Favoritar";

  const icon = (
    <span key={pulse} className={pulse ? "animate-pop inline-flex" : "inline-flex"}>
      <IconBookmark size={withLabel ? 20 : 22} filled={active} className={active ? "text-mustard-ink" : undefined} />
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
        {active ? "Favoritado" : "Favoritar"}
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-ink"
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
  // Animação só quando a pessoa acabou de marcar (não ao reabrir um dia já feito).
  const [justMarked, setJustMarked] = useState(false);

  return (
    <section aria-live="polite" className="mt-24 text-center">
      {isDone ? (
        <div key="done" className={justMarked ? "animate-rise" : ""}>
          <div aria-hidden="true" className="mx-auto mb-6 flex h-12 w-12 items-center justify-center">
            <span className={`block h-2.5 w-2.5 rounded-full bg-mustard ${justMarked ? "animate-breathe" : ""}`} />
          </div>
          <p className="eyebrow inline-flex items-center gap-1.5 text-ink">
            <IconCheck size={14} /> Leitura concluída
          </p>
          <p className="mx-auto mt-4 max-w-xs font-display text-[1.25rem] leading-snug text-ink">
            Que essa reflexão permaneça
            <br />
            com você ao longo do dia.
          </p>
          <button
            type="button"
            onClick={() => {
              unmarkCompleted(devotional.id);
              setJustMarked(false);
            }}
            className="mt-4 inline-flex min-h-11 items-center px-3 text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Desmarcar
          </button>
        </div>
      ) : (
        <div key="todo">
          <Button
            onClick={() => {
              markCompleted(devotional.id);
              setJustMarked(true);
            }}
            disabled={!hydrated}
          >
            <IconCheck size={18} /> Marcar como concluída
          </Button>
          <p className="mt-3 text-xs text-muted">O dia fica marcado no calendário.</p>
        </div>
      )}
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
      <Button variant="quiet" onClick={open}>
        <IconShare size={20} /> Compartilhar
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="share-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,26rem)] rounded-[28px] bg-surface p-0 text-ink shadow-[var(--shadow)] backdrop:bg-[#141312]/55 backdrop:backdrop-blur-sm"
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
