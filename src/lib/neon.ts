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
      rc_posts: [] as any[],
      rc_likes: [] as any[],
      rc_saves: [] as any[],
      rc_comments: [] as any[],
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
      rc_posts: [],
      rc_likes: [],
      rc_saves: [],
      rc_comments: [],
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

  // 10b. UPDATE users SET password_hash = ? WHERE id = ?
  if (queryText.includes("UPDATE users SET password_hash = ? WHERE id = ?")) {
    const passwordHash = values[0];
    const userId = values[1];
    const userIdx = db.users.findIndex((u: any) => u.id === userId);
    if (userIdx >= 0) {
      db.users[userIdx].password_hash = passwordHash;
      writeMockDb(db);
    }
    return [];
  }

  // 10c. UPDATE user_meta SET salt = ? WHERE user_id = ?
  if (queryText.includes("UPDATE user_meta SET salt = ? WHERE user_id = ?")) {
    const salt = values[0];
    const userId = values[1];
    const metaIdx = db.user_meta.findIndex((m: any) => m.user_id === userId);
    if (metaIdx >= 0) {
      db.user_meta[metaIdx].salt = salt;
      writeMockDb(db);
    }
    return [];
  }

  // 10d. DELETE FROM encrypted_blobs WHERE user_id = ?
  if (queryText.includes("DELETE FROM encrypted_blobs WHERE user_id = ?")) {
    const userId = values[0];
    db.encrypted_blobs = db.encrypted_blobs.filter((b: any) => b.user_id !== userId);
    writeMockDb(db);
    return [];
  }

  // 10e. DELETE FROM report_analysis_events WHERE user_id = ?
  if (queryText.includes("DELETE FROM report_analysis_events WHERE user_id = ?")) {
    const userId = values[0];
    db.report_analysis_events = db.report_analysis_events.filter((e: any) => e.user_id !== userId);
    writeMockDb(db);
    return [];
  }

  // 10f. UPDATE user_meta SET onboarding_done = ?, last_export_at = ? WHERE user_id = ?
  if (queryText.includes("UPDATE user_meta SET") && queryText.includes("onboarding_done =") && queryText.includes("last_export_at =") && queryText.includes("user_id = ?")) {
    const onboarding = values[0];
    const lastExport = values[1];
    const userId = values[2];
    const metaIdx = db.user_meta.findIndex((m: any) => m.user_id === userId);
    if (metaIdx >= 0) {
      db.user_meta[metaIdx].onboarding_done = onboarding;
      db.user_meta[metaIdx].last_export_at = lastExport;
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

  // ── RedConnect: SELECT posts (all, ordered by created_at DESC) ──
  if (queryText.includes("SELECT * FROM rc_posts") && queryText.includes("ORDER BY created_at DESC") && !queryText.includes("WHERE")) {
    if (!db.rc_posts) db.rc_posts = [];
    const limit = typeof values[values.length - 2] === 'number' ? values[values.length - 2] : 30;
    const offset = typeof values[values.length - 1] === 'number' ? values[values.length - 1] : 0;
    const sorted = [...db.rc_posts].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted.slice(offset, offset + limit);
  }
  
  // ── RedConnect: SELECT posts by tag ──
  if (queryText.includes("SELECT * FROM rc_posts WHERE tag = ?") && queryText.includes("ORDER BY created_at DESC")) {
    if (!db.rc_posts) db.rc_posts = [];
    const tag = values[0];
    const limit = typeof values[values.length - 2] === 'number' ? values[values.length - 2] : 30;
    const offset = typeof values[values.length - 1] === 'number' ? values[values.length - 1] : 0;
    const filtered = db.rc_posts.filter((p: any) => p.tag === tag).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered.slice(offset, offset + limit);
  }

  // ── RedConnect: SELECT posts by user_id ──
  if (queryText.includes("SELECT * FROM rc_posts") && queryText.includes("WHERE user_id = ?") && queryText.includes("ORDER BY created_at DESC")) {
    if (!db.rc_posts) db.rc_posts = [];
    const userId = values[0];
    let filtered = db.rc_posts.filter((p: any) => p.user_id === userId);
    
    // Check for tag
    if (queryText.includes("AND tag = ?")) {
      const tag = values[1];
      filtered = filtered.filter((p: any) => p.tag === tag);
    }
    
    const limit = typeof values[values.length - 2] === 'number' ? values[values.length - 2] : 30;
    const offset = typeof values[values.length - 1] === 'number' ? values[values.length - 1] : 0;
    
    filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered.slice(offset, offset + limit);
  }

  // ── RedConnect: SELECT single post by id ──
  if (queryText.includes("SELECT * FROM rc_posts WHERE id = ?") && !queryText.includes("user_id")) {
    if (!db.rc_posts) db.rc_posts = [];
    const postId = values[0];
    const post = db.rc_posts.find((p: any) => p.id === postId);
    return post ? [post] : [];
  }

  // ── RedConnect: INSERT post ──
  if (queryText.includes("INSERT INTO rc_posts")) {
    if (!db.rc_posts) db.rc_posts = [];
    const newPost = {
      id: values[0],
      user_id: values[1],
      username: values[2],
      content: values[3],
      image_url: values[4] || null,
      tag: values[5] || "general",
      created_at: values[6],
      updated_at: values[7] || values[6],
      like_count: 0,
      save_count: 0,
      comment_count: 0,
    };
    db.rc_posts.push(newPost);
    writeMockDb(db);
    return [newPost];
  }

  // ── RedConnect: DELETE post (own only) ──
  if (queryText.includes("DELETE FROM rc_posts WHERE id = ?") && queryText.includes("user_id = ?")) {
    if (!db.rc_posts) db.rc_posts = [];
    if (!db.rc_likes) db.rc_likes = [];
    if (!db.rc_saves) db.rc_saves = [];
    const postId = values[0];
    const userId = values[1];
    const idx = db.rc_posts.findIndex((p: any) => p.id === postId && p.user_id === userId);
    if (idx >= 0) {
      db.rc_posts.splice(idx, 1);
      db.rc_likes = db.rc_likes.filter((l: any) => l.post_id !== postId);
      db.rc_saves = db.rc_saves.filter((s: any) => s.post_id !== postId);
      if (db.rc_comments) {
        db.rc_comments = db.rc_comments.filter((c: any) => c.post_id !== postId);
      }
      writeMockDb(db);
      return [{ id: postId }];
    }
    return [];
  }

  // ── RedConnect: SELECT liked post_ids for user ──
  if (queryText.includes("SELECT post_id FROM rc_likes WHERE user_id = ?")) {
    if (!db.rc_likes) db.rc_likes = [];
    const userId = values[0];
    return db.rc_likes.filter((l: any) => l.user_id === userId).map((l: any) => ({ post_id: l.post_id }));
  }

  // ── RedConnect: SELECT saved post_ids for user ──
  if (queryText.includes("SELECT post_id FROM rc_saves WHERE user_id = ?")) {
    if (!db.rc_saves) db.rc_saves = [];
    const userId = values[0];
    return db.rc_saves.filter((s: any) => s.user_id === userId).map((s: any) => ({ post_id: s.post_id }));
  }

  // ── RedConnect: TOGGLE like ──
  if (queryText.includes("SELECT * FROM rc_likes WHERE user_id = ?") && queryText.includes("post_id = ?")) {
    if (!db.rc_likes) db.rc_likes = [];
    if (!db.rc_posts) db.rc_posts = [];
    const userId = values[0];
    const postId = values[1];
    const existingIdx = db.rc_likes.findIndex((l: any) => l.user_id === userId && l.post_id === postId);
    const postIdx = db.rc_posts.findIndex((p: any) => p.id === postId);
    
    if (existingIdx >= 0) {
      // Unlike
      db.rc_likes.splice(existingIdx, 1);
      if (postIdx >= 0 && db.rc_posts[postIdx].like_count > 0) {
        db.rc_posts[postIdx].like_count--;
      }
      writeMockDb(db);
      return [{ action: "unliked", like_count: postIdx >= 0 ? db.rc_posts[postIdx].like_count : 0 }];
    } else {
      // Like
      db.rc_likes.push({ user_id: userId, post_id: postId, created_at: new Date().toISOString() });
      if (postIdx >= 0) {
        db.rc_posts[postIdx].like_count = (db.rc_posts[postIdx].like_count || 0) + 1;
      }
      writeMockDb(db);
      return [{ action: "liked", like_count: postIdx >= 0 ? db.rc_posts[postIdx].like_count : 1 }];
    }
  }

  // ── RedConnect: TOGGLE save ──
  if (queryText.includes("SELECT * FROM rc_saves WHERE user_id = ?") && queryText.includes("post_id = ?")) {
    if (!db.rc_saves) db.rc_saves = [];
    if (!db.rc_posts) db.rc_posts = [];
    const userId = values[0];
    const postId = values[1];
    const existingIdx = db.rc_saves.findIndex((s: any) => s.user_id === userId && s.post_id === postId);
    const postIdx = db.rc_posts.findIndex((p: any) => p.id === postId);
    
    if (existingIdx >= 0) {
      // Unsave
      db.rc_saves.splice(existingIdx, 1);
      if (postIdx >= 0 && db.rc_posts[postIdx].save_count > 0) {
        db.rc_posts[postIdx].save_count--;
      }
      writeMockDb(db);
      return [{ action: "unsaved", save_count: postIdx >= 0 ? db.rc_posts[postIdx].save_count : 0 }];
    } else {
      // Save
      db.rc_saves.push({ user_id: userId, post_id: postId, created_at: new Date().toISOString() });
      if (postIdx >= 0) {
        db.rc_posts[postIdx].save_count = (db.rc_posts[postIdx].save_count || 0) + 1;
      }
      writeMockDb(db);
      return [{ action: "saved", save_count: postIdx >= 0 ? db.rc_posts[postIdx].save_count : 1 }];
    }
  }

  // ── RedConnect: SELECT saved posts for user (full posts) ──
  if (queryText.includes("SELECT p.* FROM rc_posts p JOIN rc_saves")) {
    if (!db.rc_posts) db.rc_posts = [];
    if (!db.rc_saves) db.rc_saves = [];
    const userId = values[0];
    const savedPostIds = db.rc_saves.filter((s: any) => s.user_id === userId).map((s: any) => s.post_id);
    let savedPosts = db.rc_posts.filter((p: any) => savedPostIds.includes(p.id));
    
    if (queryText.includes("AND p.tag = ?")) {
      const tag = values[1];
      savedPosts = savedPosts.filter((p: any) => p.tag === tag);
    }
    
    const limit = typeof values[values.length - 2] === 'number' ? values[values.length - 2] : 30;
    const offset = typeof values[values.length - 1] === 'number' ? values[values.length - 1] : 0;
    
    savedPosts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return savedPosts.slice(offset, offset + limit);
  }

  // ── RedConnect Comments: SELECT comments for post ──
  if (queryText.includes("SELECT * FROM rc_comments WHERE post_id = ?") && queryText.includes("ORDER BY created_at ASC")) {
    if (!db.rc_comments) db.rc_comments = [];
    const postId = values[0];
    return db.rc_comments.filter((c: any) => c.post_id === postId).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // ── RedConnect Comments: INSERT comment ──
  if (queryText.includes("INSERT INTO rc_comments")) {
    if (!db.rc_comments) db.rc_comments = [];
    const newComment = {
      id: values[0],
      post_id: values[1],
      user_id: values[2],
      username: values[3],
      content: values[4],
      created_at: values[5],
      updated_at: values[6] || values[5],
    };
    db.rc_comments.push(newComment);
    
    // Optimistic mock update for comment_count (though the real route does a separate UPDATE)
    if (db.rc_posts) {
      const postIdx = db.rc_posts.findIndex((p: any) => p.id === newComment.post_id);
      if (postIdx >= 0) {
        db.rc_posts[postIdx].comment_count = (db.rc_posts[postIdx].comment_count || 0) + 1;
      }
    }
    
    writeMockDb(db);
    return [newComment];
  }

  // ── RedConnect Comments: DELETE comment (own only) ──
  if (queryText.includes("DELETE FROM rc_comments WHERE id = ?") && queryText.includes("user_id = ?")) {
    if (!db.rc_comments) db.rc_comments = [];
    const commentId = values[0];
    const userId = values[1];
    const idx = db.rc_comments.findIndex((c: any) => c.id === commentId && c.user_id === userId);
    
    if (idx >= 0) {
      const comment = db.rc_comments[idx];
      db.rc_comments.splice(idx, 1);
      
      // Optimistic mock update for comment_count
      if (db.rc_posts) {
        const postIdx = db.rc_posts.findIndex((p: any) => p.id === comment.post_id);
        if (postIdx >= 0) {
          db.rc_posts[postIdx].comment_count = Math.max(0, (db.rc_posts[postIdx].comment_count || 0) - 1);
        }
      }
      
      writeMockDb(db);
      return [{ id: commentId }];
    }
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
