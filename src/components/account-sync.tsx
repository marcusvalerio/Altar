"use client";

import { useEffect, useRef } from "react";
import { account, api, refreshAccount } from "@/lib/account";
import { type FavoriteEntry, type Preferences, completed, favorites, preferences, setPreferences } from "@/lib/state";

type Snapshot = { favorites: FavoriteEntry[]; completed: Record<string, string>; prefs: Preferences | null };

/**
 * Com a conta conectada, favoritos, leituras e preferências são sincronizados.
 * Na primeira sincronização, o que está no aparelho é somado ao que está na conta.
 */
export function AccountSync() {
  const { email } = account.useValue();
  const favs = favorites.useValue();
  const done = completed.useValue();
  const prefs = preferences.useValue();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    refreshAccount();
  }, []);

  // Primeira sincronização ao entrar.
  useEffect(() => {
    if (!email) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === email) return;
    let cancelled = false;
    (async () => {
      const r = await api<Snapshot>("/api/sync/");
      if (cancelled) return;
      if (!r.ok) {
        if (r.status === 401) account.set({ email: null });
        return;
      }
      const merged = new Map<string, FavoriteEntry>();
      for (const f of [...r.data.favorites, ...favorites.get()]) if (!merged.has(f.id)) merged.set(f.id, f);
      favorites.set([...merged.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
      completed.set({ ...r.data.completed, ...completed.get() });
      if (r.data.prefs) setPreferences(r.data.prefs);
      syncedFor.current = email;
      await api("/api/sync/", { favorites: favorites.get(), completed: completed.get(), prefs: preferences.get() }, "PUT");
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  // Depois, cada mudança no aparelho vai para a conta (com um pequeno atraso).
  useEffect(() => {
    if (!email || syncedFor.current !== email) return;
    const t = setTimeout(async () => {
      const r = await api("/api/sync/", { favorites: favs, completed: done, prefs }, "PUT");
      if (!r.ok && r.status === 401) account.set({ email: null });
    }, 1200);
    return () => clearTimeout(t);
  }, [email, favs, done, prefs]);

  return null;
}
