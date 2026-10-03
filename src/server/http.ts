import "server-only";
import { NextResponse } from "next/server";
import { MailNotConfiguredError } from "./mail";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Mensagens humanas; o detalhe técnico fica só no log do servidor. */
export function failure(error: unknown) {
  console.error("[altar]", error);
  if (error instanceof MailNotConfiguredError) {
    return json({ error: "Não conseguimos enviar o e-mail agora. Tente novamente mais tarde." }, 503);
  }
  if (error instanceof Error && /DATABASE_URL/.test(error.message)) {
    return json({ error: "As contas ainda não estão disponíveis. Tente novamente mais tarde." }, 503);
  }
  return json({ error: "Algo não saiu como esperado. Tente novamente." }, 500);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

/** Endereço público do app, usado nos links dos e-mails. */
export function baseUrl(request: Request) {
  const configured = process.env.APP_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  return (configured ?? new URL(request.url).origin).replace(/\/$/, "");
}

/** Proteção simples contra requisições de outros sites (CSRF). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}
