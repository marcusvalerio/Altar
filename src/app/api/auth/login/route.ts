import { login, normalizeEmail } from "@/server/auth";
import { failure, json, readJson, sameOrigin } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Requisição não permitida." }, 403);
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email || typeof body.password !== "string" || !body.password) {
    return json({ error: "Informe seu e-mail e sua senha." }, 400);
  }
  try {
    if (!(await login(email, body.password))) return json({ error: "E-mail ou senha incorretos." }, 401);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
