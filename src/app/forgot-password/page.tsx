"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSalt } from "@/lib/crypto";
import { clearAllData } from "@/lib/db";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/salt?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No account found with this email.");
      }
      setEmailChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!acknowledged) {
      setError("Please acknowledge the data loss warning to continue.");
      return;
    }

    setLoading(true);

    try {
      // 1. Generate a new salt client-side for the new key derivation
      const newSalt = generateSalt();

      // 2. Call reset-password API endpoint
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, salt: newSalt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      // 3. Clear local IndexedDB database since the decryption key has changed
      // and old logs cannot be decrypted using the new password key.
      await clearAllData();

      // Clear local storage last email logged in
      if (typeof window !== "undefined") {
        localStorage.removeItem("last_logged_in_email");
      }

      setSuccess("Password has been reset successfully. Old encrypted session cleared. Redirecting to login...");
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-signal/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[350px] h-[350px] rounded-full bg-signal-deep/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-paper">
            Red<span className="text-signal">Dot</span>
          </h1>
          <p className="text-fog text-sm mt-2 uppercase font-mono tracking-wider text-[10px]">
            Password Reset & Recovery
          </p>
        </div>

        {!emailChecked ? (
          /* Step 1: Check Email */
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <p className="text-xs text-fog leading-relaxed text-center">
              Enter your email address to check for account existence and prepare the security parameters.
            </p>
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

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40"
            >
              {loading ? "Checking email..." : "Continue"}
            </button>
          </form>
        ) : (
          /* Step 2: Reset Password & Show Cryptographic warning */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Warning block */}
            <div className="bg-error/10 border border-error/20 rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                  CRITICAL: Data Loss Warning
                </h3>
              </div>
              <p className="text-xs text-fog leading-relaxed">
                Because RedDot uses client-side encryption derived from your password, resetting your password will regenerate your encryption keys. 
                <br />
                <br />
                <strong className="text-paper">
                  All your previous logs, cycles, and chats stored locally or synced to the cloud will become PERMANENTLY UNREADABLE.
                </strong>
                <br />
                <br />
                If you have an exported backup (.json) file, you can restore your data after resetting.
              </p>
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 accent-signal"
                />
                <span className="text-xs text-fog leading-normal">
                  I understand that I am permanently losing access to all previously encrypted data on the cloud and this device.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-fog mb-1.5" htmlFor="password">
                New Password
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
                Confirm New Password
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

            {error && <p className="text-error text-sm">{error}</p>}
            {success && <p className="text-signal text-sm font-mono">{success}</p>}

            <button
              type="submit"
              disabled={loading || success !== ""}
              className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40"
            >
              {loading ? "Resetting password..." : "Confirm Password Reset"}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="text-center text-sm">
          <Link href="/login" className="text-fog hover:text-paper transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
