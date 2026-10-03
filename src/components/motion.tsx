"use client";

// Sistema de movimento do ALTAR.
// - Editorial (entradas, leitura): lento, assenta sem quicar.
// - Microinterações (toques): rápidas, com mola amortecida.
// "reducedMotion: user" respeita a preferência do sistema em todo o app.
import { LazyMotion, MotionConfig, domMax } from "motion/react";

export const ease = {
  settle: [0.16, 1, 0.3, 1] as const,
  calm: [0.22, 0.61, 0.36, 1] as const,
};

export const spring = {
  /** Toques e seleções: responde rápido e para sem oscilar. */
  touch: { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } as const,
  /** Elementos que mudam de lugar (pílulas, indicadores). */
  place: { type: "spring", stiffness: 260, damping: 32 } as const,
};

export const settle = {
  initial: { opacity: 0, y: 8, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, ease: ease.settle },
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
