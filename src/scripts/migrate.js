const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

// Simple function to load env vars from .env and .env.local if not already in process.env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`Loading environment from ${file}`);
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
      break; // Only load first found file to match Next.js precedence
    }
  }
}

async function run() {
  loadEnv();

  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL or NEON_DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("Connecting to Neon Postgres database...");
  const sql = neon(url);

  try {
    console.log("Creating 'users' table...");
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        sync_enabled  BOOLEAN NOT NULL DEFAULT false
      );
    `);

    console.log("Creating 'user_meta' table...");
    await sql(`
      CREATE TABLE IF NOT EXISTS user_meta (
        user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        salt              TEXT NOT NULL,
        last_export_at    TIMESTAMPTZ,
        onboarding_done   BOOLEAN NOT NULL DEFAULT false,
        notifications_on  BOOLEAN NOT NULL DEFAULT false
      );
    `);

    console.log("Creating 'encrypted_blobs' table...");
    await sql(`
      CREATE TABLE IF NOT EXISTS encrypted_blobs (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blob_type     TEXT NOT NULL,
        ciphertext    TEXT NOT NULL,
        iv            TEXT NOT NULL,
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT unique_user_blob UNIQUE (user_id, blob_type)
      );
    `);

    console.log("Creating 'report_analysis_events' table...");
    await sql(`
      CREATE TABLE IF NOT EXISTS report_analysis_events (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        processed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        discarded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
