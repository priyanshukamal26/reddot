/**
 * RedDot — Data Service
 *
 * The bridge between UI ↔ encryption ↔ IndexedDB.
 *
 * All write operations: serialize → encrypt → store in IndexedDB → auto-sync (if enabled)
 * All read operations: read from IndexedDB → decrypt → deserialize
 *
 * This ensures the UI never needs to know about encryption details.
 * The encryption key must be derived and set before any operations.
 */

import { encryptJSON, decryptJSON } from "./crypto";
import * as db from "./db";
import type {
  DailyEntry,
  Cycle,
  Chat,
  ChatMessage,
  EncryptedEntry,
  EncryptedCycle,
  EncryptedChat,
  AppMeta,
} from "./types";
import { generateId } from "./utils";

// ──────────────────────────────────────────────
// Key management
// ──────────────────────────────────────────────

let encryptionKey: CryptoKey | null = null;

export function setEncryptionKey(key: CryptoKey) {
  encryptionKey = key;
}

export function clearEncryptionKey() {
  encryptionKey = null;
}

export function hasEncryptionKey(): boolean {
  return encryptionKey !== null;
}

function getKey(): CryptoKey {
  if (!encryptionKey) {
    throw new Error(
      "Encryption key not set. User must be logged in before data operations."
    );
  }
  return encryptionKey;
}

// ──────────────────────────────────────────────
// Daily Entries
// ──────────────────────────────────────────────

export async function saveEntry(entry: DailyEntry): Promise<void> {
  const key = getKey();

  // Encrypt the payload (everything except entryId and date)
  const { entryId, date, ...payload } = entry;
  const encrypted = await encryptJSON(key, payload);

  const record: EncryptedEntry = {
    entry_id: entryId,
    date,
    encrypted_payload: encrypted.ciphertext,
    iv: encrypted.iv,
    updated_at: new Date().toISOString(),
  };

  await db.putEntry(record);
  await syncIfEnabled();
}

export async function loadEntry(entryId: string): Promise<DailyEntry | null> {
  const key = getKey();
  const record = await db.getEntry(entryId);
  if (!record) return null;
  return decryptEntry(key, record);
}

export async function loadEntryByDate(date: string): Promise<DailyEntry | null> {
  const key = getKey();
  const record = await db.getEntryByDate(date);
  if (!record) return null;
  return decryptEntry(key, record);
}

export async function loadAllEntries(): Promise<DailyEntry[]> {
  const key = getKey();
  const records = await db.getAllEntries();
  const decoded = await Promise.all(
    records.map(async (r) => {
      try {
        return await decryptEntry(key, r);
      } catch (err) {
        console.warn(`Failed to decrypt daily entry ${r.entry_id}:`, err);
        return null;
      }
    })
  );
  return decoded.filter((e): e is DailyEntry => e !== null);
}

export async function loadEntriesInRange(
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  const key = getKey();
  const records = await db.getEntriesInRange(startDate, endDate);
  const decoded = await Promise.all(
    records.map(async (r) => {
      try {
        return await decryptEntry(key, r);
      } catch (err) {
        console.warn(`Failed to decrypt daily entry ${r.entry_id} in range:`, err);
        return null;
      }
    })
  );
  return decoded.filter((e): e is DailyEntry => e !== null);
}

async function decryptEntry(
  key: CryptoKey,
  record: EncryptedEntry
): Promise<DailyEntry> {
  const payload = await decryptJSON<Omit<DailyEntry, "entryId" | "date">>(key, {
    ciphertext: record.encrypted_payload,
    iv: record.iv,
  });
  return { entryId: record.entry_id, date: record.date, ...payload };
}

// ──────────────────────────────────────────────
// Cycles
// ──────────────────────────────────────────────

export async function saveCycle(cycle: Cycle): Promise<void> {
  const key = getKey();
  const { cycleId, startDate, ...payload } = cycle;
  const encrypted = await encryptJSON(key, payload);

  const record: EncryptedCycle = {
    cycle_id: cycleId,
    start_date: startDate,
    encrypted_payload: encrypted.ciphertext,
    iv: encrypted.iv,
  };

  await db.putCycle(record);
  await syncIfEnabled();
}

export async function loadAllCycles(): Promise<Cycle[]> {
  const key = getKey();
  const records = await db.getAllCycles();
  const decoded = await Promise.all(
    records.map(async (r) => {
      try {
        const payload = await decryptJSON<Omit<Cycle, "cycleId" | "startDate">>(
          key,
          { ciphertext: r.encrypted_payload, iv: r.iv }
        );
        return { cycleId: r.cycle_id, startDate: r.start_date, ...payload };
      } catch (err) {
        console.warn(`Failed to decrypt cycle record ${r.cycle_id}:`, err);
        return null;
      }
    })
  );
  return decoded.filter((c): c is Cycle => c !== null);
}

// ──────────────────────────────────────────────
// Chats (RedDot.ai)
// ──────────────────────────────────────────────

export async function saveChat(chat: Chat): Promise<void> {
  const key = getKey();
  const { chatId, createdAt, titleHint, messages } = chat;
  const encrypted = await encryptJSON(key, { messages });

  const record: EncryptedChat = {
    chat_id: chatId,
    created_at: createdAt,
    title_hint: titleHint,
    encrypted_payload: encrypted.ciphertext,
    iv: encrypted.iv,
    updated_at: new Date().toISOString(),
  };

  await db.putChat(record);
  await syncIfEnabled();
}

export async function loadChat(chatId: string): Promise<Chat | null> {
  const key = getKey();
  const record = await db.getChat(chatId);
  if (!record) return null;

  const payload = await decryptJSON<{ messages: ChatMessage[] }>(key, {
    ciphertext: record.encrypted_payload,
    iv: record.iv,
  });

  return {
    chatId: record.chat_id,
    createdAt: record.created_at,
    titleHint: record.title_hint,
    messages: payload.messages,
  };
}

export async function loadAllChats(): Promise<Chat[]> {
  const key = getKey();
  const records = await db.getAllChats();
  const decoded = await Promise.all(
    records.map(async (r) => {
      try {
        const payload = await decryptJSON<{ messages: ChatMessage[] }>(key, {
          ciphertext: r.encrypted_payload,
          iv: r.iv,
        });
        return {
          chatId: r.chat_id,
          createdAt: r.created_at,
          titleHint: r.title_hint,
          messages: payload.messages,
        };
      } catch (err) {
        console.warn(`Failed to decrypt chat record ${r.chat_id}:`, err);
        return null;
      }
    })
  );
  return decoded.filter((c): c is Chat => c !== null);
}

/**
 * Create a new chat thread with a content-neutral title.
 * Per 04_DATA_MODEL.md: title_hint must NOT contain actual message content
 * to avoid leaking sensitive data as plaintext.
 */
export function createNewChat(): Chat {
  const now = new Date();
  return {
    chatId: generateId(),
    createdAt: now.toISOString(),
    titleHint: `Chat from ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    messages: [],
  };
}

// ──────────────────────────────────────────────
// Meta
// ──────────────────────────────────────────────

export async function loadMeta(): Promise<AppMeta | undefined> {
  return db.getMeta();
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  return db.putMeta(meta);
}

// ──────────────────────────────────────────────
// Export / Import
// ──────────────────────────────────────────────

export async function exportData(): Promise<string> {
  const bundle = await db.exportAll();
  return JSON.stringify(bundle);
}

export async function importData(json: string): Promise<void> {
  const bundle = JSON.parse(json);
  await db.importAll(bundle);
}

// ──────────────────────────────────────────────
// Synchronisation (Neon Cloud Sync)
// ──────────────────────────────────────────────

/**
 * Automatically pushes data to Neon if sync is enabled.
 */
async function syncIfEnabled(): Promise<void> {
  try {
    const meta = await db.getMeta();
    if (!meta || !meta.sync_enabled) return;

    const key = getKey();
    const bundle = await db.exportAll();
    const encrypted = await encryptJSON(key, bundle);

    const res = await fetch("/api/sync/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blob_type: "full_sync",
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      meta.last_export_at = data.updated_at;
      await db.putMeta(meta);
    }
  } catch (err) {
    console.error("Auto-sync failed:", err);
  }
}

/**
 * Force pushes current IndexedDB state to the server.
 */
export async function forcePushSync(): Promise<void> {
  const key = getKey();
  const bundle = await db.exportAll();
  const encrypted = await encryptJSON(key, bundle);

  const res = await fetch("/api/sync/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blob_type: "full_sync",
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to push sync data to server.");
  }

  const data = await res.json();
  const meta = await db.getMeta();
  if (meta) {
    meta.last_export_at = data.updated_at;
    await db.putMeta(meta);
  }
}

/**
 * Pulls synced database state from the server and restores it.
 */
export async function pullAndSync(): Promise<boolean> {
  try {
    const key = getKey();
    const res = await fetch("/api/sync/pull?blob_type=full_sync");
    if (!res.ok) {
      if (res.status === 404) {
        return false; // No server backup found
      }
      throw new Error("Failed to pull sync data.");
    }

    const data = await res.json();
    const decryptedBundle = await decryptJSON<any>(key, {
      ciphertext: data.ciphertext,
      iv: data.iv,
    });

    if (decryptedBundle) {
      await db.importAll(decryptedBundle);

      // Update local last backup time
      const meta = await db.getMeta();
      if (meta) {
        meta.last_export_at = data.updated_at;
        await db.putMeta(meta);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("Pull-sync failed:", err);
    throw err;
  }
}
