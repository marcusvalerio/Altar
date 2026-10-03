import "server-only";
import { Pool, type QueryResultRow } from "pg";

// Conexão com o Postgres (Neon em produção). Uma única pool por instância.
const globalForPool = globalThis as unknown as { altarPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não configurada");
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: local ? undefined : { rejectUnauthorized: true },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
}

export function db() {
  if (!globalForPool.altarPool) globalForPool.altarPool = createPool();
  return globalForPool.altarPool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await db().query<T>(text, params);
  return result.rows;
}

export async function transaction<T>(fn: (q: <R extends QueryResultRow>(text: string, params?: unknown[]) => Promise<R[]>) => Promise<T>) {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(async (text, params = []) => (await client.query(text, params)).rows);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
