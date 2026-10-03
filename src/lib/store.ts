"use client";

// Persistência local mínima (localStorage) com useSyncExternalStore.
// Nada sai do aparelho: não há conta, servidor ou rastreamento.

import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "altar:";
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PREFIX + key);
  } catch {
    // Armazenamento indisponível (modo privado, bloqueado): usa o padrão.
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      value = isPlainObject(fallback) && isPlainObject(parsed) ? { ...fallback, ...parsed } : (parsed as T);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function write<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    // Sem persistência: mantém em memória durante a sessão.
  }
  cache.set(key, { raw, value });
  listeners.get(key)?.forEach((l) => l());
}

function subscribe(key: string, listener: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PREFIX + key) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function createStore<T>(key: string, fallback: T) {
  const sub = (l: () => void) => subscribe(key, l);
  const get = () => read(key, fallback);
  const getServer = () => fallback;

  function useValue() {
    return useSyncExternalStore(sub, get, getServer);
  }
  function set(next: T | ((prev: T) => T)) {
    const prev = get();
    write(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
  }
  return { key: PREFIX + key, get, set, useValue };
}

/** true somente depois da hidratação — evita divergência servidor/cliente. */
const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function useToggleInList<T>(store: ReturnType<typeof createStore<T[]>>) {
  return useCallback(
    (item: T) => store.set((list) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])),
    [store],
  );
}
