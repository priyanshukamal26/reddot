/**
 * RedConnect — Database Migration Helper
 *
 * Ensures the RedConnect tables exist in the Neon Postgres database.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to call on every request.
 * The check is cached in-memory so the CREATE statements only run once per
 * server process lifecycle.
 */

import { getSql } from "@/lib/neon";

let tablesInitialized = false;

export async function ensureRedConnectTables(): Promise<void> {
  if (tablesInitialized) return;

  const sql = getSql();

  // If we're using the mock SQL client (no DATABASE_URL), tables are just
  // JSON arrays in mock_db.json — no DDL needed.
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    tablesInitialized = true;
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rc_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        tag TEXT NOT NULL DEFAULT 'general',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        like_count INTEGER NOT NULL DEFAULT 0,
        save_count INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0
      )
    `;

    // Attempt to add comment_count if it doesn't exist (for existing tables)
    try {
      await sql`ALTER TABLE rc_posts ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0`;
    } catch (e: any) {
      // Ignore error if column already exists (code 42701)
      if (e.code !== '42701') console.error("Error adding comment_count:", e);
    }

    await sql`
      CREATE TABLE IF NOT EXISTS rc_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES rc_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS rc_likes (
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL REFERENCES rc_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, post_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS rc_saves (
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL REFERENCES rc_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, post_id)
      )
    `;

    tablesInitialized = true;
  } catch (error) {
    console.error("RedConnect table migration error:", error);
    // Don't cache failure — try again on next request
  }
}
