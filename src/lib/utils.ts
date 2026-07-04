/**
 * Generate a UUID v4 using the Web Crypto API.
 * No external dependency needed.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
