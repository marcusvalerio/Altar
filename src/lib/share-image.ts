"use client";

// Gera a peça de compartilhamento (1080 × 1920) em <canvas>, no próprio aparelho.
// Composição editorial — não é captura de tela: sem menus, botões ou interface.

import type { Devotional } from "@/content/types";
import { dayMonthUpper, weekday } from "./dates";

export const SHARE_W = 1080;
export const SHARE_H = 1920;

const LIGHT = { bg: "#EBEBDF", ink: "#2B211B", muted: "#5B676D", line: "#CDC2AD", accent: "#AD904E", special: "#702913" };
const SPECIAL = { bg: "#433127", ink: "#EBEBDF", muted: "#CBBFA9", line: "#5E4A3D", accent: "#AD904E", special: "#CDB274" };

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

export async function renderShareImage(d: Devotional): Promise<Blob> {
  const display = cssVar("--font-faculty", "Georgia, serif");
  const sans = cssVar("--font-geist", "system-ui, sans-serif");
  await Promise.all([
    document.fonts.load(`88px ${display}`, d.closingPhrase ?? d.title),
    document.fonts.load(`500 28px ${sans}`, "ALTAR"),
  ]).catch(() => undefined);

  const c = d.isSpecial ? SPECIAL : LIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_W;
  canvas.height = SHARE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");

  const M = 120; // margem
  const W = SHARE_W - M * 2;

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);

  // Elementos gráficos: dois círculos de linha fina, como no card do app.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2;
  for (const [x, y, r] of [
    [SHARE_W + 40, 360, 330],
    [SHARE_W - 120, 250, 330],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textBaseline = "alphabetic";

  // Marca
  ctx.fillStyle = c.ink;
  ctx.font = `64px ${display}`;
  spaced(ctx, "ALTAR", M, 230, 6);

  // Bloco central — a frase final é a protagonista.
  const phrase = d.closingPhrase ?? d.title;
  let size = 92;
  let lines: string[] = [];
  do {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, phrase, W);
    if (lines.length <= 7) break;
    size -= 6;
  } while (size > 52);
  const lineH = Math.round(size * 1.2);

  const special = d.commemorativeDate?.label;
  const blockH = 40 + (special ? 50 : 0) + 70 + lines.length * lineH + 70 + 4 + 70 + 50;
  let y = Math.max(560, Math.round((SHARE_H - blockH) / 2) + 40);

  ctx.font = `500 28px ${sans}`;
  ctx.fillStyle = c.muted;
  spaced(ctx, `${dayMonthUpper(d.date)}  ·  ${weekday(d.date).toUpperCase()}`, M, y, 5);
  if (special) {
    y += 50;
    ctx.fillStyle = c.special;
    spaced(ctx, special, M, y, 4);
  }

  y += 70 + size * 0.8;
  ctx.font = `${size}px ${display}`;
  ctx.fillStyle = c.ink;
  for (const l of lines) {
    ctx.fillText(l, M, y);
    y += lineH;
  }

  y += 30;
  ctx.fillStyle = c.accent;
  ctx.fillRect(M, y, 88, 4);

  y += 80;
  ctx.font = `44px ${display}`;
  ctx.fillStyle = c.muted;
  for (const l of wrap(ctx, d.title, W)) {
    ctx.fillText(l, M, y);
    y += 54;
  }

  // Rodapé
  ctx.strokeStyle = c.line;
  ctx.beginPath();
  ctx.moveTo(M, SHARE_H - 210);
  ctx.lineTo(SHARE_W - M, SHARE_H - 210);
  ctx.stroke();
  ctx.font = `500 28px ${sans}`;
  ctx.fillStyle = c.muted;
  spaced(ctx, "DEVOCIONAL ESPÍRITA", M, SHARE_H - 140, 6);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("falha ao gerar imagem"))), "image/png"),
  );
}
