import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

/**
 * Lazy initializer for Neon Serverless Postgres client.
 * Prevents build-time crashes if DATABASE_URL is not present during build.
 */
export function getSql() {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!url) {
      console.warn(
        "Warning: DATABASE_URL is not configured. Database operations will throw an error."
      );
      return async (...args: any[]) => {
        throw new Error(
          "Neon Database URL is not configured. Set DATABASE_URL in environment variables."
        );
      };
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}
