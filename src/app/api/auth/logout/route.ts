import { failure, json, sameOrigin } from "@/server/http";
import { destroySession } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Requisição não permitida." }, 403);
  try {
    await destroySession();
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
