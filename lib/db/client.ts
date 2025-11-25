import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Global cached connection for development (prevents too many connections)
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

/**
 * Get database client
 * Lazily initialized to avoid errors during build
 */
function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!globalForDb.client) {
    globalForDb.client = postgres(process.env.DATABASE_URL, {
      max: 1,
      prepare: false,
    });
  }

  return globalForDb.client;
}

/**
 * Drizzle ORM instance with schema
 */
export const db = drizzle(getClient(), { schema });
