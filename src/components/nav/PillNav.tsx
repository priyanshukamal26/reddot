"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import CoreDot from "@/components/layout/CoreDot";
import type { CyclePhase } from "@/lib/types";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type NavSection = "tracking" | "reddot-ai" | "know";

interface PillNavProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  onProfileClick: () => void;
  userInitial?: string;
  currentPhase?: CyclePhase | null;
}

// Helper to resolve phase color
const getPhaseColor = (phase: CyclePhase | null) => {
  switch (phase) {
    case "menstrual":
      return "#E01028";
    case "follicular":
      return "#D9C9C7";
    case "ovulation":
      return "#FAFAFA";
    case "luteal":
      return "#4A3536";
    default:
      return "#E01028"; // Default brand red
  }
};

// ──────────────────────────────────────────────
// Nav labels — "RedDot.ai" used ONLY for the AI feature per naming rule
// ──────────────────────────────────────────────

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "tracking", label: "Tracking" },
  { id: "reddot-ai", label: "RedDot.ai" },
  { id: "know", label: "Know" },
];

export default function PillNav({
  activeSection,
  onSectionChange,
  onProfileClick,
  userInitial = "?",
  currentPhase = null,
}: PillNavProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Map<NavSection, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Measure active segment and position the sliding indicator
  const updateIndicator = useCallback(() => {
    const pill = pillRef.current;
    const activeBtn = segmentRefs.current.get(activeSection);
    if (!pill || !activeBtn) return;

    const pillRect = pill.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setIndicatorStyle({
      left: btnRect.left - pillRect.left,
      width: btnRect.width,
      height: btnRect.height,
    });
  }, [activeSection]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const setSegmentRef = (id: NavSection) => (el: HTMLButtonElement | null) => {
    if (el) {
      segmentRefs.current.set(id, el);
    } else {
      segmentRefs.current.delete(id);
    }
  };

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 md:px-8"
      aria-label="Primary navigation"
    >
      {/* ── Logo / wordmark ── */}
      <div className="flex items-center gap-2 select-none">
        <CoreDot color={getPhaseColor(currentPhase)} className="w-2 h-2" />
        <span className="text-xl font-bold tracking-tight text-paper">
          Red<span className="text-signal">Dot</span>
        </span>
      </div>

      {/* ── The pill ── */}
      <div
        ref={pillRef}
        className="relative flex items-center rounded-full bg-void-900 border border-void-border p-1"
        role="tablist"
        aria-label="App sections"
      >
        {/* Sliding indicator */}
        <div
          className="absolute rounded-full border border-signal-500 bg-signal-500/10 transition-all duration-300 ease-out"
          style={indicatorStyle}
          aria-hidden="true"
        />

        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              ref={setSegmentRef(item.id)}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSectionChange(item.id)}
              className={`
                relative z-10 px-4 py-1.5 text-xs font-mono font-medium rounded-full
                transition-colors duration-300 uppercase tracking-widest
                ${isActive ? "text-paper" : "text-fog hover:text-paper"}
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Profile button ── */}
      <button
        onClick={onProfileClick}
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          bg-void-900 border border-void-border text-fog text-sm font-medium
          hover:bg-signal hover:text-paper
          transition-colors duration-200
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal
        "
        aria-label="Open profile menu"
      >
        {userInitial}
      </button>
    </nav>
  );
}
