"use client";

import { useHydrated, createStore } from "./store";
import { localTodayISO, isValidISO } from "./dates";

export type ThemePref = "system" | "light" | "dark";
export type TextSize = "sm" | "md" | "lg" | "xl";

export type Preferences = { theme: ThemePref; textSize: TextSize };
export const preferences = createStore<Preferences>("prefs", { theme: "system", textSize: "md" });

export type FavoriteEntry = { id: string; savedAt: string };
export const favorites = createStore<FavoriteEntry[]>("favorites", []);

/** Dias concluídos: id → data/hora local da conclusão. */
export const completed = createStore<Record<string, string>>("completed", {});

export type NotificationPrefs = { enabled: boolean; time: string; lastShown?: string };
export const notificationPrefs = createStore<NotificationPrefs>("notifications", { enabled: false, time: "07:00" });

export const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "sm", label: "Pequeno" },
  { value: "md", label: "Médio" },
  { value: "lg", label: "Grande" },
  { value: "xl", label: "Muito grande" },
];

export const THEMES: { value: ThemePref; label: string }[] = [
  { value: "system", label: "Automático" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export function applyPreferences(p: Preferences) {
  const root = document.documentElement;
  if (p.theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p.theme);
  root.setAttribute("data-text", p.textSize);
}

export function setPreferences(patch: Partial<Preferences>) {
  preferences.set((prev) => {
    const next = { ...prev, ...patch };
    applyPreferences(next);
    return next;
  });
}

export function toggleFavorite(id: string) {
  favorites.set((list) =>
    list.some((f) => f.id === id) ? list.filter((f) => f.id !== id) : [{ id, savedAt: new Date().toISOString() }, ...list],
  );
}

export function markCompleted(id: string) {
  completed.set((prev) => (prev[id] ? prev : { ...prev, [id]: new Date().toISOString() }));
}

/**
 * "Hoje" no fuso do aparelho. Para pré-visualizar outro dia (desenvolvimento,
 * revisão editorial), use ?hoje=2026-10-03 na URL.
 * Retorna null antes da hidratação (exportação estática não conhece o dia).
 */
export function useToday(): string | null {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  try {
    // A pré-visualização vale para a sessão inteira (sobrevive à navegação).
    const param = new URLSearchParams(window.location.search).get("hoje");
    if (param && isValidISO(param)) window.sessionStorage.setItem("altar:hoje", param);
    const override = window.sessionStorage.getItem("altar:hoje");
    if (override && isValidISO(override)) return override;
  } catch {}
  return localTodayISO();
}
