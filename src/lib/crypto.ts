/**
 * RedDot — Encryption Layer
 *
 * Source of truth: docs/04_DATA_MODEL.md, docs/09_SECURITY_AND_PRIVACY.md
 *
 * - Key derivation: PBKDF2 (SHA-256, 100,000 iterations, unique salt per user)
 * - Encryption: AES-GCM, 256-bit key, random IV per record
 * - Uses Web Crypto API exclusively — no third-party crypto libraries
 *
 * The encryption key is derived from the user's account password.
 * This is the deliberate MVP simplicity choice documented in 09_SECURITY_AND_PRIVACY.md.
 */

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes — standard for AES-GCM
const SALT_LENGTH = 16; // bytes

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ──────────────────────────────────────────────
// Salt generation
// ──────────────────────────────────────────────

/**
 * Generate a new random salt for PBKDF2 key derivation.
 * Called once at signup; stored in IndexedDB `meta.salt` (not secret, but must be consistent).
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer);
}

// ──────────────────────────────────────────────
// Key derivation
// ──────────────────────────────────────────────

/**
 * Derive an AES-GCM-256 encryption key from the user's password + salt.
 *
 * PBKDF2 with SHA-256, 100,000 iterations per spec.
 * The resulting CryptoKey is usable for encrypt/decrypt operations.
 */
export async function deriveKey(
  password: string,
  saltBase64: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const salt = base64ToArrayBuffer(saltBase64);

  // Import password as raw key material for PBKDF2
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false, // not extractable — the key stays in the crypto subsystem
    ["encrypt", "decrypt"]
  );
}

// ──────────────────────────────────────────────
// Encrypt / Decrypt
// ──────────────────────────────────────────────

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
}

/**
 * Encrypt a plaintext string using AES-GCM with a random IV.
 *
 * IMPORTANT: A new random IV is generated for every call — never reuse an IV
 * with the same key (per 04_DATA_MODEL.md).
 */
export async function encrypt(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt an AES-GCM ciphertext back to plaintext string.
 */
export async function decrypt(
  key: CryptoKey,
  payload: EncryptedPayload
): Promise<string> {
  const cipherBuffer = base64ToArrayBuffer(payload.ciphertext);
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(plainBuffer);
}

// ──────────────────────────────────────────────
// Convenience: encrypt/decrypt JSON objects
// ──────────────────────────────────────────────

/**
 * Encrypt a JSON-serializable object. The object is JSON.stringify'd,
 * then encrypted. Used for DailyEntry payloads, Cycle payloads, Chat messages, etc.
 */
export async function encryptJSON<T>(
  key: CryptoKey,
  data: T
): Promise<EncryptedPayload> {
  return encrypt(key, JSON.stringify(data));
}

/**
 * Decrypt a payload back to a typed JSON object.
 */
export async function decryptJSON<T>(
  key: CryptoKey,
  payload: EncryptedPayload
): Promise<T> {
  const plaintext = await decrypt(key, payload);
  return JSON.parse(plaintext) as T;
}
