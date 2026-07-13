"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { saveCycle, saveMeta, loadMeta, saveEntry } from "@/lib/data";
import { generateId } from "@/lib/utils";
import type { Cycle } from "@/lib/types";
import AuthGuard from "@/components/auth/AuthGuard";

// ──────────────────────────────────────────────
// Onboarding Flow (Pages 6–9 from 06_PAGES_AND_FLOWS.md)
//
// Steps:
// 1. Privacy model intro (one screen, plain language)
// 2. Cycle basics (last period start, typical length, "irregular/not sure")
// 3. Sync choice (local-only vs cloud sync)
// 4. Complete / first insight (show first phase-ring prediction)
//
// Wiring: saves first cycle record + app meta to IndexedDB via data service,
// then redirects to /dashboard.
// ──────────────────────────────────────────────

type OnboardingStep = "privacy" | "cycle" | "sync" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, refreshMeta } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("privacy");
  const [cycleData, setCycleData] = useState({
    lastPeriodStart: "",
    typicalLength: "",
    isIrregular: false,
  });
  const [syncChoice, setSyncChoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!isAuthenticated) {
      setError("Session expired. Please sign up again.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // 1. Create first cycle record from entered data
      const firstCycle: Cycle = {
        cycleId: generateId(),
        startDate: cycleData.lastPeriodStart,
        notes: cycleData.isIrregular ? "Irregular cycle reported during onboarding" : undefined,
      };
      await saveCycle(firstCycle);

      // Create a matching daily entry for the last period start date to prevent it from being deleted by recalculateCycles
      await saveEntry({
        entryId: generateId(),
        date: cycleData.lastPeriodStart,
        periodFlag: true,
        symptoms: [],
      });

      // 2. Update app meta with onboarding complete + sync choice
      const existingMeta = await loadMeta();
      if (existingMeta) {
        await saveMeta({
          ...existingMeta,
          onboarding_done: true,
          sync_enabled: syncChoice,
        });
      }

      // 3. Refresh auth context so it knows onboarding is done
      await refreshMeta();

      // 4. Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
      setSaving(false);
    }
  };

  // Calculate what day/phase to show in the completion preview
  const getPreviewDay = (): number => {
    if (!cycleData.lastPeriodStart) return 1;
    const start = new Date(cycleData.lastPeriodStart);
    const today = new Date();
    const diffMs = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const cycleLen = cycleData.typicalLength ? parseInt(cycleData.typicalLength) : 28;
    return (diffDays % cycleLen) + 1;
  };

  return (
    <AuthGuard requireOnboarding={false}>
      <main className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* ── Progress indicator ── */}
          <div className="flex gap-2 mb-8">
            {(["privacy", "cycle", "sync", "complete"] as OnboardingStep[]).map(
              (s, i) => (
                <div
                  key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  (["privacy", "cycle", "sync", "complete"] as OnboardingStep[]).indexOf(step) >= i
                    ? "bg-signal"
                    : "bg-ash"
                }`}
              />
            )
          )}
        </div>

        {/* ── Step 1: Privacy intro ── */}
        {step === "privacy" && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-paper">
              Your data stays <span className="text-signal">yours</span>
            </h1>
            <div className="space-y-4 text-fog text-sm leading-relaxed">
              <p>
                RedDot stores all your health data on your device, encrypted. No
                one — not even us — can read it without your password.
              </p>
              <p>
                You can optionally sync across devices, but even then, the server
                only ever sees encrypted data it can&apos;t decrypt.
              </p>
              <p>
                The AI features (RedDot.ai) do send recent data to generate
                responses — we&apos;re upfront about this in our{" "}
                <span className="text-signal">Privacy page</span>.
              </p>
            </div>
            <button
              onClick={() => setStep("cycle")}
              className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors"
            >
              Got it — continue
            </button>
          </div>
        )}

        {/* ── Step 2: Cycle basics ── */}
        {step === "cycle" && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-paper">
              A few basics
            </h1>
            <p className="text-fog text-sm">
              This helps us calculate your current phase. You can always update
              this later.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-fog mb-1.5">
                  When did your last period start?
                </label>
                <input
                  type="date"
                  value={cycleData.lastPeriodStart}
                  onChange={(e) =>
                    setCycleData({ ...cycleData, lastPeriodStart: e.target.value })
                  }
                  className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="block text-sm text-fog mb-1.5">
                  Typical cycle length (days)
                </label>
                <input
                  type="number"
                  min={18}
                  max={45}
                  placeholder="28"
                  value={cycleData.typicalLength}
                  onChange={(e) =>
                    setCycleData({ ...cycleData, typicalLength: e.target.value })
                  }
                  disabled={cycleData.isIrregular}
                  className="w-full bg-ash text-paper border border-fog/10 rounded-md px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-signal disabled:opacity-40"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cycleData.isIrregular}
                  onChange={(e) =>
                    setCycleData({
                      ...cycleData,
                      isIrregular: e.target.checked,
                      typicalLength: e.target.checked ? "" : cycleData.typicalLength,
                    })
                  }
                  className="accent-signal"
                />
                <span className="text-sm text-fog">
                  My cycle is irregular / I&apos;m not sure
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("privacy")}
                className="flex-1 py-3 rounded-md bg-ash text-fog font-medium hover:text-paper transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("sync")}
                disabled={!cycleData.lastPeriodStart}
                className="flex-1 py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Sync choice ── */}
        {step === "sync" && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-paper">
              Data sync
            </h1>
            <p className="text-fog text-sm leading-relaxed">
              By default, your data stays only on this device. Enable cloud sync
              to access it from other browsers — the server stores only encrypted
              data it cannot read.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setSyncChoice(false)}
                className={`w-full text-left p-4 rounded-md border transition-colors ${
                  !syncChoice
                    ? "border-signal bg-signal/5"
                    : "border-fog/10 bg-ash hover:border-fog/30"
                }`}
              >
                <div className="font-medium text-paper text-sm">
                  Local only
                </div>
                <div className="text-xs text-fog mt-1">
                  Data stays on this device. Most private.
                </div>
              </button>

              <button
                onClick={() => setSyncChoice(true)}
                className={`w-full text-left p-4 rounded-md border transition-colors ${
                  syncChoice
                    ? "border-signal bg-signal/5"
                    : "border-fog/10 bg-ash hover:border-fog/30"
                }`}
              >
                <div className="font-medium text-paper text-sm">
                  Cloud sync (encrypted)
                </div>
                <div className="text-xs text-fog mt-1">
                  Encrypted data syncs to our server — readable only by you.
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("cycle")}
                className="flex-1 py-3 rounded-md bg-ash text-fog font-medium hover:text-paper transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("complete")}
                className="flex-1 py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Complete / first insight ── */}
        {step === "complete" && (
          <div className="space-y-6 animate-in fade-in text-center">
            <h1 className="text-3xl font-bold text-paper">
              You&apos;re all set
            </h1>

            {/* Phase ring preview — shows real calculated day */}
            <div className="flex justify-center py-4">
              <div className="w-40 h-40 rounded-full border-4 border-signal flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold font-mono text-paper">
                    {getPreviewDay()}
                  </span>
                  <br />
                  <span className="text-xs text-fog uppercase tracking-widest">Day</span>
                </div>
              </div>
            </div>

            <p className="text-fog text-sm">
              Your first cycle prediction is ready. Start tracking to make it
              more accurate.
            </p>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40"
            >
              {saving ? "Setting up..." : "Start tracking"}
            </button>
          </div>
        )}
      </div>
      </main>
    </AuthGuard>
  );
}
