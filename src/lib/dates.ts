// Datas do conteúdo são "dias de calendário" (yyyy-mm-dd), sem fuso.
// Toda formatação usa UTC para que 03/11 nunca vire 02/11 por causa do fuso.

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTHS_SHORT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
export const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];
export const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export type DayParts = { year: number; month: number; day: number };

export function parseISO(iso: string): DayParts {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export const pad = (n: number) => String(n).padStart(2, "0");

export function toISO({ year, month, day }: DayParts) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Data local do aparelho, em yyyy-mm-dd. */
export function localTodayISO(now = new Date()) {
  return toISO({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

export function isValidISO(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { year, month, day } = parseISO(iso);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

export function weekdayIndex(iso: string) {
  const { year, month, day } = parseISO(iso);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function weekday(iso: string) {
  return WEEKDAYS[weekdayIndex(iso)];
}

export function monthName(month: number) {
  return MONTHS[month - 1];
}

/** "03 NOV" */
export function shortDate(iso: string) {
  const { month, day } = parseISO(iso);
  return `${pad(day)} ${MONTHS_SHORT[month - 1]}`;
}

/** "03 NOVEMBRO" */
export function dayMonthUpper(iso: string) {
  const { month, day } = parseISO(iso);
  return `${pad(day)} ${MONTHS[month - 1].toUpperCase()}`;
}

/** "03 de novembro" */
export function longDate(iso: string) {
  const { month, day } = parseISO(iso);
  return `${pad(day)} de ${MONTHS[month - 1]}`;
}

/** "3 de novembro de 2026, terça-feira" — para leitores de tela. */
export function accessibleDate(iso: string) {
  const { year, month, day } = parseISO(iso);
  return `${day} de ${MONTHS[month - 1]} de ${year}, ${weekday(iso)}`;
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Grade do mês: semanas começando no domingo; null = célula vazia. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const total = daysInMonth(year, month);
  const cells: (string | null)[] = Array(first).fill(null);
  for (let day = 1; day <= total; day++) cells.push(toISO({ year, month, day }));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
