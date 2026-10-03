"use client";

import { useEffect, useState } from "react";
import { DevotionalRow } from "@/components/cards";
import { IconBookmark } from "@/components/icons";
import { Screen, ScreenHeader } from "@/components/ui";
import { getDevotional } from "@/content/devotionals";
import { type FavoriteEntry, favorites } from "@/lib/state";
import { useHydrated } from "@/lib/store";

export function FavoritesView() {
  const hydrated = useHydrated();
  const list = favorites.useValue();
  const [removed, setRemoved] = useState<{ entry: FavoriteEntry; index: number } | null>(null);

  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(null), 5000);
    return () => clearTimeout(t);
  }, [removed]);

  // Favoritos de dias que não existem mais no conteúdo são simplesmente ignorados.
  const items = list.map((f) => ({ f, d: getDevotional(f.id) })).filter((x) => x.d);

  function remove(entry: FavoriteEntry) {
    const index = list.findIndex((f) => f.id === entry.id);
    favorites.set((l) => l.filter((f) => f.id !== entry.id));
    setRemoved({ entry, index });
  }

  function undo() {
    if (!removed) return;
    favorites.set((l) => {
      const next = [...l];
      next.splice(Math.min(removed.index, next.length), 0, removed.entry);
      return next;
    });
    setRemoved(null);
  }

  return (
    <Screen>
      <ScreenHeader title="Favoritos" subtitle="Seus textos guardados" />

      {hydrated && items.length === 0 && (
        <div className="animate-rise mt-16 text-center">
          <span aria-hidden="true" className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-line text-muted">
            <IconBookmark size={22} />
          </span>
          <p className="font-display text-[1.375rem] leading-snug text-ink">Ainda não há textos guardados.</p>
          <p className="mx-auto mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-muted">
            Quando alguma leitura tocar você,
            <br />
            guarde-a aqui.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {items.map(({ f, d }) => (
            <li key={f.id} className="animate-fade flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <DevotionalRow devotional={d!} note={d!.commemorativeDate?.label ?? d!.closingPhrase} />
              </div>
              <button
                type="button"
                onClick={() => remove(f)}
                aria-label={`Remover “${d!.title}” dos favoritos`}
                title="Remover dos favoritos"
                className="mt-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-mustard-ink hover:bg-surface-2"
              >
                <IconBookmark size={20} filled />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 flex justify-center px-5">
        {removed && (
          <div className="animate-rise pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-bg shadow-[var(--shadow)]">
            Removido dos favoritos
            <button type="button" onClick={undo} className="min-h-10 rounded-full px-4 font-medium underline-offset-4 hover:underline">
              Desfazer
            </button>
          </div>
        )}
      </div>
    </Screen>
  );
}
