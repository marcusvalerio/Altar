import "server-only";
import { query, transaction } from "./db";
import { hashPassword, randomToken, sha256, verifyPassword } from "./crypto";
import { passwordLinkEmail, sendMail } from "./mail";
import { createSession } from "./session";

const LINK_HOURS = 24;
const RESEND_COOLDOWN_SECONDS = 60;
export const PASSWORD_MIN = 8;

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= PASSWORD_MIN && value.length <= 200;
}

/**
 * Pede o link por e-mail. Serve para criar a conta E para redefinir a senha:
 * se o e-mail ainda não tem conta, o link cria; se já tem, o link redefine.
 * A resposta é sempre a mesma, para não revelar quais e-mails têm conta.
 */
export async function requestPasswordLink(email: string, baseUrl: string) {
  const recent = await query(
    "SELECT 1 FROM auth_tokens WHERE email = $1 AND created_at > now() - make_interval(secs => $2)",
    [email, RESEND_COOLDOWN_SECONDS],
  );
  if (recent.length) return { sent: false as const, devLink: undefined };

  const existing = await query<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE email = $1", [email]);
  const purpose = existing[0]?.password_hash ? "reset" : "signup";

  const token = randomToken();
  await query(
    "INSERT INTO auth_tokens (token_hash, email, purpose, expires_at) VALUES ($1, $2, $3, now() + make_interval(hours => $4))",
    [sha256(token), email, purpose, LINK_HOURS],
  );

  const link = `${baseUrl}/conta/definir-senha/?token=${encodeURIComponent(token)}`;
  const { delivered } = await sendMail({ to: email, ...passwordLinkEmail(link, purpose) });
  return { sent: true as const, devLink: delivered ? undefined : link };
}

export type TokenCheck = { ok: true; email: string; purpose: "signup" | "reset" } | { ok: false };

export async function checkToken(token: string): Promise<TokenCheck> {
  const rows = await query<{ email: string; purpose: "signup" | "reset" }>(
    "SELECT email, purpose FROM auth_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()",
    [sha256(token)],
  );
  return rows[0] ? { ok: true, ...rows[0] } : { ok: false };
}

/** Usa o link: confirma o e-mail, grava a senha e já entra na conta. */
export async function setPasswordWithToken(token: string, password: string) {
  const passwordHash = await hashPassword(password);
  const userId = await transaction(async (q) => {
    const rows = await q<{ email: string }>(
      `UPDATE auth_tokens SET used_at = now()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING email`,
      [sha256(token)],
    );
    const email = rows[0]?.email;
    if (!email) return null;
    const [user] = await q<{ id: string }>(
      `INSERT INTO users (email, password_hash, email_verified_at) VALUES ($1, $2, now())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash,
         email_verified_at = COALESCE(users.email_verified_at, now()), updated_at = now()
       RETURNING id`,
      [email, passwordHash],
    );
    // Senha nova: invalida outros links pendentes e encerra sessões antigas.
    await q("UPDATE auth_tokens SET used_at = now() WHERE email = $1 AND used_at IS NULL", [email]);
    await q("DELETE FROM sessions WHERE user_id = $1", [user.id]);
    return user.id;
  });
  if (!userId) return false;
  await createSession(userId);
  return true;
}

export async function login(email: string, password: string) {
  const rows = await query<{ id: string; password_hash: string | null }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email],
  );
  const ok = await verifyPassword(password, rows[0]?.password_hash ?? null);
  if (!ok || !rows[0]) return false;
  await createSession(rows[0].id);
  return true;
}
