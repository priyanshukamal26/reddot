/**
 * RedDot — Auth Context
 *
 * Local-first authentication via password-derived encryption key,
 * integrated with Neon Postgres and NextAuth.js.
 *
 * The password is used to derive an AES-GCM-256 encryption key via PBKDF2
 * client-side. The key lives in React context (memory only) and is never
 * sent to the server or stored to disk.
 *
 * User account records and public keys/salts are maintained on the Neon DB,
 * and standard auth session checks are performed using NextAuth.
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
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
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
  /** Logged in user's email */
  email: string;

  /**
   * Sign up: generate salt, call signup API, derive key, save local meta,
   * sign in to NextAuth.
   */
  signup: (email: string, password: string) => Promise<void>;

  /**
   * Log in: fetch salt from DB (or local fallback), derive key,
   * sign in via NextAuth, load remote meta.
   */
  login: (email: string, password: string) => Promise<void>;

  /** Clear key from memory, reset state, log out of NextAuth */
  logout: () => void;

  /** Reload meta from IndexedDB and push to server */
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
  const [email, setEmail] = useState("");

  // On mount: check if there's existing local meta or an active NextAuth session
  useEffect(() => {
    async function checkSession() {
      try {
        const existingMeta = await loadMeta();
        if (existingMeta) {
          setMeta(existingMeta);
          setOnboardingDone(existingMeta.onboarding_done);
        }

        // Fetch NextAuth session info from server
        const res = await fetch("/api/user/meta");
        if (res.ok) {
          const serverMeta = await res.json();
          if (serverMeta.email) {
            setEmail(serverMeta.email);
          }
        }
      } catch (err) {
        // No local meta or session
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const signup = useCallback(async (emailInput: string, password: string) => {
    const salt = generateSalt();

    // 1. Call server signup route to create user & register salt
    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput, password, salt }),
    });

    if (!signupRes.ok) {
      const data = await signupRes.json();
      throw new Error(data.error || "Failed to create account.");
    }

    // 2. Derive key in memory client-side
    const key = await deriveKey(password, salt);
    setEncryptionKey(key);

    // 3. Authenticate with NextAuth
    const signInResult = await nextAuthSignIn("credentials", {
      email: emailInput,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      clearEncryptionKey();
      throw new Error("NextAuth sign in failed: " + signInResult.error);
    }

    // 4. Save initial local meta
    const initialMeta: AppMeta = {
      last_export_at: null,
      sync_enabled: false,
      onboarding_done: false,
      salt,
    };
    await saveMeta(initialMeta);

    // 5. Update local user meta on the server
    await fetch("/api/user/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboarding_done: false,
        sync_enabled: false,
        last_export_at: null,
      }),
    });

    setMeta(initialMeta);
    setEmail(emailInput);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (emailInput: string, password: string) => {
    // 1. Retrieve salt (from IndexedDB if matching email/device, else fetch from server DB)
    let salt = "";
    const localMeta = await loadMeta();
    if (localMeta && localMeta.salt) {
      salt = localMeta.salt;
    } else {
      const saltRes = await fetch(`/api/auth/salt?email=${encodeURIComponent(emailInput)}`);
      if (!saltRes.ok) {
        const data = await saltRes.json();
        throw new Error(data.error || "No account found. Please sign up first.");
      }
      const data = await saltRes.json();
      salt = data.salt;
    }

    // 2. Derive key in memory client-side
    const key = await deriveKey(password, salt);
    setEncryptionKey(key);

    // 3. Sign in to NextAuth session
    const signInResult = await nextAuthSignIn("credentials", {
      email: emailInput,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      clearEncryptionKey();
      throw new Error("Invalid password. Please check your credentials and try again.");
    }

    // 4. Load synced metadata from server
    let onboarding = false;
    let syncEnabled = false;
    let lastExport: string | null = null;

    const metaRes = await fetch("/api/user/meta");
    if (metaRes.ok) {
      const serverMeta = await metaRes.json();
      onboarding = serverMeta.onboarding_done;
      syncEnabled = serverMeta.sync_enabled;
      lastExport = serverMeta.last_export_at;
    }

    // 5. Save/Sync meta to local IndexedDB
    const updatedMeta: AppMeta = {
      last_export_at: lastExport,
      sync_enabled: syncEnabled,
      onboarding_done: onboarding,
      salt,
    };
    await saveMeta(updatedMeta);

    setMeta(updatedMeta);
    setOnboardingDone(onboarding);
    setEmail(emailInput);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearEncryptionKey();
    setIsAuthenticated(false);
    setOnboardingDone(false);
    setMeta(null);
    setEmail("");
    nextAuthSignOut({ redirect: false });
  }, []);

  const refreshMeta = useCallback(async () => {
    const freshMeta = await loadMeta();
    if (freshMeta) {
      setMeta(freshMeta);
      setOnboardingDone(freshMeta.onboarding_done);

      // Push updated metadata to server DB
      await fetch("/api/user/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboarding_done: freshMeta.onboarding_done,
          sync_enabled: freshMeta.sync_enabled,
          last_export_at: freshMeta.last_export_at,
        }),
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        onboardingDone,
        meta,
        email,
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
