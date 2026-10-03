"use client";

import { useEffect, useRef, useState } from "react";

/** Moldura da faixa: o desenho só se move enquanto está na tela — fora dela, nada é repintado. */
export function BannerFrame({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { rootMargin: "40px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-playing={playing || undefined} className={`banner ${className}`} style={style}>
      {children}
    </div>
  );
}
