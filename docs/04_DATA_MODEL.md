# 04 — Data Model

> **v2 update:** added the `chats` IndexedDB store and corresponding `Chat`/`ChatMessage` types to support RedDot.ai's persistent past-chat history (see 06_PAGES_AND_FLOWS.md and 08_AI_PROMPTS_AND_LOGIC.md). It follows the exact same encryption/sync pattern as every other store — no new security model was introduced. Everything else in this doc is unchanged from v1.

## Neon (Postgres) schema

Neon stores **auth metadata in plaintext** (as any normal app does) and **everything health-related as opaque ciphertext blobs**. No table should ever have a column for raw symptom names, mood values, dates of periods, etc. in queryable plaintext form — if you find yourself adding such a column, stop and check 03_ARCHITECTURE.md.

```sql
-- Users & auth (handled mostly by Auth.js / your auth library — shown for clarity)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt/argon2, via auth library — NOT the encryption key
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_enabled  BOOLEAN NOT NULL DEFAULT false
);

-- Encrypted sync blobs. One row per user, or chunked by entry — see note below.
CREATE TABLE encrypted_blobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blob_type     TEXT NOT NULL,           -- 'full_sync' | 'incremental' — implementation detail, not sensitive
  ciphertext    TEXT NOT NULL,           -- base64 ciphertext; server cannot decrypt this
  iv            TEXT NOT NULL,           -- initialization vector, needed for decryption client-side
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Non-sensitive app metadata only — last backup reminder, etc.
CREATE TABLE user_meta (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_export_at    TIMESTAMPTZ,          -- client reports this after a successful export; helps drive the "last backup" indicator across devices
  onboarding_done   BOOLEAN NOT NULL DEFAULT false,
  notifications_on  BOOLEAN NOT NULL DEFAULT false
);

-- Optional: anonymized, non-PII log of report-analysis usage for the "discarded at X" UI proof
-- Stores nothing about the report's content — just that an event happened and when.
CREATE TABLE report_analysis_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  discarded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Note on `encrypted_blobs` granularity:** for MVP, simplest is one row per user, overwritten on each sync (`blob_type = 'full_sync'`), rather than building incremental diff/merge logic. Re-encrypt and re-upload the full local dataset on every sync. This is fine at hackathon scale (a single user's cycle data is tiny) and avoids building conflict resolution. Don't over-engineer this for MVP.

## IndexedDB schema (client-side)

One database, e.g. `cycle-app-db`, with these object stores. **Every value field below is the encrypted ciphertext string** — the actual shape (cycle day, mood score, etc.) only exists in plaintext in memory while the app is open.

```
Object store: entries
  key: entry_id (string, uuid)
  value: {
    entry_id: string,
    date: string,            -- ISO date, NOT encrypted (needed for indexing/range queries by date)
    encrypted_payload: string, -- ciphertext of: { periodFlag, flowIntensity, symptoms[], mood, sleep, energy, appetite, exercise, journalText }
    iv: string,
    updated_at: string
  }
  indexes: by `date`

Object store: cycles
  key: cycle_id (string, uuid)
  value: {
    cycle_id: string,
    start_date: string,       -- NOT encrypted, needed for prediction math without decrypting everything
    encrypted_payload: string, -- ciphertext of: { endDate, flowDetails, notes }
    iv: string
  }
  indexes: by `start_date`

Object store: meta
  key: fixed key, e.g. "app_meta"
  value: {
    last_export_at: string | null,
    sync_enabled: boolean,
    onboarding_done: boolean,
    salt: string              -- PBKDF2 salt for this user's key derivation; NOT secret, but must be stored to re-derive the same key consistently
  }

Object store: chats
  -- Added in v2 for RedDot.ai's persistent past-chat history with resume.
  -- Follows the exact same encryption pattern as `entries` — no new
  -- security model, just a new content type under the same scheme.
  key: chat_id (string, uuid)
  value: {
    chat_id: string,
    created_at: string,         -- ISO timestamp, NOT encrypted (needed for sorting the chat list without decrypting every thread)
    title_hint: string,         -- a short, NOT encrypted label for the chat list (e.g. derived from the first message's date/topic in a non-sensitive way — see note below)
    encrypted_payload: string,  -- ciphertext of: { messages: [{ role: 'user'|'assistant', content: string, timestamp: string }, ...] }
    iv: string,
    updated_at: string
  }
  indexes: by `created_at`
```

**Why `date`/`start_date` are left unencrypted in IndexedDB:** they're needed for efficient range queries (calendar view, prediction calculations) without decrypting every record on every render. A date alone ("something happened on March 3rd") is a low-sensitivity leak compared to the actual symptom/mood content, and this data never leaves the device unencrypted anyway (IndexedDB is local; if sync is on, the synced blob in Neon is the fully-encrypted bundle, dates included). This is a reasonable, document-able trade-off — flag it as such if asked about it in a demo Q&A rather than overclaiming "everything is encrypted, even locally."

**Note on `title_hint`:** the chat list (for "load and resume an old chat") needs some visible label per thread without decrypting every thread just to render a list. Don't use the actual first message content as the unencrypted hint — that would leak sensitive content (e.g., "why is my flow so heavy" sitting in plaintext as a list label defeats the purpose). Use something content-neutral instead: a formatted date/time ("Chat from June 14"), or a generic incrementing label ("Conversation 3"). If a more descriptive title is wanted, generate it client-side from the decrypted content only when the user actively opens the list with their session key already available (i.e., decrypt-on-render, not store-decrypted), rather than persisting any plaintext title.

## Neon schema addition for chat sync (v2)

No new table needed — when sync is enabled, encrypted chat threads use the **same `encrypted_blobs` table** already defined above (`blob_type` can simply include a `'chat_sync'` value alongside `'full_sync'`/`'incremental'`). This is deliberate: see 08_AI_PROMPTS_AND_LOGIC.md's note on why chat history must not get a separately-secured, bespoke server-side store — it follows the same ciphertext-only path as every other data type.



- **Key derivation:** PBKDF2 (Web Crypto `crypto.subtle.deriveKey`), SHA-256, minimum 100,000 iterations, unique salt per user (generated at signup, stored in `meta.salt` — not secret, just needs to be consistent).
- **Encryption:** AES-GCM, 256-bit key, random IV per record (never reuse an IV with the same key).
- **Backup file format:** a single JSON file containing `{ salt, entries: [...], cycles: [...] }` where each entry's `encrypted_payload`/`iv` are carried through as-is — the backup file is just a portable snapshot of the encrypted IndexedDB contents, decryptable only with the account password used to derive the original key.

## In-memory shape (decrypted, what the app actually works with at runtime)

```ts
type DailyEntry = {
  entryId: string;
  date: string;               // ISO date
  periodFlag: boolean;
  flowIntensity?: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];         // e.g. ['cramps', 'headache']
  mood?: number;              // 1–5 scale
  sleep?: number;             // 1–5
  energy?: number;            // 1–5
  appetite?: number;          // 1–5
  exercise?: number;          // 1–5 or minutes, decide at build time
  journalText?: string;
};

type Cycle = {
  cycleId: string;
  startDate: string;
  endDate?: string;
  flowDetails?: string;
  notes?: string;
};

type CurrentPhase = {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  dayWithinPhase: number;
  cycleDay: number;
  confidence: 'regular' | 'irregular'; // drives the prediction-range UI behavior from feature C2
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type Chat = {
  // Added in v2 for RedDot.ai's past-chat history/resume.
  chatId: string;
  createdAt: string;
  titleHint: string;   // content-neutral label only — see note above on why
  messages: ChatMessage[];
};
```

These types are the contract between the encryption layer, IndexedDB layer, and the UI — keep them stable; both 06_PAGES_AND_FLOWS.md and 08_AI_PROMPTS_AND_LOGIC.md assume this shape when describing what data feeds into screens and AI prompts.
