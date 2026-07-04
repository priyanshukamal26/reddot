# 03 — Architecture

> **v2 update:** RedDot.ai's past-chat history feature adds two new rows to the trust-boundary table below (IndexedDB storage and optional sync of chat history) — both follow the existing ciphertext-only pattern, so no new trust boundary or exception was introduced. Everything else in this doc, including the diagram and the AI-assistant plaintext exception, is unchanged from v1.

## High-level system diagram (described)

```
┌─────────────────────────────── BROWSER (trusted boundary) ───────────────────────────────┐
│                                                                                             │
│   ┌──────────────┐      ┌────────────────────┐      ┌───────────────────────────────┐     │
│   │   React UI   │◄────►│  App state (memory) │◄───►│  Encryption layer (Web Crypto) │     │
│   └──────┬───────┘      └────────────────────┘      └───────────────┬─────────────────┘   │
│          │                                                          │                      │
│          │                                                          ▼                      │
│          │                                            ┌─────────────────────────┐          │
│          │                                            │  IndexedDB (encrypted)  │          │
│          │                                            │  cycle/mood/symptom/    │          │
│          │                                            │  journal entries        │          │
│          │                                            └─────────────────────────┘          │
│          │                                                                                  │
└──────────┼──────────────────────────────────────────────────────────────────────────────────┘
           │                                          
           │  (1) auth requests                 (2) optional sync: ciphertext blobs only
           │  (3) AI assistant/insight requests: decrypted-in-memory context, sent per-request only
           │  (4) report upload: raw file, once, for processing only
           ▼
┌─────────────────────────── SERVER (Next.js API routes / Vercel) ──────────────────────────┐
│                                                                                              │
│   ┌────────────────┐     ┌────────────────────┐     ┌─────────────────────────────────┐    │
│   │  Auth handler  │     │  Sync endpoint      │     │  Report analysis endpoint       │    │
│   │  (Auth.js)     │     │  (ciphertext only)  │     │  (in-memory OCR + Groq call,    │    │
│   │                │     │                     │     │   discard file after response)  │    │
│   └───────┬────────┘     └─────────┬───────────┘     └────────────────┬─────────────────┘   │
│           │                        │                                  │                      │
└───────────┼────────────────────────┼──────────────────────────────────┼──────────────────────┘
            │                        │                                  │
            ▼                        ▼                                  ▼
     ┌─────────────┐         ┌──────────────────┐               ┌──────────────┐
     │  Neon (Postgres) │     │  Neon (Postgres)  │               │  Groq API    │
     │  users, auth meta │     │  encrypted blobs   │               │  (Llama 3.3) │
     └─────────────┘         └──────────────────┘               └──────────────┘
```

## Trust boundaries — what's plaintext where

This is the single most important table in the whole spec. Anything touching data should be checked against this.

| Location | Data | Plaintext or ciphertext? |
|---|---|---|
| Browser memory (active session) | Cycle/mood/symptom/journal entries | Plaintext (decrypted for use while app is open) |
| IndexedDB (browser disk) | Same entries, at rest | **Ciphertext** (encrypted with key derived from account password) |
| Network: client → server, sync endpoint | Same entries | **Ciphertext** — server never receives plaintext health data via sync |
| Neon: sync table | Same entries | **Ciphertext blob** — Neon/the server operator cannot read it |
| Network: client → server, AI assistant request | Recent logs needed to answer the question, plus recent turns from the current chat thread (RedDot.ai) | **Plaintext, in-transit over HTTPS, per-request only** — not stored server-side after the response. This is the one place plaintext health data leaves the browser; it's necessary for the AI feature to work and should be disclosed clearly in the privacy page. |
| Network: client → server, report upload | Raw PDF/image file | Plaintext file, in-transit over HTTPS, for processing only |
| Server memory, report analysis | Extracted report text | Plaintext, **in-memory only, never written to disk**, discarded immediately after the Groq response is returned to the client |
| IndexedDB (browser disk), RedDot.ai chat history | Past conversation threads | **Ciphertext** — same key, same AES-GCM scheme as cycle/mood entries (added in v2; see 04_DATA_MODEL.md's `chats` store) |
| Neon: sync table, RedDot.ai chat history (if sync on) | Past conversation threads | **Ciphertext blob** — stored in the same `encrypted_blobs` table as everything else, not a separate server-side chats table (added in v2 — see the explicit "don't build a separate store" note in 08_AI_PROMPTS_AND_LOGIC.md) |
| Neon: users table | Email, hashed password, account metadata | Plaintext (standard auth metadata — never health data) |
| Groq API | Recent logs + chat thread context (assistant) or extracted report text (analysis) | Receives plaintext for the duration of generating a response; Groq's own data retention policy governs this — link to it in the privacy page rather than making claims on Groq's behalf |

**Key implication for the AI assistant (E1):** because it needs context to be useful, it is the one deliberate exception to "no plaintext leaves the browser." This must be stated explicitly and honestly in the Privacy page (B7) — don't let the marketing copy imply zero plaintext ever leaves the device when the assistant feature requires otherwise. Honesty here is a credibility issue, not just a legal one.

## Why this design

- **Local-first by default** addresses the #1 documented complaint in this market (subpoena/legal exposure of cloud-stored cycle data) with an actual structural fix, not a policy promise.
- **Ciphertext-only sync** means even if Neon were compromised or subpoenaed, the operator hands over unreadable blobs — there is nothing to comply with beyond "here is encrypted data we cannot decrypt."
- **Ephemeral report processing** keeps the one most sensitive document type (lab/blood reports) off disk entirely, server or client.
- **The AI assistant exception is disclosed, not hidden** — every privacy-conscious user should be able to find this in 30 seconds on the Privacy page.

## Request flows (summarized)

1. **Sign up** → Auth.js creates user record in Neon (email + hashed password only) → client derives encryption key from password (Web Crypto, PBKDF2) → onboarding begins.
2. **Daily log entry** → written to React state → encrypted client-side → written to IndexedDB → (if sync on) ciphertext blob pushed to Neon sync table.
3. **AI assistant question** → client pulls last ~30 days from decrypted in-memory state → sends question + that context to a Next.js API route → API route calls Groq with the system prompt from 08_AI_PROMPTS_AND_LOGIC.md → response streamed back to client → nothing persisted server-side.
4. **Report upload** → client sends file to a Next.js API route → route runs OCR (if image) or text extraction (if PDF) in memory → sends extracted text to Groq with the strict informational-only system prompt → returns summary to client → discards file and extracted text from memory → logs (server-side, non-PII) a discard timestamp the client can display.
5. **Export** → client gathers all IndexedDB entries → encrypts as one bundle (already encrypted at rest, but re-wrapped into a single downloadable file) → triggers download.
6. **Import** → client reads uploaded file → decrypts with derived key → writes entries into IndexedDB.
7. **Password reset** → if local data exists and isn't backed up, show warning + export shortcut before allowing the reset to proceed (see 09_SECURITY_AND_PRIVACY.md for exact copy).

## Cross-connections between docs

- Encryption specifics (algorithms, key derivation parameters) → 04_DATA_MODEL.md and 09_SECURITY_AND_PRIVACY.md
- Every Groq call's exact system prompt → 08_AI_PROMPTS_AND_LOGIC.md
- Which screens trigger which flows above → 06_PAGES_AND_FLOWS.md
