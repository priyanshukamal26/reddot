/**
 * RedDot — Data Types
 *
 * Source of truth: docs/04_DATA_MODEL.md
 *
 * These types are the contract between the encryption layer, IndexedDB layer,
 * and the UI. Keep them stable — 06_PAGES_AND_FLOWS.md and 08_AI_PROMPTS_AND_LOGIC.md
 * assume this shape when describing what data feeds into screens and AI prompts.
 */

// ──────────────────────────────────────────────
// In-memory (decrypted) shapes
// ──────────────────────────────────────────────

export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";

export type DailyEntry = {
  entryId: string;
  date: string; // ISO date (YYYY-MM-DD)
  periodFlag: boolean;
  flowIntensity?: FlowIntensity;
  symptoms: string[];
  mood?: number; // 1–5 scale
  sleep?: number; // 1–5
  energy?: number; // 1–5
  appetite?: number; // 1–5
  exercise?: number; // 1–5
  journalText?: string;
};

export type Cycle = {
  cycleId: string;
  startDate: string;
  endDate?: string;
  flowDetails?: string;
  notes?: string;
};

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";
export type PredictionConfidence = "regular" | "irregular";

export type CurrentPhase = {
  phase: CyclePhase;
  dayWithinPhase: number;
  cycleDay: number;
  confidence: PredictionConfidence;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type Chat = {
  chatId: string;
  createdAt: string;
  titleHint: string; // Content-neutral label only (e.g., "Chat from June 14")
  messages: ChatMessage[];
  title?: string;
};

// ──────────────────────────────────────────────
// IndexedDB record shapes (encrypted at rest)
// ──────────────────────────────────────────────

export type EncryptedEntry = {
  entry_id: string;
  date: string; // NOT encrypted — needed for indexing/range queries
  encrypted_payload: string; // ciphertext of DailyEntry payload fields
  iv: string;
  updated_at: string;
};

export type EncryptedCycle = {
  cycle_id: string;
  start_date: string; // NOT encrypted — needed for prediction math
  encrypted_payload: string;
  iv: string;
};

export type EncryptedChat = {
  chat_id: string;
  created_at: string; // NOT encrypted — needed for sorting the chat list
  title_hint: string; // NOT encrypted — content-neutral label
  encrypted_payload: string; // ciphertext of ChatMessage[]
  iv: string;
  updated_at: string;
};

export type AppMeta = {
  last_export_at: string | null;
  sync_enabled: boolean;
  onboarding_done: boolean;
  salt: string; // PBKDF2 salt — not secret, must be consistent
};

// ──────────────────────────────────────────────
// Symptom chips — canonical list for UI
// ──────────────────────────────────────────────

export const SYMPTOM_OPTIONS = [
  "cramps",
  "headache",
  "acne",
  "bloating",
  "fatigue",
  "breast tenderness",
  "nausea",
  "back pain",
  "insomnia",
  "dizziness",
  "cravings",
  "irritability",
  "anxiety",
  "constipation",
  "diarrhea",
] as const;

export type Symptom = (typeof SYMPTOM_OPTIONS)[number];
