"use client";

import { useEffect, useState } from "react";

type State = "scatter" | "column" | "word" | "grow" | "done";

const LETTERS = ["A", "L", "T", "A", "R"];
// Posições iniciais dispersas (determinísticas para não divergir na hidratação).
const SCATTER = [
  { x: "-30vw", y: "-24vh", r: "-14deg" },
  { x: "22vw", y: "-31vh", r: "9deg" },
  { x: "-16vw", y: "27vh", r: "12deg" },
  { x: "28vw", y: "16vh", r: "-7deg" },
  { x: "6vw", y: "-9vh", r: "18deg" },
];

const SEEN_SESSION = "altar:splash";
const VISITED = "altar:visited";

/**
 * Abertura: letras dispersas → coluna A/L/T/A/R → ALTAR → cresce → Home.
 * Primeiro acesso: ~2,2 s. Acessos seguintes: ~0,7 s. Toque para pular.
 * Já vista nesta sessão: não aparece (ver script no <head>).
 */
export function Splash() {
  const [state, setState] = useState<State>("scatter");

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-splash") === "skip") return;

    let firstVisit = true;
    try {
      firstVisit = !window.localStorage.getItem(VISITED);
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const plan: [State, number][] = reduced
      ? [["word", 0], ["grow", 0], ["done", 600]]
      : firstVisit
        ? [["column", 420], ["word", 1050], ["grow", 1550], ["done", 2150]]
        : [["word", 0], ["grow", 200], ["done", 700]];

    const timers = plan.map(([s, t]) => window.setTimeout(() => setState(s), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    try {
      window.sessionStorage.setItem(SEEN_SESSION, "1");
      window.localStorage.setItem(VISITED, "1");
    } catch {}
    const t = window.setTimeout(() => document.documentElement.setAttribute("data-splash", "skip"), 600);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div
      className="splash"
      data-state={state}
      onClick={() => setState("done")}
      role="presentation"
      aria-hidden={state === "done"}
    >
      <div className="flex flex-col items-center">
        <div className="splash-word font-display text-[3.75rem] leading-none text-ink" aria-label="ALTAR">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className="splash-letter"
              aria-hidden="true"
              style={
                {
                  "--x": SCATTER[i].x,
                  "--y": SCATTER[i].y,
                  "--r": SCATTER[i].r,
                  "--cx": `${(2 - i) * 0.66}em`,
                  "--cy": `${(i - 2) * 1.02}em`,
                  transitionDelay: `${i * 45}ms`,
                  animationDelay: `${i * -0.6}s`,
                } as React.CSSProperties
              }
            >
              {l}
            </span>
          ))}
        </div>
        <p className="splash-sub eyebrow mt-4">Devocional Espírita</p>
      </div>
    </div>
  );
}
