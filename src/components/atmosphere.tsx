"use client";

// Fundo vivo da Home: pigmentos e linhas finas em camadas de profundidade.
// Cada camada acompanha o scroll numa velocidade diferente (paralaxe mínima)
// e respira devagar. Nada aqui é conteúdo — tudo fica atrás e some ao ler.
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

export function Atmosphere() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const far = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -40]);
  const mid = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -90]);
  const near = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -150]);
  const fade = useTransform(scrollY, [0, 500], [1, 0.55]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <m.div style={{ y: far, opacity: fade }} className="absolute -right-[22%] -top-[12%] h-[60vh] w-[85vw] max-w-[640px]">
        {/* Pigmento: mancha orgânica de terra clara, como tinta absorvida pelo papel */}
        <svg viewBox="0 0 400 400" className="animate-drift h-full w-full" style={{ animationDuration: "18s" }}>
          <defs>
            <radialGradient id="atm-pigment" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--cream)" stopOpacity="0.42" />
              <stop offset="70%" stopColor="var(--cream)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--cream)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M210 40C280 36 352 92 360 170C368 252 316 330 236 352C150 376 70 330 48 250C26 170 74 106 128 70C152 54 180 42 210 40Z"
            fill="url(#atm-pigment)"
          />
        </svg>
      </m.div>

      <m.svg style={{ y: mid }} viewBox="0 0 400 300" className="absolute -right-10 top-[6vh] w-[70vw] max-w-[520px]" fill="none">
        {/* Linhas de órbita, desenhadas à mão — leves desvios, nunca círculos perfeitos */}
        <path d="M60 190C70 110 150 52 240 58C326 64 380 128 372 200" stroke="var(--line)" strokeWidth="1" />
        <path d="M110 214C112 150 172 104 244 108C312 112 352 160 348 214" stroke="var(--line-soft)" strokeWidth="1" />
      </m.svg>

      <m.div style={{ y: near }} className="absolute right-[18%] top-[30vh]">
        {/* Semente de terracota: o único ponto de cor forte, pequeno */}
        <span className="animate-breathe block h-2 w-2 rounded-full bg-terracotta/70" style={{ animationDuration: "7s" }} />
      </m.div>

      <m.svg style={{ y: mid }} viewBox="0 0 400 120" className="absolute -left-16 top-[78vh] w-[80vw] max-w-[560px]" fill="none">
        {/* Água: uma onda baixa em azul-acinzentado */}
        <path d="M0 70C60 40 110 96 170 70C230 44 280 96 340 72C370 60 390 62 400 66" stroke="var(--accent)" strokeOpacity="0.16" strokeWidth="1.2" />
        <path d="M0 86C60 58 110 110 170 86C230 62 280 110 340 88" stroke="var(--mustard)" strokeOpacity="0.18" strokeWidth="1" />
      </m.svg>
    </div>
  );
}
