"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { DailyEntry } from "@/lib/types";

// ──────────────────────────────────────────────
// Day Detail — slide-up panel (#13 from 06_PAGES_AND_FLOWS.md)
//
// Read view of a specific day's full log. Opens when tapping
// a day cell in the heatmap or calendar view.
// Not a full page nav — remains a slide-up panel/modal.
// ──────────────────────────────────────────────

interface DayDetailProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: DailyEntry | null;
  date: string;
}

const MOOD_LABELS: Record<number, string> = {
  1: "😞 Very low",
  2: "😔 Low",
  3: "😐 Okay",
  4: "🙂 Good",
  5: "😊 Great",
};

const SCALE_NAMES: Record<string, string> = {
  sleep: "Sleep",
  energy: "Energy",
  appetite: "Appetite",
  exercise: "Exercise",
};

export default function DayDetail({ isOpen, onClose, entry, date }: DayDetailProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Day detail for ${formattedDate}`}
        className="
          fixed bottom-0 left-0 right-0 z-50
          max-h-[80vh] overflow-y-auto
          bg-ash rounded-t-lg
          animate-in slide-in-from-bottom duration-300
        "
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-fog/30" />
        </div>

        <div className="px-6 pb-8 space-y-5">
          {/* ── Date header ── */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-paper">{formattedDate}</h2>
            <button
              onClick={onClose}
              className="text-fog hover:text-paper transition-colors text-sm"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {!entry ? (
            <div className="space-y-4 py-2">
              <p className="text-fog text-sm">No data logged for this day.</p>
              <button
                onClick={() => router.push(`/dashboard/log?date=${date}`)}
                className="w-full py-2.5 bg-signal text-paper font-semibold hover:bg-signal-deep text-xs rounded transition-colors uppercase tracking-wider font-mono"
              >
                Log this Day
              </button>
            </div>
          ) : (
            <>
              {/* ── Period ── */}
              {entry.periodFlag && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-signal" />
                  <span className="text-sm text-paper">
                    Period{entry.flowIntensity ? ` — ${entry.flowIntensity}` : ""}
                  </span>
                </div>
              )}

              {/* ── Symptoms ── */}
              {entry.symptoms.length > 0 && (
                <div>
                  <h3 className="text-xs text-fog uppercase tracking-wider mb-2">
                    Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 bg-void rounded-md text-xs text-fog"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Mood ── */}
              {entry.mood && (
                <div>
                  <h3 className="text-xs text-fog uppercase tracking-wider mb-1">
                    Mood
                  </h3>
                  <span className="text-sm text-paper">
                    {MOOD_LABELS[entry.mood] || entry.mood}
                  </span>
                </div>
              )}

              {/* ── Scales ── */}
              {(["sleep", "energy", "appetite", "exercise"] as const).some(
                (k) => entry[k] !== undefined
              ) && (
                <div>
                  <h3 className="text-xs text-fog uppercase tracking-wider mb-2">
                    Quick scales
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(["sleep", "energy", "appetite", "exercise"] as const).map(
                      (key) =>
                        entry[key] !== undefined ? (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-void rounded-md px-3 py-2"
                          >
                            <span className="text-xs text-fog">
                              {SCALE_NAMES[key]}
                            </span>
                            <span className="text-sm font-mono text-paper">
                              {entry[key]}/5
                            </span>
                          </div>
                        ) : null
                    )}
                  </div>
                </div>
              )}

              {/* ── Journal ── */}
              {entry.journalText && (
                <div>
                  <h3 className="text-xs text-fog uppercase tracking-wider mb-1">
                    Journal
                  </h3>
                  <p className="text-sm text-paper/80 leading-relaxed whitespace-pre-wrap">
                    {entry.journalText}
                  </p>
                </div>
              )}
              <button
                onClick={() => router.push(`/dashboard/log?date=${date}`)}
                className="w-full py-2.5 bg-void border border-white/10 hover:border-signal/40 text-paper font-semibold hover:bg-ash/50 text-xs rounded transition-all uppercase tracking-wider font-mono mt-4"
              >
                Edit Log Entry
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
