import { PASSWORD_MIN, setPasswordWithToken, validPassword } from "@/server/auth";
import { failure, json, readJson, sameOrigin } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Requisição não permitida." }, 403);
  const { token, password } = await readJson(request);
  if (typeof token !== "string" || !token) return json({ error: "Este link não é válido." }, 400);
  if (!validPassword(password)) return json({ error: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.` }, 400);
  try {
    const ok = await setPasswordWithToken(token, password);
    if (!ok) return json({ error: "Este link expirou ou já foi usado. Peça um novo." }, 410);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
