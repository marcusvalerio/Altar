"use client";

import { createStore } from "./store";

/** Conta é opcional: sem ela, tudo continua salvo só neste aparelho. */
export const account = createStore<{ email: string | null }>("account", { email: null });

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export async function api<T = Record<string, unknown>>(path: string, body?: unknown, method = body ? "POST" : "GET"): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: data.error ?? "Algo não saiu como esperado. Tente novamente." };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Sem conexão com a internet. Tente novamente." };
  }
}

export async function refreshAccount() {
  const r = await api<{ user: { email: string } | null }>("/api/auth/me/");
  if (r.ok) account.set({ email: r.data.user?.email ?? null });
}

export async function logout() {
  await api("/api/auth/logout/", {});
  account.set({ email: null });
}
