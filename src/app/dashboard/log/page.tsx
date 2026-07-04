"use client";

import { useState, useCallback } from "react";
import { SYMPTOM_OPTIONS } from "@/lib/types";
import type { FlowIntensity } from "@/lib/types";

// ──────────────────────────────────────────────
// Daily Log Screen (#11 from 06_PAGES_AND_FLOWS.md)
//
// Single scrollable screen, NOT a wizard. Per the flow:
// 1. Date (defaults to today, can navigate to past days)
// 2. Period flag + flow intensity
// 3. Symptom chips (multi-select, tap to toggle)
// 4. Mood slider/emoji row
// 5. Sleep/energy/appetite/exercise compact scales
// 6. Journal text field (collapsed/expandable)
// 7. Save
//
// Target: logging takes under 15 seconds for a returning user (C3 acceptance)
// ──────────────────────────────────────────────

const MOOD_EMOJIS = [
  { value: 1, emoji: "😞", label: "Very low" },
  { value: 2, emoji: "😔", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: "spotting", label: "Spotting" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

const SCALE_LABELS: Record<string, string> = {
  sleep: "Sleep",
  energy: "Energy",
  appetite: "Appetite",
  exercise: "Exercise",
};

export default function DailyLogPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [periodFlag, setPeriodFlag] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<number | undefined>();
  const [scales, setScales] = useState<Record<string, number | undefined>>({
    sleep: undefined,
    energy: undefined,
    appetite: undefined,
    exercise: undefined,
  });
  const [journalText, setJournalText] = useState("");
  const [journalExpanded, setJournalExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSymptom = useCallback((symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }, []);

  const setScale = useCallback((key: string, value: number) => {
    setScales((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // TODO: construct DailyEntry, encrypt, save to IndexedDB
    // For now, just simulate
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    // TODO: show success, navigate back
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* ── Header with date nav ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-paper">Daily log</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-ash text-paper border border-fog/10 rounded-md px-2 py-1 text-sm font-mono focus:outline-none focus:border-signal"
        />
      </div>

      {/* ── Period flag + flow intensity ── */}
      <div className="space-y-3">
        <button
          onClick={() => {
            setPeriodFlag(!periodFlag);
            if (periodFlag) setFlowIntensity(undefined);
          }}
          className={`w-full py-3 rounded-md font-medium text-sm transition-colors ${
            periodFlag
              ? "bg-signal text-paper"
              : "bg-ash text-fog hover:text-paper"
          }`}
        >
          {periodFlag ? "Period today ✓" : "Period today?"}
        </button>

        {periodFlag && (
          <div className="flex gap-2">
            {FLOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFlowIntensity(opt.value)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                  flowIntensity === opt.value
                    ? "bg-signal/20 text-signal border border-signal/30"
                    : "bg-ash text-fog hover:text-paper border border-fog/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Symptom chips ── */}
      <div>
        <h2 className="text-sm font-medium text-fog mb-2">Symptoms</h2>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedSymptoms.includes(symptom)
                  ? "bg-signal/15 text-signal border border-signal/30"
                  : "bg-ash text-fog hover:text-paper border border-fog/10"
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mood emoji row ── */}
      <div>
        <h2 className="text-sm font-medium text-fog mb-2">Mood</h2>
        <div className="flex justify-between">
          {MOOD_EMOJIS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? undefined : m.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all ${
                mood === m.value
                  ? "bg-signal/10 scale-110"
                  : "hover:bg-ash"
              }`}
              aria-label={m.label}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-fog">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sleep/Energy/Appetite/Exercise scales ── */}
      <div>
        <h2 className="text-sm font-medium text-fog mb-2">
          Quick scales{" "}
          <span className="text-fog/50 font-normal">(optional)</span>
        </h2>
        <div className="space-y-3">
          {Object.entries(SCALE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-fog w-16">{label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScale(key, v)}
                    className={`w-8 h-8 rounded-md text-xs font-mono transition-colors ${
                      scales[key] === v
                        ? "bg-signal text-paper"
                        : "bg-ash text-fog hover:text-paper"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Journal ── */}
      <div>
        <button
          onClick={() => setJournalExpanded(!journalExpanded)}
          className="text-sm text-fog hover:text-paper transition-colors"
        >
          {journalExpanded ? "▾ Journal" : "▸ Journal (tap to expand)"}
        </button>
        {journalExpanded && (
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="How are you feeling today?"
            rows={4}
            className="mt-2 w-full bg-ash text-paper border border-fog/10 rounded-md p-3 text-sm resize-none focus:outline-none focus:border-signal placeholder:text-fog/40"
          />
        )}
      </div>

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-md bg-signal text-paper font-medium hover:bg-signal-deep transition-colors disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save entry"}
      </button>
    </div>
  );
}
