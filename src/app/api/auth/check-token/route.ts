import { checkToken } from "@/server/auth";
import { failure, json, readJson } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { token } = await readJson(request);
  if (typeof token !== "string" || !token) return json({ ok: false });
  try {
    const result = await checkToken(token);
    return json(result.ok ? { ok: true, email: result.email, purpose: result.purpose } : { ok: false });
  } catch (error) {
    return failure(error);
  }
}
