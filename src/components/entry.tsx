"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Abertura do ALTAR.
 *
 * Um campo de letras (A, L, T, A, R) caminha devagar em fileiras diagonais e
 * onduladas. Ao tocar em "Entrar", cinco letras do próprio campo se deslocam
 * até o centro e formam ALTAR; as outras se apagam e o app se abre.
 *
 * Aparece uma vez por sessão, só pela página inicial (ver script no <head>).
 * Com "reduzir movimento", o campo fica parado e a passagem é instantânea.
 */

const WORD = ["A", "L", "T", "A", "R"];
const BG = "#433127";
const INK = "#EBEBDF";
const SESSION_KEY = "altar:entered";

type Glyph = {
  ch: string;
  col: number;
  row: number;
  spin: number; // rotação própria (rad)
  phase: number;
};

type Frozen = { x: number; y: number; rot: number };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function Entry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<(() => void) | null>(null);
  const [stage, setStage] = useState<"idle" | "forming" | "formed" | "leaving">("idle");

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-entry") === "skip") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = getComputedStyle(root).getPropertyValue("--font-faculty").trim() || "Georgia, serif";

    let W = 0;
    let H = 0;
    let cell = 48;
    let size = 26;
    let cols = 0;
    let rows = 0;
    let alongMin = 0;
    let acrossMin = 0;
    let glyphs: Glyph[] = [];
    let raf = 0;
    let fontReady = false;

    // Fileiras inclinadas (sobem para a direita), como na referência.
    const angle = (-13 * Math.PI) / 180;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = Math.max(40, Math.min(58, Math.min(W, H) / 9));
      size = cell * 0.55;
      // Cobre a tela inteira: limites dos 4 cantos no sistema girado das fileiras.
      const corners = [
        [0, 0],
        [W, 0],
        [0, H],
        [W, H],
      ];
      const along = corners.map(([x, y]) => x * ux + y * uy);
      const across = corners.map(([x, y]) => -x * uy + y * ux);
      alongMin = Math.min(...along) - cell * 2;
      acrossMin = Math.min(...across) - cell * 2;
      cols = Math.ceil((Math.max(...along) - alongMin) / cell) + 3;
      rows = Math.ceil((Math.max(...across) - acrossMin) / (cell * 0.95)) + 3;

      glyphs = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Sequência A L T A R ao longo da fileira, deslocada a cada linha.
          const ch = WORD[(((c + r * 2) % 5) + 5) % 5];
          const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
          const rnd = seed - Math.floor(seed);
          glyphs.push({ ch, col: c, row: r, spin: (rnd - 0.5) * 0.5, phase: rnd * Math.PI * 2 });
        }
      }
    }

    /** Posição de uma letra do campo no instante t (ms). */
    function fieldPos(g: Glyph, t: number): Frozen {
      const span = cols * cell;
      const drift = reduced ? 0 : (t * 0.012) % span; // caminhada lenta ao longo da fileira
      let along = g.col * cell + drift + (g.row % 2) * cell * 0.5;
      along = (((along % span) + span) % span) + alongMin;
      const across = g.row * cell * 0.95 + acrossMin;
      // Onda: cada fileira ondula, e a onda percorre o campo.
      const wave = reduced ? 0 : Math.sin(g.col * 0.42 + g.row * 0.55 + t * 0.0011) * cell * 0.32;
      const x = along * ux - across * uy;
      const y = along * uy + across * ux + wave;
      const rot = g.spin + (reduced ? 0 : Math.sin(t * 0.0009 + g.phase) * 0.08);
      return { x, y, rot };
    }

    function drawGlyph(ch: string, x: number, y: number, rot: number, px: number, alpha: number) {
      if (alpha <= 0.01) return;
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rot);
      ctx!.globalAlpha = alpha;
      ctx!.font = `${px}px ${family}`;
      ctx!.fillText(ch, 0, 0);
      ctx!.restore();
    }

    // ---- Formação da palavra -----------------------------------------------
    let formStart = 0;
    let frozen: Frozen[] = [];
    let chosen: number[] = [];
    let targets: { x: number; y: number }[] = [];
    let wordSize = 0;
    const FORM_MS = reduced ? 1 : 1300;

    function planWord(t: number) {
      frozen = glyphs.map((g) => fieldPos(g, t));
      wordSize = Math.min(W * 0.17, 104);
      ctx!.font = `${wordSize}px ${family}`;
      const tracking = wordSize * 0.06;
      const widths = WORD.map((ch) => ctx!.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + tracking * (WORD.length - 1);
      let x = W / 2 - total / 2;
      targets = WORD.map((_, i) => {
        const cx = x + widths[i] / 2;
        x += widths[i] + tracking;
        return { x: cx, y: H * 0.46 };
      });
      // Para cada letra do nome, a letra igual do campo mais próxima do destino.
      const used = new Set<number>();
      chosen = targets.map((target, i) => {
        let best = -1;
        let bestD = Infinity;
        glyphs.forEach((g, gi) => {
          if (g.ch !== WORD[i] || used.has(gi)) return;
          const f = frozen[gi];
          if (f.x < 0 || f.x > W || f.y < 0 || f.y > H) return;
          const d = Math.hypot(f.x - target.x, f.y - target.y);
          if (d < bestD) {
            bestD = d;
            best = gi;
          }
        });
        used.add(best);
        return best;
      });
    }

    function frame(now: number) {
      const t = now;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = INK;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";

      if (!formStart) {
        for (const g of glyphs) {
          const p = fieldPos(g, t);
          if (p.x < -cell || p.x > W + cell || p.y < -cell || p.y > H + cell) continue;
          drawGlyph(g.ch, p.x, p.y, p.rot, size, 0.92);
        }
      } else {
        const k = clamp01((t - formStart) / FORM_MS);
        const e = easeInOut(k);
        const fade = 1 - clamp01((t - formStart) / (FORM_MS * 0.55));
        const chosenSet = new Set(chosen);
        glyphs.forEach((g, gi) => {
          if (chosenSet.has(gi)) return;
          const f = frozen[gi];
          if (f.x < -cell || f.x > W + cell || f.y < -cell || f.y > H + cell) return;
          // As outras letras se afastam levemente do centro enquanto somem.
          const dx = f.x - W / 2;
          const dy = f.y - H / 2;
          drawGlyph(g.ch, f.x + dx * e * 0.08, f.y + dy * e * 0.08, f.rot, size, 0.92 * fade);
        });
        chosen.forEach((gi, i) => {
          const from = gi >= 0 ? frozen[gi] : { x: targets[i].x, y: H + cell, rot: 0 };
          const to = targets[i];
          drawGlyph(
            WORD[i],
            from.x + (to.x - from.x) * e,
            from.y + (to.y - from.y) * e,
            from.rot * (1 - e),
            size + (wordSize - size) * e,
            1,
          );
        });
        if (k >= 1) {
          setStage((s) => (s === "forming" ? "formed" : s));
          return; // palavra formada: quadro final permanece desenhado
        }
      }
      if (!reduced || formStart) raf = requestAnimationFrame(frame);
    }

    startRef.current = () => {
      if (formStart) return;
      const now = performance.now();
      planWord(now);
      formStart = now;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    function begin() {
      layout();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      if (!formStart) begin();
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!formStart && !reduced) raf = requestAnimationFrame(frame);
    };

    document.fonts
      .load(`${Math.round(cell * 0.55)}px ${family}`, "ALTR")
      .catch(() => undefined)
      .finally(() => {
        fontReady = true;
        begin();
      });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      void fontReady;
    };
  }, []);

  // Palavra formada → subtítulo → o app se abre.
  useEffect(() => {
    if (stage !== "formed") return;
    const t1 = window.setTimeout(() => setStage("leaving"), 900);
    return () => clearTimeout(t1);
  }, [stage]);

  useEffect(() => {
    if (stage !== "leaving") return;
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    const t = window.setTimeout(() => document.documentElement.setAttribute("data-entry", "skip"), 700);
    return () => clearTimeout(t);
  }, [stage]);

  function enter() {
    if (stage !== "idle") return;
    setStage("forming");
    startRef.current?.();
  }

  return (
    <div className="entry" data-stage={stage} style={{ background: BG }} role="dialog" aria-modal="true" aria-labelledby="entry-title">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <h1 id="entry-title" className="sr-only">
        ALTAR · Devocional Espírita
      </h1>

      <p aria-hidden="true" className="entry-sub eyebrow absolute inset-x-0 top-[calc(46%+3.25rem)] text-center" style={{ color: "#CBBFA9" }}>
        Devocional Espírita
      </p>

      <div className="entry-action absolute inset-x-0 bottom-0 mx-auto w-full max-w-md px-8 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
        <button
          type="button"
          onClick={enter}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full text-[1rem] font-medium shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)] transition-transform duration-300 active:scale-[0.98]"
          style={{ background: INK, color: BG }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
