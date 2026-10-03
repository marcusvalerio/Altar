// Faixas finas e animadas para datas comemorativas (ver bannerByDate em
// src/content/editorial-assets.ts). Ilustrações autorais em SVG, inspiradas
// na pintura popular brasileira: cores quentes, estampas, colares de contas.
import { bannerByDate, type BannerId } from "@/content/editorial-assets";

const P = {
  rose: "#D9A89C",
  roseDeep: "#C58E82",
  cream: "#F3E9DC",
  red: "#A8322A",
  mustard: "#D3A33F",
  blue: "#4F7FB8",
  green: "#5E8A3A",
  leaf: "#7FA34E",
  skin1: "#5A3424",
  skin2: "#6E4330",
  skin3: "#4A2A1C",
  ground: "#4F6B34",
};

/** Estrela de quatro pontas. */
function Star({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  const d = `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`;
  return <path d={d} fill={P.cream} className="banner-twinkle" style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px ${y}px` }} />;
}

/** Criança de braços erguidos, roupa listrada e colar de contas, segurando uma folha. */
function Child({ x, skin, cloth, stripe, delay, hair }: { x: number; skin: string; cloth: string; stripe: string; delay: number; hair: "puff" | "braids" | "crown" }) {
  return (
    <g className="banner-bob" style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px 60px` }}>
      {/* folha erguida */}
      <g className="banner-sway" style={{ animationDelay: `${delay}s`, transformOrigin: `${x + 9}px 22px` }}>
        <path d={`M${x + 9} 22 Q${x + 15} 12 ${x + 12} 4 Q${x + 7} 13 ${x + 9} 22Z`} fill={P.leaf} />
      </g>
      {/* braços */}
      <path d={`M${x - 4} 30 L${x - 10} 20`} stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M${x + 4} 30 L${x + 9} 21`} stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
      {/* vestido */}
      <path d={`M${x - 6} 29 L${x + 6} 29 L${x + 10} 55 L${x - 10} 55Z`} fill={cloth} />
      {[35, 41, 47].map((yy) => (
        <path key={yy} d={`M${x - 8} ${yy} L${x + 8} ${yy}`} stroke={stripe} strokeWidth="1.6" strokeDasharray="2 1.5" />
      ))}
      {/* pernas */}
      <path d={`M${x - 3} 55 L${x - 3} 60 M${x + 3} 55 L${x + 3} 60`} stroke={skin} strokeWidth="2.4" strokeLinecap="round" />
      {/* cabeça e colar */}
      <circle cx={x} cy={24} r="5.2" fill={skin} />
      {hair === "puff" && <circle cx={x} cy={18.5} r="3.6" fill={P.skin3} />}
      {hair === "braids" && (
        <path d={`M${x - 5} 22 L${x - 7} 30 M${x + 5} 22 L${x + 7} 30`} stroke={P.skin3} strokeWidth="1.6" strokeLinecap="round" />
      )}
      {hair === "crown" && <path d={`M${x - 5} 20 L${x - 5} 15 L${x - 2} 18 L${x} 14 L${x + 2} 18 L${x + 5} 15 L${x + 5} 20Z`} fill={P.mustard} />}
      {[-4, -2, 0, 2, 4].map((dx, i) => (
        <circle key={dx} cx={x + dx} cy={30.5 + Math.abs(dx) * -0.25} r="0.9" fill={i % 2 ? P.cream : P.mustard} />
      ))}
    </g>
  );
}

/** Dia das Crianças: bandeirinhas, estrelas piscando e crianças em festa sob um arco. */
function Criancas() {
  const flags = [P.red, P.mustard, P.blue, P.green, P.cream, P.red, P.blue, P.mustard, P.green, P.red, P.cream, P.blue];
  return (
    <svg viewBox="0 0 360 64" preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="360" height="64" fill={P.rose} />
      {/* arcos de capela, em traço claro */}
      <g fill="none" stroke={P.cream} strokeWidth="1" opacity="0.55">
        <path d="M200 64 V30 A40 40 0 0 1 280 30 V64" />
        <path d="M206 64 V31 A34 34 0 0 1 274 31 V64" />
      </g>
      {/* varal de bandeirinhas */}
      <g className="banner-sway-soft" style={{ transformOrigin: "250px 0px" }}>
        <path d="M150 6 Q250 22 360 6" fill="none" stroke={P.cream} strokeWidth="0.8" opacity="0.8" />
        {flags.map((c, i) => {
          const t = (i + 0.5) / flags.length;
          const fx = 150 + t * 210;
          const fy = 6 + 4 * 16 * t * (1 - t) * (1 - 0.2);
          return <path key={i} d={`M${fx - 5} ${fy} L${fx + 5} ${fy} L${fx} ${fy + 9}Z`} fill={c} />;
        })}
      </g>
      <Star x={180} y={34} r={5.5} delay={0} />
      <Star x={296} y={30} r={4.5} delay={1.2} />
      <Star x={344} y={40} r={3.5} delay={2.1} />
      <Star x={194} y={50} r={3} delay={0.7} />
      {/* chão */}
      <rect x="0" y="60" width="360" height="4" fill={P.ground} />
      <Child x={222} skin={P.skin1} cloth={P.red} stripe={P.mustard} delay={0} hair="crown" />
      <Child x={246} skin={P.skin2} cloth={P.blue} stripe={P.cream} delay={0.4} hair="puff" />
      <Child x={270} skin={P.skin1} cloth={P.mustard} stripe={P.red} delay={0.8} hair="braids" />
      <Child x={316} skin={P.skin2} cloth={P.green} stripe={P.cream} delay={1.2} hair="puff" />
    </svg>
  );
}

const MAP: Record<BannerId, { label: string; Art: () => React.JSX.Element }> = {
  criancas: { label: "Dia das Crianças", Art: Criancas },
};

/** Faixa leve (≈ altura de um dedo) com a data comemorativa do dia. */
export function DateBanner({ date, className = "" }: { date: string; className?: string }) {
  const id = bannerByDate[date];
  if (!id) return null;
  const { label, Art } = MAP[id];
  return (
    <div className={`relative h-16 overflow-hidden rounded-[18px] ${className}`} style={{ background: P.rose }}>
      <div className="absolute inset-0">
        <Art />
      </div>
      <div className="absolute bottom-1 left-0 top-0 flex items-center bg-gradient-to-r from-[#D9A89C] via-[#D9A89C]/90 to-transparent pl-4 pr-10">
        <p className="font-display text-[1.125rem] leading-none text-[#3A1F17]">{label}</p>
      </div>
    </div>
  );
}
