/**
 * RedDot — Auth Context
 *
 * Local-first authentication via password-derived encryption key.
 *
 * In the MVP (no Neon/Auth.js), the user's password is used to derive
 * an AES-GCM-256 encryption key via PBKDF2. The key lives in React context
 * (memory only) — it's never stored to disk.
 *
 * When Neon/Auth.js arrives, the password comes from the login form
 * instead of local-only; the key derivation logic stays identical.
 *
 * Source of truth: docs/03_ARCHITECTURE.md, docs/09_SECURITY_AND_PRIVACY.md
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { deriveKey, generateSalt } from "@/lib/crypto";
import { setEncryptionKey, clearEncryptionKey, loadMeta, saveMeta } from "@/lib/data";
import type { AppMeta } from "@/lib/types";

// ──────────────────────────────────────────────
// Context shape
// ──────────────────────────────────────────────

interface AuthContextValue {
  /** Whether the encryption key is derived and available */
  isAuthenticated: boolean;
  /** True while checking existing session on mount */
  isLoading: boolean;
  /** Whether onboarding has been completed */
  onboardingDone: boolean;
  /** App metadata (sync, backup, etc.) */
  meta: AppMeta | null;

  /**
   * Sign up: generate salt, derive key, save meta.
   * Used during first-time onboarding.
   */
  signup: (password: string) => Promise<void>;

  /**
   * Log in: load salt from IndexedDB, derive key.
   * Throws if decryption fails (wrong password).
   */
  login: (password: string) => Promise<void>;

  /** Clear key from memory, reset state */
  logout: () => void;

  /** Reload meta from IndexedDB (after onboarding saves it) */
  refreshMeta: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [meta, setMeta] = useState<AppMeta | null>(null);

  // On mount: check if there's existing meta (returning user)
  useEffect(() => {
    async function checkSession() {
      try {
        const existingMeta = await loadMeta();
        if (existingMeta) {
          setMeta(existingMeta);
          setOnboardingDone(existingMeta.onboarding_done);
        }
      } catch {
        // No meta = fresh install, that's fine
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const signup = useCallback(async (password: string) => {
    const salt = generateSalt();
    const key = await deriveKey(password, salt);

    // Set the key in the data service (module-level singleton)
    setEncryptionKey(key);

    // Save initial meta with the salt
    const initialMeta: AppMeta = {
      last_export_at: null,
      sync_enabled: false,
      onboarding_done: false,
      salt,
    };
    await saveMeta(initialMeta);

    setMeta(initialMeta);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (password: string) => {
    // Load the salt from existing meta
    const existingMeta = await loadMeta();
    if (!existingMeta?.salt) {
      throw new Error("No account found on this device. Please sign up first.");
    }

    const key = await deriveKey(password, existingMeta.salt);
    setEncryptionKey(key);

    setMeta(existingMeta);
    setOnboardingDone(existingMeta.onboarding_done);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearEncryptionKey();
    setIsAuthenticated(false);
    setOnboardingDone(false);
    setMeta(null);
  }, []);

  const refreshMeta = useCallback(async () => {
    const freshMeta = await loadMeta();
    if (freshMeta) {
      setMeta(freshMeta);
      setOnboardingDone(freshMeta.onboarding_done);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        onboardingDone,
        meta,
        signup,
        login,
        logout,
        refreshMeta,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
