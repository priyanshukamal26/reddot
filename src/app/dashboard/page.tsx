"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhaseRing from "@/components/tracking/PhaseRing";
import CoreDot from "@/components/layout/CoreDot";
import { useAuth } from "@/context/auth-context";
import { loadAllCycles, loadAllEntries } from "@/lib/data";
import { summarizeRecentData } from "@/lib/summary";
import { calculateCycleStats, getCurrentPhase, predictNextPeriod, formatDate, daysUntil, calculateLoggingStreak } from "@/lib/cycle";
import type { Cycle, CurrentPhase as CurrentPhaseType } from "@/lib/types";
import { Calendar, PenLine, Sparkles, AlertCircle, Database, LogOut, TrendingUp } from "lucide-react";

// ──────────────────────────────────────────────
// Dashboard — the default landing screen after login
//
// Re-designed for premium Awwwards-grade visual impact:
// - Ambient dark grid backdrop + blurred glows
// - Glassmorphic panels with white/red border highlights
// - Custom micro-interactions and sleek Lucide icons
// - Fully wired to local decrypted IndexedDB cycles
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { meta, logout } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [phase, setPhase] = useState<CurrentPhaseType | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [streak, setStreak] = useState<number>(0);

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
            `Expected window: ${formatDate(pred.rangeStart)} – ${formatDate(pred.rangeEnd)}`
          );
        } else {
          setPrediction(`Next Period: ~${formatDate(pred.expectedDate)} (${days} days)`);
        }

        // Fetch dynamic AI insight
        const entries = await loadAllEntries();
        const summaryText = summarizeRecentData(entries);

        // Calculate logging streak
        const streakVal = calculateLoggingStreak(entries);
        setStreak(streakVal);

        setInsightLoading(true);
        try {
          const res = await fetch("/api/ai/insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recent_data_summary: summaryText,
              phase: currentPhase.phase,
              dayWithinPhase: currentPhase.dayWithinPhase,
              confidence: currentPhase.confidence,
            }),
          });
          if (res.ok) {
            const resData = await res.json();
            setAiInsight(resData.insight);
          } else {
            setAiInsight("Keep tracking daily to prompt private recommendations & correlation insights.");
          }
        } catch (apiErr) {
          console.error("AI Insight request failed:", apiErr);
          setAiInsight("Keep tracking daily to prompt private recommendations & correlation insights.");
        } finally {
          setInsightLoading(false);
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
      <div className="min-h-screen bg-void flex items-center justify-center space-grid">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-[20%] left-[-20%] w-[400px] h-[400px] rounded-full bg-signal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-signal-deep/10 blur-[150px] pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-8 relative z-10">
        {/* ── Header Greeting ── */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-paper font-display">{greeting}</h1>
            <div className="flex gap-2 items-center mt-1">
              <span className="text-fog text-[10px] font-mono uppercase tracking-wider">
                Secure Local Sandbox
              </span>
              {streak > 0 && (
                <span className="text-signal text-[10px] font-mono font-bold flex items-center gap-0.5 animate-pulse">
                  • 🔥 {streak}-DAY STREAK
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="p-2 rounded bg-void-900 border border-void-border text-fog hover:text-signal transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* ── Main Phase Card (Glassmorphic) ── */}
        <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Subtle accent corner element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-signal/5 to-transparent pointer-events-none" />

          {phase ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {/* Ring Ambient Background Glow */}
                <div className="absolute inset-0 rounded-full bg-signal/5 blur-[30px] scale-110 pointer-events-none" />
                <PhaseRing
                  currentPhase={phase.phase}
                  dayWithinPhase={phase.dayWithinPhase}
                  cycleDay={phase.cycleDay}
                  size={200}
                  animate={true}
                />
              </div>

              {prediction && (
                <div className="px-4 py-1.5 rounded bg-void/50 border border-white/5 text-xs text-fog font-mono tracking-wide text-center">
                  {prediction}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-36 h-36 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                <span className="text-fog/40 text-xs">No active cycle</span>
              </div>
              <p className="text-xs text-fog/60 text-center max-w-xs">
                Complete onboarding or log a period start to construct your phase ring.
              </p>
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/dashboard/log")}
            className="bg-void-900 border border-void-border text-left p-5 rounded-xl hover:bg-void-800 hover:border-signal-500/50 hover:shadow-[4px_4px_0px_rgba(224,16,40,0.35)] group transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-full border border-void-border flex items-center justify-center text-fog/50 group-hover:text-signal group-hover:border-signal-500/50 transition-colors mb-3">
              <PenLine className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-paper tracking-wide">
              Log Today
            </div>
            <div className="text-[10px] text-fog mt-1 leading-normal">
              Symptoms, mood, daily logs
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/cycle")}
            className="bg-void-900 border border-void-border text-left p-5 rounded-xl hover:bg-void-800 hover:border-signal-500/50 hover:shadow-[4px_4px_0px_rgba(224,16,40,0.35)] group transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-full border border-void-border flex items-center justify-center text-fog/50 group-hover:text-signal group-hover:border-signal-500/50 transition-colors mb-3">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-paper tracking-wide">
              Cycle View
            </div>
            <div className="text-[10px] text-fog mt-1 leading-normal">
              Heatmap & patterns
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/insights")}
            className="bg-void-900 border border-void-border text-left p-5 rounded-xl hover:bg-void-800 hover:border-signal-500/50 hover:shadow-[4px_4px_0px_rgba(224,16,40,0.35)] group transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-full border border-void-border flex items-center justify-center text-fog/50 group-hover:text-signal group-hover:border-signal-500/50 transition-colors mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-paper tracking-wide">
              Insights
            </div>
            <div className="text-[10px] text-fog mt-1 leading-normal">
              Trend charts & stats
            </div>
          </button>
        </div>

        {/* ── AI Insight preview (Disclosure block layout) ── */}
        <div className="border-l-2 border-signal-500 bg-black/20 px-5 py-4 rounded-r-xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-signal/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-signal" />
            <span className="text-[10px] font-mono text-signal uppercase tracking-wider">
              RedDot.ai Engine
            </span>
          </div>
          {insightLoading ? (
            <div className="flex items-center gap-3 py-2">
              <CoreDot pulse={true} className="w-2 h-2" />
              <span className="text-xs font-mono text-ink-500 uppercase tracking-widest animate-pulse">Analyzing telemetry...</span>
            </div>
          ) : (
            <p className="text-xs text-fog leading-relaxed">
              {aiInsight || "Your logs are fully isolated. Start logging symptoms daily to prompt private recommendations & correlation insights."}
            </p>
          )}
        </div>

        {/* ── Last backup indicator ── */}
        <div className="flex items-center justify-between text-[10px] text-fog/40 font-mono tracking-wider px-1">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>LAST BACKUP: {lastBackup.toUpperCase()}</span>
          </div>
          <span className="text-right">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
          </span>
        </div>

        {/* ── Non-diagnostic disclaimer ── */}
        <div className="flex justify-center gap-1.5 items-center text-[9px] text-fog/30 border-t border-white/5 pt-4">
          <AlertCircle className="w-3 h-3 text-fog/20" />
          <span>Non-diagnostic tool. Consult your physician for medical advice.</span>
        </div>
      </div>
    </div>
  );
}
