"use client";

import { useState } from "react";

const ENTERED = "altar:entered";

/**
 * Tela de entrada: aparece no primeiro acesso pela página inicial.
 * Não há conta nem cadastro — "Entrar" leva direto ao app.
 * (Links diretos para uma leitura nunca passam por ela; ver script no <head>.)
 */
export function Welcome() {
  const [leaving, setLeaving] = useState(false);

  function enter() {
    try {
      window.localStorage.setItem(ENTERED, "1");
    } catch {}
    setLeaving(true);
    window.setTimeout(() => document.documentElement.setAttribute("data-welcome", "skip"), 500);
  }

  return (
    <div className="welcome" data-leaving={leaving || undefined} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-line-soft" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-36 h-80 w-80 rounded-full border border-line-soft" />

      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col justify-between px-8 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-[calc(env(safe-area-inset-top)+4rem)]">
        <div />
        <div className="text-center">
          <h1 id="welcome-title" className="font-display text-[3.5rem] leading-none tracking-[0.06em] text-ink">
            ALTAR
          </h1>
          <p className="eyebrow mt-4">Devocional Espírita</p>
          <div aria-hidden="true" className="mx-auto my-10 h-[3px] w-10 rounded-full bg-mustard" />
          <p className="mx-auto max-w-[19rem] text-balance font-display text-[1.375rem] leading-snug text-ink">
            Um espaço digital para alguns minutos de leitura, reflexão e interiorização.
          </p>
        </div>
        <button
          type="button"
          onClick={enter}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-ink text-[1rem] font-medium text-bg transition-[background-color,transform] duration-300 hover:bg-ink-2 active:scale-[0.98]"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
