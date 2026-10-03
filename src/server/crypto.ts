import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function scryptAsync(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, PARAMS, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

/** Formato: scrypt$<salt base64>$<hash base64> */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  // Mesmo sem hash (conta sem senha / inexistente), gasta o mesmo tempo.
  const [scheme, saltB64, keyB64] = (stored ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$").split("$");
  if (scheme !== "scrypt") return false;
  const key = await scryptAsync(password, Buffer.from(saltB64, "base64"));
  const expected = Buffer.from(keyB64 ?? "", "base64");
  return stored !== null && expected.length === key.length && timingSafeEqual(expected, key);
}

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
