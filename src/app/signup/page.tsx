"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

// ──────────────────────────────────────────────
// Sign Up Page (#4 from 06_PAGES_AND_FLOWS.md)
//
// Email + password + the "your password is also your encryption key"
// explainer. This explainer is short and can't be skipped — it's
// critical for user understanding per 02_FEATURE_SPEC.md (A1).
//
// Wiring: calls auth context signup() → derives encryption key from
// password via PBKDF2 → saves salt to IndexedDB → redirects to
// /onboarding for cycle data collection.
// ──────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!acknowledged) {
      setError("Please acknowledge the encryption notice to continue.");
      return;
    }

    setLoading(true);

    try {
      // Derive encryption key from password, save salt to IndexedDB
      await signup(email, password);
      router.push("/onboarding");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
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
          <Link href="/login" className="px-4 py-2 bg-signal text-paper font-semibold hover:bg-signal-deep text-xs rounded transition-all uppercase tracking-wider font-mono">
            Sign In
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-sm space-y-8 my-auto">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-paper">
            Red<span className="text-signal">Dot</span>
          </h1>
          <p className="text-fog text-sm mt-2">Create your account</p>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-fog mb-1.5" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="••••••••"
            />
          </div>

          {/* ── Encryption key notice — can't be skipped ── */}
          <div className="bg-ash rounded-md p-4 border-l-2 border-signal">
            <h3 className="text-sm font-medium text-paper mb-2">
              🔐 Important: your password = your encryption key
            </h3>
            <p className="text-xs text-fog leading-relaxed">
              RedDot encrypts all your health data with a key derived from your
              password. This means your data is only readable with your password —
              even we can&apos;t access it. But it also means{" "}
              <strong className="text-paper">
                if you forget your password, your data cannot be recovered.
              </strong>{" "}
              We recommend noting your password somewhere safe and using the
              backup feature regularly.
            </p>
            <label className="flex items-start gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 accent-signal"
              />
              <span className="text-xs text-fog">
                I understand that my password encrypts my data and losing it
                means losing access to my data.
              </span>
            </label>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !acknowledged}
            className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Links */}
        <div className="text-center text-sm text-fog">
          Already have an account?{" "}
          <Link href="/login" className="text-signal hover:text-signal-deep transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
