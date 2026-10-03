"use client";

// Gera a peça de compartilhamento (1080 × 1920) em <canvas>, no próprio aparelho.
// Composição editorial — não é captura de tela: sem menus, botões ou interface.

import type { Devotional } from "@/content/types";
import { editionFor } from "@/components/date-banners";
import { dayMonthUpper, weekday } from "./dates";

export const SHARE_W = 1080;
export const SHARE_H = 1920;

const LIGHT = { bg: "#EBEBDF", ink: "#2B211B", muted: "#5B676D", line: "#CDC2AD", accent: "#AD904E", special: "#702913", pigment: "191,172,142", grain: "67,49,39" };
const SPECIAL = { bg: "#433127", ink: "#EBEBDF", muted: "#CBBFA9", line: "#5E4A3D", accent: "#CDB274", special: "#CDB274", pigment: "173,144,78", grain: "235,235,223" };

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Texto com espaçamento entre letras, desenhado letra a letra (compatível com todos os navegadores). */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
  return cursor - tracking;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export async function renderShareImage(d: Devotional): Promise<Blob> {
  const display = cssVar("--font-faculty", "Georgia, serif");
  const sans = cssVar("--font-geist", "system-ui, sans-serif");
  await Promise.all([
    document.fonts.load(`88px ${display}`, d.closingPhrase ?? d.title),
    document.fonts.load(`500 28px ${sans}`, "ALTAR"),
  ]).catch(() => undefined);

  const c = d.isSpecial ? SPECIAL : LIGHT;
  const edition = editionFor(d.date);
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_W;
  canvas.height = SHARE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");

  const M = 128; // margem generosa: a peça respira
  const W = SHARE_W - M * 2;

  // Papel
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);

  // Banho de cor da edição especial, que se perde no papel.
  if (edition) {
    const g = ctx.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, hexA(edition.color, 0.32));
    g.addColorStop(1, hexA(edition.color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SHARE_W, 900);
  }

  // Pigmento: mancha orgânica de terra, como tinta absorvida.
  const pg = ctx.createRadialGradient(860, 420, 20, 860, 420, 520);
  pg.addColorStop(0, `rgba(${c.pigment},0.38)`);
  pg.addColorStop(0.7, `rgba(${c.pigment},0.1)`);
  pg.addColorStop(1, `rgba(${c.pigment},0)`);
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.moveTo(860, 0);
  ctx.bezierCurveTo(1180, 40, 1240, 520, 1000, 780);
  ctx.bezierCurveTo(800, 980, 460, 820, 470, 520);
  ctx.bezierCurveTo(480, 220, 640, -20, 860, 0);
  ctx.fill();

  // Órbitas desenhadas à mão (levemente imperfeitas)
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(560, 720);
  ctx.bezierCurveTo(540, 360, 820, 150, 1060, 190);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(660, 760);
  ctx.bezierCurveTo(650, 470, 860, 300, 1080, 330);
  ctx.stroke();

  // Papel, como no app (determinístico): variação de tom, fibras e grão.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14; i++) {
    const x = rand() * SHARE_W;
    const y = rand() * SHARE_H;
    const r = 180 + rand() * 320;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c.grain},${0.025 + rand() * 0.025})`);
    g.addColorStop(1, `rgba(${c.grain},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (let i = 0; i < 2600; i++) {
    const x = rand() * SHARE_W;
    const y = rand() * SHARE_H;
    const len = 6 + rand() * 18;
    const vertical = rand() < 0.5;
    ctx.strokeStyle = `rgba(${c.grain},${0.02 + rand() * 0.035})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(vertical ? x + (rand() - 0.5) * 2 : x + len, vertical ? y + len : y + (rand() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(${c.grain},0.05)`;
  for (let i = 0; i < 9000; i++) ctx.fillRect(rand() * SHARE_W, rand() * SHARE_H, 1.6, 1.6);

  ctx.textBaseline = "alphabetic";

  // Marca
  ctx.fillStyle = c.ink;
  ctx.font = `60px ${display}`;
  const markEnd = spaced(ctx, "ALTAR", M, 236, 7);
  ctx.font = `500 22px ${sans}`;
  ctx.fillStyle = c.muted;
  spaced(ctx, "DEVOCIONAL ESPÍRITA", markEnd + 28, 230, 5);

  // Bloco central — a frase final é a protagonista.
  const phrase = d.closingPhrase ?? d.title;
  let size = 90;
  let lines: string[] = [];
  do {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, phrase, W);
    if (lines.length <= 7) break;
    size -= 6;
  } while (size > 52);
  const lineH = Math.round(size * 1.18);

  const special = d.commemorativeDate?.label ?? (edition ? `Edição especial · ${edition.label}` : undefined);
  const blockH = 40 + (special ? 52 : 0) + 110 + lines.length * lineH + 110 + 60;
  let y = Math.max(620, Math.round((SHARE_H - blockH) / 2) + 60);

  ctx.font = `500 26px ${sans}`;
  ctx.fillStyle = c.muted;
  spaced(ctx, `${dayMonthUpper(d.date)}  ·  ${weekday(d.date).toUpperCase()}`, M, y, 5);
  if (special) {
    y += 52;
    ctx.fillStyle = c.special;
    spaced(ctx, special.toUpperCase(), M, y, 4);
  }

  y += 60;
  ctx.fillStyle = c.accent;
  roundRect(ctx, M, y, 72, 5, 2.5);

  y += 60 + size * 0.8;
  ctx.font = `${size}px ${display}`;
  ctx.fillStyle = c.ink;
  for (const l of lines) {
    ctx.fillText(l, M, y);
    y += lineH;
  }

  y += 50;
  ctx.font = `40px ${display}`;
  ctx.fillStyle = c.muted;
  wrap(ctx, d.title, W).forEach((l, i) => {
    ctx.fillText(i === 0 ? `— ${l}` : `   ${l}`, M, y);
    y += 50;
  });

  // Rodapé: um ponto de terracota e o fio do livro.
  ctx.strokeStyle = c.line;
  ctx.beginPath();
  ctx.moveTo(M + 36, SHARE_H - 196);
  ctx.lineTo(SHARE_W - M, SHARE_H - 196);
  ctx.stroke();
  ctx.fillStyle = d.isSpecial ? c.accent : "#702913";
  ctx.beginPath();
  ctx.arc(M + 8, SHARE_H - 196, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `500 22px ${sans}`;
  ctx.fillStyle = c.muted;
  spaced(ctx, "UMA LEITURA PARA ALGUNS MINUTOS DE PRESENÇA", M, SHARE_H - 132, 4);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("falha ao gerar imagem"))), "image/png"),
  );
}
