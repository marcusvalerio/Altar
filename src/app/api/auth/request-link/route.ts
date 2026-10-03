import { normalizeEmail, requestPasswordLink } from "@/server/auth";
import { baseUrl, failure, json, readJson, sameOrigin } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Requisição não permitida." }, 403);
  const email = normalizeEmail((await readJson(request)).email);
  if (!email) return json({ error: "Confira o e-mail digitado." }, 400);
  try {
    const { devLink } = await requestPasswordLink(email, baseUrl(request));
    return json({ ok: true, ...(devLink ? { devLink } : {}) });
  } catch (error) {
    return failure(error);
  }
}
