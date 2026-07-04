/**
 * RedDot — IndexedDB Wrapper
 *
 * Source of truth: docs/04_DATA_MODEL.md
 *
 * Object stores:
 *   - entries: Daily log entries (encrypted payloads, indexed by date)
 *   - cycles:  Cycle records (encrypted payloads, indexed by start_date)
 *   - meta:    App metadata (salt, sync prefs — NOT encrypted)
 *   - chats:   RedDot.ai chat threads (encrypted payloads, indexed by created_at)
 *
 * Every value field for entries/cycles/chats contains ciphertext.
 * Plaintext only exists in-memory while the app is open.
 */

import { openDB, type IDBPDatabase } from "idb";
import type {
  EncryptedEntry,
  EncryptedCycle,
  EncryptedChat,
  AppMeta,
} from "./types";

const DB_NAME = "reddot-db";
const DB_VERSION = 1;

// ──────────────────────────────────────────────
// DB initialization
// ──────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // entries — daily log entries
        if (!db.objectStoreNames.contains("entries")) {
          const entriesStore = db.createObjectStore("entries", {
            keyPath: "entry_id",
          });
          entriesStore.createIndex("by_date", "date");
        }

        // cycles — cycle records
        if (!db.objectStoreNames.contains("cycles")) {
          const cyclesStore = db.createObjectStore("cycles", {
            keyPath: "cycle_id",
          });
          cyclesStore.createIndex("by_start_date", "start_date");
        }

        // meta — app metadata (single record, key = "app_meta")
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }

        // chats — RedDot.ai chat threads (added in v2)
        if (!db.objectStoreNames.contains("chats")) {
          const chatsStore = db.createObjectStore("chats", {
            keyPath: "chat_id",
          });
          chatsStore.createIndex("by_created_at", "created_at");
        }
      },
    });
  }
  return dbPromise;
}

// ──────────────────────────────────────────────
// Entries (Daily Logs)
// ──────────────────────────────────────────────

export async function putEntry(entry: EncryptedEntry): Promise<void> {
  const db = await getDB();
  await db.put("entries", entry);
}

export async function getEntry(entryId: string): Promise<EncryptedEntry | undefined> {
  const db = await getDB();
  return db.get("entries", entryId);
}

export async function getEntryByDate(date: string): Promise<EncryptedEntry | undefined> {
  const db = await getDB();
  return db.getFromIndex("entries", "by_date", date);
}

export async function getAllEntries(): Promise<EncryptedEntry[]> {
  const db = await getDB();
  return db.getAll("entries");
}

export async function getEntriesInRange(
  startDate: string,
  endDate: string
): Promise<EncryptedEntry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex("entries", "by_date", range);
}

export async function deleteEntry(entryId: string): Promise<void> {
  const db = await getDB();
  await db.delete("entries", entryId);
}

// ──────────────────────────────────────────────
// Cycles
// ──────────────────────────────────────────────

export async function putCycle(cycle: EncryptedCycle): Promise<void> {
  const db = await getDB();
  await db.put("cycles", cycle);
}

export async function getCycle(cycleId: string): Promise<EncryptedCycle | undefined> {
  const db = await getDB();
  return db.get("cycles", cycleId);
}

export async function getAllCycles(): Promise<EncryptedCycle[]> {
  const db = await getDB();
  return db.getAll("cycles");
}

export async function deleteCycle(cycleId: string): Promise<void> {
  const db = await getDB();
  await db.delete("cycles", cycleId);
}

// ──────────────────────────────────────────────
// Meta
// ──────────────────────────────────────────────

const META_KEY = "app_meta";

export async function getMeta(): Promise<AppMeta | undefined> {
  const db = await getDB();
  return db.get("meta", META_KEY);
}

export async function putMeta(meta: AppMeta): Promise<void> {
  const db = await getDB();
  await db.put("meta", meta, META_KEY);
}

// ──────────────────────────────────────────────
// Chats (RedDot.ai)
// ──────────────────────────────────────────────

export async function putChat(chat: EncryptedChat): Promise<void> {
  const db = await getDB();
  await db.put("chats", chat);
}

export async function getChat(chatId: string): Promise<EncryptedChat | undefined> {
  const db = await getDB();
  return db.get("chats", chatId);
}

export async function getAllChats(): Promise<EncryptedChat[]> {
  const db = await getDB();
  return db.getAll("chats");
}

export async function deleteChat(chatId: string): Promise<void> {
  const db = await getDB();
  await db.delete("chats", chatId);
}

// ──────────────────────────────────────────────
// Bulk operations (for export/import/sync)
// ──────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["entries", "cycles", "chats", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("entries").clear(),
    tx.objectStore("cycles").clear(),
    tx.objectStore("chats").clear(),
    tx.objectStore("meta").clear(),
    tx.done,
  ]);
}

export interface ExportBundle {
  entries: EncryptedEntry[];
  cycles: EncryptedCycle[];
  chats: EncryptedChat[];
  meta: AppMeta | undefined;
}

export async function exportAll(): Promise<ExportBundle> {
  const [entries, cycles, chats, meta] = await Promise.all([
    getAllEntries(),
    getAllCycles(),
    getAllChats(),
    getMeta(),
  ]);
  return { entries, cycles, chats, meta };
}

export async function importAll(bundle: ExportBundle): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["entries", "cycles", "chats", "meta"], "readwrite");

  for (const entry of bundle.entries) {
    await tx.objectStore("entries").put(entry);
  }
  for (const cycle of bundle.cycles) {
    await tx.objectStore("cycles").put(cycle);
  }
  for (const chat of bundle.chats) {
    await tx.objectStore("chats").put(chat);
  }
  if (bundle.meta) {
    await tx.objectStore("meta").put(bundle.meta, META_KEY);
  }

  await tx.done;
}
