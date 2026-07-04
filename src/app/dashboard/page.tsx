"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import type { NavSection } from "@/components/nav/PillNav";
import PhaseRing from "@/components/tracking/PhaseRing";
import type { CyclePhase } from "@/lib/types";

// ──────────────────────────────────────────────
// Dashboard — the default landing screen after login
//
// Per 06_PAGES_AND_FLOWS.md: phase-ring, today's quick-log entry point,
// last-backup indicator, AI insight preview.
// ──────────────────────────────────────────────

// Demo data — will be replaced by real data from IndexedDB
const DEMO_PHASE: CyclePhase = "follicular";
const DEMO_DAY_IN_PHASE = 4;
const DEMO_CYCLE_DAY = 9;

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<NavSection>("tracking");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleSectionChange = useCallback((section: NavSection) => {
    setActiveSection(section);
    // TODO: route to section pages
  }, []);

  return (
    <AppShell
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      email="user@example.com"
      onLogout={() => {
        // TODO: clear key, redirect
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* ── Greeting ── */}
        <div>
          <h1 className="text-2xl font-bold text-paper">{greeting}</h1>
          <p className="text-fog text-sm mt-1">
            Here&apos;s your cycle at a glance.
          </p>
        </div>

        {/* ── Phase Ring ── */}
        <div className="flex justify-center py-4">
          <PhaseRing
            currentPhase={DEMO_PHASE}
            dayWithinPhase={DEMO_DAY_IN_PHASE}
            cycleDay={DEMO_CYCLE_DAY}
            size={220}
          />
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/dashboard/log"
            className="bg-ash rounded-md p-4 hover:bg-ash/80 transition-colors group"
          >
            <div className="text-sm font-medium text-paper group-hover:text-signal transition-colors">
              Log today
            </div>
            <div className="text-xs text-fog mt-1">
              Mood, symptoms, notes
            </div>
          </a>
          <a
            href="/dashboard/cycle"
            className="bg-ash rounded-md p-4 hover:bg-ash/80 transition-colors group"
          >
            <div className="text-sm font-medium text-paper group-hover:text-signal transition-colors">
              Cycle view
            </div>
            <div className="text-xs text-fog mt-1">
              History & patterns
            </div>
          </a>
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
          <span>Last backup: Never</span>
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
    </AppShell>
  );
}
