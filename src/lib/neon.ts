import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

let sqlClient: any = null;

// Paths for mock DB file
const MOCK_DB_PATH = path.join(process.cwd(), "mock_db.json");

function readMockDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const defaultDb = {
      users: [] as any[],
      user_meta: [] as any[],
      encrypted_blobs: [] as any[],
      report_analysis_events: [] as any[],
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
  } catch (err) {
    return {
      users: [],
      user_meta: [],
      encrypted_blobs: [],
      report_analysis_events: [],
    };
  }
}

function writeMockDb(db: any) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function mockSql(strings: TemplateStringsArray | string[], ...values: any[]): Promise<any[]> {
  const db = readMockDb();
  
  // Reconstruct query text for easy matching
  const queryText = strings.join("?").replace(/\s+/g, " ").trim();
  
  // 1. SELECT id FROM users WHERE email = ? LIMIT 1
  if (queryText.includes("SELECT id FROM users WHERE email = ?")) {
    const email = values[0];
    const user = db.users.find((u: any) => u.email === email);
    return user ? [{ id: user.id }] : [];
  }

  // 2. SELECT * FROM users WHERE email = ? LIMIT 1
  if (queryText.includes("SELECT * FROM users WHERE email = ?")) {
    const email = values[0];
    const user = db.users.find((u: any) => u.email === email);
    return user ? [user] : [];
  }

  // 3. SELECT email FROM users WHERE id = ? LIMIT 1
  if (queryText.includes("SELECT email FROM users WHERE id = ?")) {
    const id = values[0];
    const user = db.users.find((u: any) => u.id === id);
    return user ? [{ email: user.email }] : [];
  }

  // 4. SELECT m.salt FROM user_meta m JOIN users u ON m.user_id = u.id WHERE u.email = ? LIMIT 1
  if (queryText.includes("SELECT m.salt FROM user_meta m JOIN users u ON m.user_id = u.id WHERE u.email = ?")) {
    const email = values[0];
    const user = db.users.find((u: any) => u.email === email);
    if (!user) return [];
    const meta = db.user_meta.find((m: any) => m.user_id === user.id);
    return meta ? [{ salt: meta.salt }] : [];
  }

  // 5. SELECT m.onboarding_done, m.sync_enabled, m.last_export_at, m.salt, u.email FROM user_meta ... WHERE m.user_id = ?
  if (queryText.includes("SELECT m.onboarding_done") && queryText.includes("WHERE m.user_id = ?")) {
    const userId = values[0];
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return [];
    const meta = db.user_meta.find((m: any) => m.user_id === userId);
    if (!meta) return [];
    return [{
      onboarding_done: meta.onboarding_done,
      sync_enabled: meta.sync_enabled,
      last_export_at: meta.last_export_at,
      salt: meta.salt,
      email: user.email
    }];
  }

  // 6. SELECT blob_type, ciphertext, iv, updated_at FROM encrypted_blobs WHERE user_id = ? AND blob_type = ?
  if (queryText.includes("SELECT blob_type, ciphertext") && queryText.includes("WHERE user_id = ?")) {
    const userId = values[0];
    const blobType = values[1];
    const blob = db.encrypted_blobs.find((b: any) => b.user_id === userId && b.blob_type === blobType);
    return blob ? [blob] : [];
  }

  // 7. INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id
  if (queryText.includes("INSERT INTO users")) {
    const email = values[0];
    const passwordHash = values[1];
    const userId = generateId();
    const newUser = { id: userId, email, password_hash: passwordHash, created_at: new Date().toISOString() };
    db.users.push(newUser);
    writeMockDb(db);
    return [{ id: userId }];
  }

  // 8. INSERT INTO user_meta (user_id, salt, onboarding_done) VALUES (?, ?, false)
  // or INSERT INTO user_meta (user_id, onboarding_done, sync_enabled, last_export_at, salt) VALUES (?, ?, ?, ?, '') ...
  if (queryText.includes("INSERT INTO user_meta")) {
    const userId = values[0];
    const existingIdx = db.user_meta.findIndex((m: any) => m.user_id === userId);
    
    if (queryText.includes("ON CONFLICT")) {
      const onboarding_done = values[1];
      const sync_enabled = values[2];
      const last_export_at = values[3];
      
      const meta = existingIdx >= 0 ? db.user_meta[existingIdx] : { user_id: userId, salt: "" };
      meta.onboarding_done = onboarding_done !== null && onboarding_done !== undefined ? onboarding_done : meta.onboarding_done;
      meta.sync_enabled = sync_enabled !== null && sync_enabled !== undefined ? sync_enabled : meta.sync_enabled;
      meta.last_export_at = last_export_at !== null && last_export_at !== undefined ? last_export_at : meta.last_export_at;
      
      if (existingIdx >= 0) {
        db.user_meta[existingIdx] = meta;
      } else {
        db.user_meta.push(meta);
      }
    } else {
      const salt = values[1];
      const onboarding_done = values[2] !== undefined ? values[2] : false;
      const newMeta = {
        user_id: userId,
        salt,
        onboarding_done,
        sync_enabled: false,
        last_export_at: null
      };
      if (existingIdx >= 0) {
        db.user_meta[existingIdx] = newMeta;
      } else {
        db.user_meta.push(newMeta);
      }
    }
    
    writeMockDb(db);
    return [];
  }

  // 9. INSERT INTO encrypted_blobs (user_id, blob_type, ciphertext, iv, updated_at) VALUES (?, ?, ?, ?, now()) ON CONFLICT
  if (queryText.includes("INSERT INTO encrypted_blobs")) {
    const userId = values[0];
    const blobType = values[1];
    const ciphertext = values[2];
    const iv = values[3];
    const nowStr = new Date().toISOString();
    
    const existingIdx = db.encrypted_blobs.findIndex((b: any) => b.user_id === userId && b.blob_type === blobType);
    const blob = {
      user_id: userId,
      blob_type: blobType,
      ciphertext,
      iv,
      updated_at: nowStr
    };
    
    if (existingIdx >= 0) {
      db.encrypted_blobs[existingIdx] = blob;
    } else {
      db.encrypted_blobs.push(blob);
    }
    
    writeMockDb(db);
    return [{ updated_at: nowStr }];
  }

  // 10. UPDATE users SET sync_enabled = ? WHERE id = ?
  if (queryText.includes("UPDATE users SET sync_enabled = ?")) {
    const syncEnabled = values[0];
    const userId = values[1];
    const userIdx = db.users.findIndex((u: any) => u.id === userId);
    if (userIdx >= 0) {
      db.users[userIdx].sync_enabled = syncEnabled;
      writeMockDb(db);
    }
    return [];
  }

  // 11. INSERT INTO report_analysis_events
  if (queryText.includes("INSERT INTO report_analysis_events")) {
    const userId = values[0];
    const fileName = values[1];
    const fileType = values[2];
    const fileSize = values[3];
    const fileHash = values[4];
    const responseSummary = values[5];
    
    const newEvent = {
      user_id: userId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      file_hash: fileHash,
      response_summary: responseSummary,
      created_at: new Date().toISOString()
    };
    db.report_analysis_events.push(newEvent);
    writeMockDb(db);
    return [];
  }

  console.warn("Mock SQL: Unrecognized query:", queryText);
  return [];
}

/**
 * Lazy initializer for Neon Serverless Postgres client.
 * Prevents build-time crashes if DATABASE_URL is not present during build.
 */
export function getSql() {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!url) {
      console.warn(
        "Warning: DATABASE_URL is not configured. Falling back to local file-based database mock."
      );
      sqlClient = mockSql;
    } else {
      sqlClient = neon(url);
    }
  }
  return sqlClient;
}
