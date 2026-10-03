// Faixas finas e animadas para datas comemorativas (ver bannerByDay em
// src/content/editorial-assets.ts). Ilustrações autorais em SVG, só com as
// cores da paleta do app, no espírito da pintura popular: formas simples,
// estampas e colares de contas. O movimento acompanha o sentido da data.
import { bannerByDay, type BannerId } from "@/content/editorial-assets";

// Paleta do app (mesmos valores de globals.css e illustrations.tsx).
const C = {
  offwhite: "#EBEBDF",
  surface: "#F5F4EC",
  cream: "#BFAC8E",
  mustard: "#AD904E",
  gold: "#CDB274",
  terracotta: "#702913",
  orange: "#CE7346",
  brown: "#433127",
  ink: "#2B211B",
  reddish: "#7B4A39",
  bluegray: "#657278",
  blue: "#1881D1",
};

const VIEW = "0 0 360 64";

/** Estrela de quatro pontas que pisca. */
function Star({ x, y, r, delay, fill = C.offwhite }: { x: number; y: number; r: number; delay: number; fill?: string }) {
  const d = `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`;
  return <path d={d} fill={fill} className="banner-twinkle" style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px ${y}px` }} />;
}

/** Pessoa estilizada: vestido com listras e colar de contas. */
function Figure({
  x,
  skin,
  cloth,
  stripe,
  delay = 0,
  arms = "up",
  hair = "puff",
  leaf,
}: {
  x: number;
  skin: string;
  cloth: string;
  stripe: string;
  delay?: number;
  arms?: "up" | "side";
  hair?: "puff" | "braids" | "crown";
  leaf?: string;
}) {
  return (
    <g className="banner-bob" style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px 60px` }}>
      {leaf && (
        <g className="banner-sway" style={{ animationDelay: `${delay}s`, transformOrigin: `${x + 9}px 22px` }}>
          <path d={`M${x + 9} 22 Q${x + 15} 12 ${x + 12} 4 Q${x + 7} 13 ${x + 9} 22Z`} fill={leaf} />
        </g>
      )}
      {arms === "up" ? (
        <path d={`M${x - 4} 30 L${x - 10} 20 M${x + 4} 30 L${x + 9} 21`} stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <path d={`M${x - 5} 31 L${x - 12} 40 M${x + 5} 31 L${x + 12} 40`} stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
      )}
      <path d={`M${x - 6} 29 L${x + 6} 29 L${x + 10} 55 L${x - 10} 55Z`} fill={cloth} />
      {[35, 41, 47].map((yy) => (
        <path key={yy} d={`M${x - 8} ${yy} L${x + 8} ${yy}`} stroke={stripe} strokeWidth="1.6" strokeDasharray="2 1.5" />
      ))}
      <path d={`M${x - 3} 55 L${x - 3} 60 M${x + 3} 55 L${x + 3} 60`} stroke={skin} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={x} cy={24} r="5.2" fill={skin} />
      {hair === "puff" && <circle cx={x} cy={18.5} r="3.6" fill={C.ink} />}
      {hair === "braids" && <path d={`M${x - 5} 22 L${x - 7} 30 M${x + 5} 22 L${x + 7} 30`} stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />}
      {hair === "crown" && <path d={`M${x - 5} 20 L${x - 5} 15 L${x - 2} 18 L${x} 14 L${x + 2} 18 L${x + 5} 15 L${x + 5} 20Z`} fill={C.gold} />}
      {[-4, -2, 0, 2, 4].map((dx, i) => (
        <circle key={dx} cx={x + dx} cy={30.5} r="0.9" fill={i % 2 ? C.offwhite : C.gold} />
      ))}
    </g>
  );
}

/** Dia das Crianças: festa — bandeirinhas, estrelas e crianças com folhas erguidas sob um arco. */
function Criancas() {
  const flags = [C.terracotta, C.gold, C.blue, C.orange, C.offwhite, C.terracotta, C.bluegray, C.gold, C.orange, C.blue, C.offwhite, C.terracotta];
  return (
    <svg viewBox={VIEW} preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={C.cream} />
      <g fill="none" stroke={C.offwhite} strokeWidth="1" opacity="0.6">
        <path d="M200 64 V30 A40 40 0 0 1 280 30 V64" />
        <path d="M206 64 V31 A34 34 0 0 1 274 31 V64" />
      </g>
      <g className="banner-sway-soft" style={{ transformOrigin: "250px 0px" }}>
        <path d="M150 6 Q250 22 360 6" fill="none" stroke={C.offwhite} strokeWidth="0.8" opacity="0.8" />
        {flags.map((c, i) => {
          const t = (i + 0.5) / flags.length;
          const fx = 150 + t * 210;
          const fy = 6 + 51 * t * (1 - t);
          return <path key={i} d={`M${fx - 5} ${fy} L${fx + 5} ${fy} L${fx} ${fy + 9}Z`} fill={c} />;
        })}
      </g>
      <Star x={180} y={34} r={5.5} delay={0} />
      <Star x={296} y={30} r={4.5} delay={1.2} />
      <Star x={344} y={40} r={3.5} delay={2.1} />
      <Star x={194} y={50} r={3} delay={0.7} />
      <rect x="0" y="60" width="360" height="4" fill={C.reddish} />
      <Figure x={222} skin={C.brown} cloth={C.terracotta} stripe={C.gold} hair="crown" leaf={C.bluegray} />
      <Figure x={246} skin={C.reddish} cloth={C.blue} stripe={C.offwhite} delay={0.4} leaf={C.mustard} />
      <Figure x={270} skin={C.brown} cloth={C.gold} stripe={C.terracotta} delay={0.8} hair="braids" leaf={C.bluegray} />
      <Figure x={316} skin={C.reddish} cloth={C.bluegray} stripe={C.offwhite} delay={1.2} leaf={C.mustard} />
    </svg>
  );
}

/** Não-Violência: pombas brancas em voo lento e um ramo dourado. */
function NaoViolencia() {
  const dove = (x: number, y: number, s: number, delay: number) => (
    <g className="banner-glide" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0 6 Q8 0 16 4 Q22 -6 30 -4 Q24 2 22 6 Q28 8 32 12 Q22 12 14 10 Q6 12 0 6Z" fill={C.offwhite} />
        <circle cx="25.5" cy="0" r="0.9" fill={C.ink} />
      </g>
    </g>
  );
  return (
    <svg viewBox={VIEW} preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={C.bluegray} />
      <g fill="none" stroke={C.offwhite} strokeWidth="0.8" opacity="0.25">
        <circle cx="290" cy="64" r="30" />
        <circle cx="290" cy="64" r="48" />
        <circle cx="290" cy="64" r="66" />
      </g>
      <g className="banner-sway-soft" style={{ transformOrigin: "200px 50px" }}>
        <path d="M188 54 Q220 40 250 46" fill="none" stroke={C.gold} strokeWidth="1.4" />
        {[0, 1, 2, 3, 4].map((i) => {
          const lx = 196 + i * 11;
          const ly = 50 - i * 1.6;
          return <ellipse key={i} cx={lx} cy={ly - 4} rx="2.4" ry="5" fill={C.gold} transform={`rotate(${i % 2 ? 35 : -35} ${lx} ${ly})`} />;
        })}
      </g>
      {dove(262, 22, 1, 0)}
      {dove(310, 34, 0.75, 1.4)}
      {dove(226, 14, 0.55, 2.6)}
    </svg>
  );
}

/** Allan Kardec (Uma vida dedicada ao estudo): livro aberto, folha virando devagar e pontos de luz. */
function Estudo() {
  return (
    <svg viewBox={VIEW} preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={C.brown} />
      <g fill={C.gold}>
        {[
          [210, 14, 0],
          [236, 8, 1.4],
          [318, 12, 0.6],
          [342, 26, 2],
          [196, 30, 2.6],
        ].map(([x, y, d]) => (
          <circle key={`${x}`} cx={x} cy={y} r="1.3" className="banner-twinkle" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }} />
        ))}
      </g>
      {/* luz suave atrás do livro */}
      <g opacity="0.14"><ellipse cx="276" cy="44" rx="52" ry="18" fill={C.gold} className="animate-breathe" /></g>
      {/* livro */}
      <path d="M276 56 Q252 50 230 54 L230 30 Q252 26 276 32Z" fill={C.offwhite} />
      <path d="M276 56 Q300 50 322 54 L322 30 Q300 26 276 32Z" fill={C.surface} />
      <path d="M276 32 L276 56" stroke={C.cream} strokeWidth="1" />
      {[36, 41, 46].map((y) => (
        <g key={y} stroke={C.cream} strokeWidth="0.9">
          <path d={`M236 ${y} Q254 ${y - 3} 270 ${y + 1}`} fill="none" />
          <path d={`M282 ${y + 1} Q298 ${y - 3} 316 ${y}`} fill="none" />
        </g>
      ))}
      {/* folha virando */}
      <path d="M276 32 Q290 27 304 30 L304 54 Q290 51 276 56Z" fill={C.offwhite} className="banner-page" style={{ transformOrigin: "276px 44px" }} />
      <path d="M228 56 Q252 52 276 58 Q300 52 324 56" fill="none" stroke={C.mustard} strokeWidth="2" />
      {/* pena */}
      <path d="M332 20 Q348 6 352 2 Q346 16 334 24Z" fill={C.cream} />
      <path d="M334 24 L328 32" stroke={C.cream} strokeWidth="1" />
    </svg>
  );
}

/** Dia das Nações Unidas: povos diferentes de mãos dadas diante de um globo de linhas. */
function NacoesUnidas() {
  const people = [
    { cloth: C.terracotta, stripe: C.gold, skin: C.brown },
    { cloth: C.gold, stripe: C.terracotta, skin: C.reddish },
    { cloth: C.offwhite, stripe: C.bluegray, skin: C.brown },
    { cloth: C.orange, stripe: C.offwhite, skin: C.reddish },
    { cloth: C.bluegray, stripe: C.gold, skin: C.brown },
  ];
  return (
    <svg viewBox={VIEW} preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={C.blue} />
      <g fill="none" stroke={C.offwhite} strokeWidth="0.8" opacity="0.35" className="banner-spin" style={{ transformOrigin: "280px 34px" }}>
        <circle cx="280" cy="34" r="30" />
        <ellipse cx="280" cy="34" rx="14" ry="30" />
        <ellipse cx="280" cy="34" rx="26" ry="30" />
        <path d="M250 34 H310 M254 20 H306 M254 48 H306" />
      </g>
      {people.map((p, i) => (
        <Figure key={i} x={220 + i * 30} skin={p.skin} cloth={p.cloth} stripe={p.stripe} arms="side" delay={i * 0.35} hair={i % 2 ? "braids" : "puff"} />
      ))}
      {/* mãos dadas */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={235 + i * 30} cy={40} r="1.8" fill={C.brown} />
      ))}
      <rect x="0" y="60" width="360" height="4" fill={C.offwhite} opacity="0.35" />
    </svg>
  );
}

/** Finados: recolhimento — uma vela acesa, luzes que sobem devagar e flores do campo. Sem nada fúnebre. */
function Finados() {
  const lights: [number, number, number][] = [
    [214, 0, 7],
    [236, 2.5, 9],
    [300, 1.2, 8],
    [326, 4, 10],
    [252, 5.5, 9],
    [344, 6.5, 8],
  ];
  return (
    <svg viewBox={VIEW} preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={C.ink} />
      {lights.map(([x, d, dur]) => (
        <circle key={x} cx={x} cy={60} r="1.2" fill={C.gold} className="banner-rise" style={{ animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
      ))}
      {/* halo da chama */}
      <g opacity="0.12"><circle cx="276" cy="24" r="18" fill={C.gold} className="animate-breathe" /></g>
      <g opacity="0.2"><circle cx="276" cy="24" r="9" fill={C.gold} className="animate-breathe" /></g>
      {/* vela */}
      <rect x="270" y="32" width="12" height="26" rx="2" fill={C.offwhite} />
      <path d="M276 32 V29" stroke={C.ink} strokeWidth="1" />
      <path d="M276 18 Q281 24 276 29 Q271 24 276 18Z" fill={C.gold} className="banner-flame" style={{ transformOrigin: "276px 29px" }} />
      <path d="M276 22 Q278 25 276 28 Q274 25 276 22Z" fill={C.offwhite} className="banner-flame" style={{ transformOrigin: "276px 29px" }} />
      {/* flores do campo */}
      {[
        [244, 50, C.offwhite],
        [254, 54, C.cream],
        [300, 52, C.offwhite],
        [312, 49, C.cream],
      ].map(([x, y, c]) => (
        <g key={`${x}`}>
          <path d={`M${x} ${y} V60`} stroke={C.bluegray} strokeWidth="1" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={x as number} cy={(y as number) - 2.4} rx="1.3" ry="2.4" fill={c as string} transform={`rotate(${a} ${x} ${y})`} />
          ))}
          <circle cx={x as number} cy={y as number} r="1.1" fill={C.gold} />
        </g>
      ))}
      <rect x="0" y="60" width="360" height="4" fill={C.brown} />
    </svg>
  );
}

const MAP: Record<BannerId, { label: string; bg: string; ink: string; Art: () => React.JSX.Element }> = {
  "nao-violencia": { label: "Dia da Não-Violência", bg: C.bluegray, ink: C.offwhite, Art: NaoViolencia },
  kardec: { label: "Nascimento de Allan Kardec", bg: C.brown, ink: C.offwhite, Art: Estudo },
  criancas: { label: "Dia das Crianças", bg: C.cream, ink: C.ink, Art: Criancas },
  onu: { label: "Dia das Nações Unidas", bg: C.blue, ink: C.offwhite, Art: NacoesUnidas },
  finados: { label: "Finados", bg: C.ink, ink: C.offwhite, Art: Finados },
};

export function bannerFor(date: string) {
  return bannerByDay[date.slice(5)];
}

/** Faixa leve (≈ altura de um dedo) com a data comemorativa do dia. */
export function DateBanner({ date, className = "" }: { date: string; className?: string }) {
  const id = bannerFor(date);
  if (!id) return null;
  const { label, bg, ink, Art } = MAP[id];
  return (
    <div className={`relative h-16 overflow-hidden rounded-[18px] ${className}`} style={{ background: bg }}>
      <div className="absolute inset-0">
        <Art />
      </div>
      <div
        className="absolute bottom-1 left-0 top-0 flex max-w-[62%] items-center pl-4 pr-10"
        style={{ background: `linear-gradient(to right, ${bg} 0%, ${bg} 70%, transparent)` }}
      >
        <p className="font-display text-[1.0625rem] leading-tight" style={{ color: ink }}>
          {label}
        </p>
      </div>
    </div>
  );
}
