import { transaction, query } from "@/server/db";
import { failure, json, readJson, sameOrigin } from "@/server/http";
import { currentUser } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const THEMES = ["system", "light", "dark"];
const SIZES = ["sm", "md", "lg", "xl"];
const MAX_ITEMS = 2000;

type Snapshot = {
  favorites: { id: string; savedAt: string }[];
  completed: Record<string, string>;
  prefs: { theme: string; textSize: string } | null;
};

async function load(userId: string): Promise<Snapshot> {
  const [favs, done, prefs] = await Promise.all([
    query<{ id: string; saved_at: Date }>(
      "SELECT to_char(devotional_date, 'YYYY-MM-DD') AS id, saved_at FROM user_favorites WHERE user_id = $1 ORDER BY saved_at DESC",
      [userId],
    ),
    query<{ id: string; completed_at: Date }>(
      "SELECT to_char(devotional_date, 'YYYY-MM-DD') AS id, completed_at FROM user_completions WHERE user_id = $1",
      [userId],
    ),
    query<{ theme: string; text_size: string }>("SELECT theme, text_size FROM user_preferences WHERE user_id = $1", [userId]),
  ]);
  return {
    favorites: favs.map((f) => ({ id: f.id, savedAt: f.saved_at.toISOString() })),
    completed: Object.fromEntries(done.map((c) => [c.id, c.completed_at.toISOString()])),
    prefs: prefs[0] ? { theme: prefs[0].theme, textSize: prefs[0].text_size } : null,
  };
}

const validTime = (v: unknown) => typeof v === "string" && !Number.isNaN(Date.parse(v));

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return json({ error: "Entre na sua conta." }, 401);
    return json(await load(user.id));
  } catch (error) {
    return failure(error);
  }
}

/**
 * Grava o estado do aparelho na conta.
 * - favoritos: a lista enviada passa a ser a lista da conta (permite desfavoritar);
 * - leituras concluídas: idem (permite desmarcar um dia);
 * - preferências: a última gravação vale.
 */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Requisição não permitida." }, 403);
  try {
    const user = await currentUser();
    if (!user) return json({ error: "Entre na sua conta." }, 401);
    const body = await readJson(request);

    const favorites = (Array.isArray(body.favorites) ? body.favorites : [])
      .filter((f): f is { id: string; savedAt: string } => ISO_DATE.test(f?.id) && validTime(f?.savedAt))
      .slice(0, MAX_ITEMS);
    const completed = Object.entries(body.completed && typeof body.completed === "object" ? body.completed : {})
      .filter(([id, at]) => ISO_DATE.test(id) && validTime(at))
      .slice(0, MAX_ITEMS);
    const prefs = body.prefs as { theme?: unknown; textSize?: unknown } | undefined;

    await transaction(async (q) => {
      await q("DELETE FROM user_favorites WHERE user_id = $1 AND NOT (devotional_date = ANY($2::date[]))", [
        user.id,
        favorites.map((f) => f.id),
      ]);
      if (favorites.length) {
        await q(
          `INSERT INTO user_favorites (user_id, devotional_date, saved_at)
           SELECT $1, d, t FROM unnest($2::date[], $3::timestamptz[]) AS x(d, t)
           ON CONFLICT (user_id, devotional_date) DO NOTHING`,
          [user.id, favorites.map((f) => f.id), favorites.map((f) => f.savedAt)],
        );
      }
      await q("DELETE FROM user_completions WHERE user_id = $1 AND NOT (devotional_date = ANY($2::date[]))", [
        user.id,
        completed.map(([id]) => id),
      ]);
      if (completed.length) {
        await q(
          `INSERT INTO user_completions (user_id, devotional_date, completed_at)
           SELECT $1, d, t FROM unnest($2::date[], $3::timestamptz[]) AS x(d, t)
           ON CONFLICT (user_id, devotional_date) DO NOTHING`,
          [user.id, completed.map(([id]) => id), completed.map(([, at]) => at)],
        );
      }
      if (prefs && THEMES.includes(String(prefs.theme)) && SIZES.includes(String(prefs.textSize))) {
        await q(
          `INSERT INTO user_preferences (user_id, theme, text_size) VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, text_size = EXCLUDED.text_size, updated_at = now()`,
          [user.id, prefs.theme, prefs.textSize],
        );
      }
    });
    return json(await load(user.id));
  } catch (error) {
    return failure(error);
  }
}
