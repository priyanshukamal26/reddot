"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

// ──────────────────────────────────────────────
// Login Page (#3 from 06_PAGES_AND_FLOWS.md)
//
// Email + password. Loads salt from IndexedDB, derives encryption key,
// redirects to dashboard. Shows error if no account found or wrong password.
// ──────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, onboardingDone } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    if (onboardingDone) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(password);
      // Login succeeded — redirect based on onboarding status
      // Note: the refreshMeta in login updates onboardingDone
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your password and try again."
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-paper">
            Red<span className="text-signal">Dot</span>
          </h1>
          <p className="text-fog text-sm mt-2">
            Menstrual health, private by design.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-fog mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-fog mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-error text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Links */}
        <div className="space-y-2 text-center text-sm">
          <Link href="/forgot-password" className="text-fog hover:text-paper transition-colors">
            Forgot password?
          </Link>
          <div className="text-fog">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-signal hover:text-signal-deep transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
