// Composições gráficas abstratas e PROVISÓRIAS para datas especiais.
// Não são conteúdo editorial; ver src/content/editorial-assets.ts.
import { illustrationByDate, type IllustrationId } from "@/content/editorial-assets";

const C = {
  cream: "#BFAC8E",
  offwhite: "#EBEBDF",
  mustard: "#AD904E",
  terracotta: "#702913",
  orange: "#CE7346",
  brown: "#433127",
  reddish: "#7B4A39",
  bluegray: "#657278",
  blue: "#1881D1",
};

/** Memória: ondas de lembrança que se abrem a partir de um ponto de luz no horizonte. */
function Memoria() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <g fill="none" stroke={C.cream} strokeWidth="1">
        {[34, 62, 92, 124, 158, 194].map((r, i) => (
          <circle key={r} cx="160" cy="150" r={r} opacity={0.75 - i * 0.11} />
        ))}
      </g>
      <line x1="0" y1="150" x2="320" y2="150" stroke={C.cream} strokeWidth="1" opacity="0.6" />
      <rect x="0" y="150" width="320" height="30" fill={C.reddish} opacity="0.35" />
      <g className="animate-breathe" style={{ transformOrigin: "160px 150px" }}>
        <circle cx="160" cy="150" r="16" fill={C.mustard} />
      </g>
      <circle cx="160" cy="150" r="16" fill="none" stroke={C.offwhite} strokeWidth="1" opacity="0.5" />
      <g fill={C.offwhite} opacity="0.7">
        <circle cx="72" cy="58" r="1.4" />
        <circle cx="236" cy="42" r="1.1" />
        <circle cx="270" cy="88" r="1.4" />
      </g>
    </svg>
  );
}

/** Fraternidade: módulos geométricos diferentes que só fazem sentido juntos. */
function Fraternidade() {
  const W = 64;
  const H = 90;
  const tiles: { kind: "half" | "quarter" | "bands" | "dot" | "solid"; fg: string; bg: string; rot?: number }[] = [
    { kind: "half", fg: C.orange, bg: C.terracotta },
    { kind: "bands", fg: C.mustard, bg: C.brown },
    { kind: "quarter", fg: C.cream, bg: C.reddish, rot: 90 },
    { kind: "dot", fg: C.mustard, bg: C.terracotta },
    { kind: "half", fg: C.offwhite, bg: C.bluegray, rot: 180 },
    { kind: "solid", fg: C.mustard, bg: C.brown },
    { kind: "quarter", fg: C.orange, bg: C.brown },
    { kind: "bands", fg: C.cream, bg: C.terracotta, rot: 90 },
    { kind: "half", fg: C.mustard, bg: C.reddish, rot: 180 },
    { kind: "dot", fg: C.offwhite, bg: C.brown },
  ];
  return (
    <svg viewBox={`0 0 ${W * 5} ${H * 2}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {tiles.map((t, i) => {
        const x = (i % 5) * W;
        const y = Math.floor(i / 5) * H;
        const cx = x + W / 2;
        const cy = y + H / 2;
        return (
          <g key={i} transform={t.rot ? `rotate(${t.rot} ${cx} ${cy})` : undefined}>
            <rect x={x} y={y} width={W} height={H} fill={t.bg} />
            {t.kind === "half" && <path d={`M${x} ${y + H} A${W / 2} ${W / 2} 0 0 1 ${x + W} ${y + H} Z`} fill={t.fg} />}
            {t.kind === "quarter" && <path d={`M${x} ${y} L${x + W} ${y} A${W} ${W} 0 0 1 ${x} ${y + W} Z`} fill={t.fg} />}
            {t.kind === "bands" &&
              [0, 1, 2, 3].map((b) => <rect key={b} x={x} y={y + 12 + b * 20} width={W} height={7} fill={t.fg} />)}
            {t.kind === "dot" && <circle cx={cx} cy={cy} r={W / 4} fill={t.fg} />}
            {t.kind === "solid" && <rect x={x + 14} y={y + 14} width={W - 28} height={H - 28} fill={t.fg} />}
          </g>
        );
      })}
    </svg>
  );
}

const MAP: Record<IllustrationId, () => React.JSX.Element> = { memoria: Memoria, fraternidade: Fraternidade };

export function hasIllustration(date: string) {
  return Boolean(illustrationByDate[date]);
}

export function DateIllustration({ date, className = "" }: { date: string; className?: string }) {
  const entry = illustrationByDate[date];
  if (!entry) return null;
  const Comp = MAP[entry.id];
  return (
    <div className={`overflow-hidden ${className}`}>
      <Comp />
    </div>
  );
}
