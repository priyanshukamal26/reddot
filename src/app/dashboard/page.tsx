"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhaseRing from "@/components/tracking/PhaseRing";
import { useAuth } from "@/context/auth-context";
import { loadAllCycles, loadMeta } from "@/lib/data";
import { calculateCycleStats, getCurrentPhase, predictNextPeriod, formatDate, daysUntil } from "@/lib/cycle";
import type { Cycle, CurrentPhase as CurrentPhaseType } from "@/lib/types";

// ──────────────────────────────────────────────
// Dashboard — the default landing screen after login
//
// Per 06_PAGES_AND_FLOWS.md: phase-ring, today's quick-log entry point,
// last-backup indicator, AI insight preview.
//
// Now reads real cycle data from IndexedDB via data service.
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { meta } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [phase, setPhase] = useState<CurrentPhaseType | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Load cycle data and calculate phase
  useEffect(() => {
    async function loadData() {
      try {
        const cycles = await loadAllCycles();

        if (cycles.length === 0) {
          // No cycles — shouldn't happen if onboarding completed, but handle gracefully
          setLoading(false);
          return;
        }

        // Sort by start date, get the most recent
        const sorted = [...cycles].sort(
          (a: Cycle, b: Cycle) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        const lastCycleStart = sorted[0].startDate;

        // Calculate stats and current phase
        const stats = calculateCycleStats(cycles);
        const currentPhase = getCurrentPhase(lastCycleStart, stats);
        setPhase(currentPhase);

        // Predict next period
        const pred = predictNextPeriod(lastCycleStart, stats);
        const days = daysUntil(pred.expectedDate);
        if (days <= 0) {
          setPrediction("Period may have started");
        } else if (pred.confidence === "irregular" && pred.rangeStart && pred.rangeEnd) {
          setPrediction(
            `Next period: ${formatDate(pred.rangeStart)} – ${formatDate(pred.rangeEnd)}`
          );
        } else {
          setPrediction(`Next period: ~${formatDate(pred.expectedDate)} (${days}d)`);
        }
      } catch (err) {
        console.error("Failed to load cycle data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Format last backup date
  const lastBackup = meta?.last_export_at
    ? new Date(meta.last_export_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-bold text-paper">{greeting}</h1>
        <p className="text-fog text-sm mt-1">
          Here&apos;s your cycle at a glance.
        </p>
      </div>

      {/* ── Phase Ring ── */}
      {phase ? (
        <div className="flex justify-center py-4">
          <PhaseRing
            currentPhase={phase.phase}
            dayWithinPhase={phase.dayWithinPhase}
            cycleDay={phase.cycleDay}
            size={220}
          />
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <div className="text-center space-y-2">
            <div className="w-40 h-40 mx-auto rounded-full border-2 border-ash flex items-center justify-center">
              <span className="text-fog text-sm">No data yet</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Prediction ── */}
      {prediction && (
        <p className="text-center text-sm text-fog font-mono">{prediction}</p>
      )}

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/dashboard/log")}
          className="bg-ash rounded-md p-4 hover:bg-ash/80 transition-colors group text-left"
        >
          <div className="text-sm font-medium text-paper group-hover:text-signal transition-colors">
            Log today
          </div>
          <div className="text-xs text-fog mt-1">
            Mood, symptoms, notes
          </div>
        </button>
        <button
          onClick={() => router.push("/dashboard/cycle")}
          className="bg-ash rounded-md p-4 hover:bg-ash/80 transition-colors group text-left"
        >
          <div className="text-sm font-medium text-paper group-hover:text-signal transition-colors">
            Cycle view
          </div>
          <div className="text-xs text-fog mt-1">
            History & patterns
          </div>
        </button>
      </div>

      {/* ── AI Insight preview (placeholder for E2) ── */}
      <div className="bg-ash rounded-md p-4 border-l-2 border-signal">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-signal uppercase tracking-wider">
            RedDot.ai
          </span>
        </div>
        <p className="text-sm text-fog leading-relaxed">
          Start logging to get personalized insights about your cycle patterns.
        </p>
      </div>

      {/* ── Last backup indicator (B5) ── */}
      <div className="flex items-center justify-between text-xs text-fog/60">
        <span>Last backup: {lastBackup}</span>
        <span className="font-mono">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* ── Non-diagnostic disclaimer (visible per 08_AI_PROMPTS_AND_LOGIC.md) ── */}
      <p className="text-[10px] text-fog/40 text-center">
        RedDot is not a medical device and does not provide diagnoses.
        Always consult a healthcare provider for medical advice.
      </p>
    </div>
  );
}
