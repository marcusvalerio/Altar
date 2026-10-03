import { json } from "@/server/http";
import { currentUser } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    return json({ user: user ? { email: user.email } : null });
  } catch {
    // Sem banco configurado, o app segue funcionando sem contas.
    return json({ user: null, unavailable: true });
  }
}
