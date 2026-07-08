"use client";

import { useState, useEffect } from "react";
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

  // If already authenticated, redirect immediately via useEffect
  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingDone) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingDone, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
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
    <main className="min-h-screen bg-void flex flex-col justify-center items-center px-4 relative pt-16">
      {/* ── Fixed Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
          <Link href="/" className="font-display text-xl font-bold tracking-tight uppercase text-paper">
            Red<span className="text-signal">Dot</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-fog hover:text-paper transition-colors tracking-wider uppercase font-mono">
            Privacy Model
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-signal text-paper font-semibold hover:bg-signal-deep text-xs rounded transition-all uppercase tracking-wider font-mono">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-sm space-y-8 my-auto">
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
