"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SYMPTOM_OPTIONS } from "@/lib/types";
import type { FlowIntensity, DailyEntry } from "@/lib/types";
import { saveEntry, loadEntryByDate, saveCycle, loadAllCycles } from "@/lib/data";
import { generateId } from "@/lib/utils";

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
//
// Wiring: constructs DailyEntry, encrypts via data.ts, saves to IndexedDB.
// Loads existing entry for the selected date to support editing.
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
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryId, setEntryId] = useState<string>("");
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
  const [saved, setSaved] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);

  // Load existing entry when date changes
  useEffect(() => {
    async function loadExisting() {
      setLoadingEntry(true);
      setSaved(false);
      try {
        const existing = await loadEntryByDate(date);
        if (existing) {
          // Pre-fill form with existing data (editing mode)
          setEntryId(existing.entryId);
          setPeriodFlag(existing.periodFlag);
          setFlowIntensity(existing.flowIntensity);
          setSelectedSymptoms(existing.symptoms);
          setMood(existing.mood);
          setScales({
            sleep: existing.sleep,
            energy: existing.energy,
            appetite: existing.appetite,
            exercise: existing.exercise,
          });
          setJournalText(existing.journalText || "");
          if (existing.journalText) setJournalExpanded(true);
        } else {
          // Fresh entry for this date
          setEntryId("");
          setPeriodFlag(false);
          setFlowIntensity(undefined);
          setSelectedSymptoms([]);
          setMood(undefined);
          setScales({
            sleep: undefined,
            energy: undefined,
            appetite: undefined,
            exercise: undefined,
          });
          setJournalText("");
          setJournalExpanded(false);
        }
      } catch (err) {
        console.error("Failed to load entry:", err);
      } finally {
        setLoadingEntry(false);
      }
    }
    loadExisting();
  }, [date]);

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
    setSaved(false);

    try {
      // Construct DailyEntry
      const entry: DailyEntry = {
        entryId: entryId || generateId(),
        date,
        periodFlag,
        flowIntensity: periodFlag ? flowIntensity : undefined,
        symptoms: selectedSymptoms,
        mood,
        sleep: scales.sleep,
        energy: scales.energy,
        appetite: scales.appetite,
        exercise: scales.exercise,
        journalText: journalText || undefined,
      };

      // Encrypt and save to IndexedDB
      await saveEntry(entry);

      // If period was flagged, check if we need to create/update a cycle record
      if (periodFlag) {
        await maybeCreateCycle(date);
      }

      // Store the entryId for subsequent edits
      setEntryId(entry.entryId);
      setSaved(true);

      // Brief success state, then navigate back
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (err) {
      console.error("Failed to save entry:", err);
      setSaving(false);
    }
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

      {loadingEntry ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-signal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
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
            className={`w-full py-3 rounded-md font-medium transition-colors ${
              saved
                ? "bg-green-700 text-paper"
                : "bg-signal text-paper hover:bg-signal-deep disabled:opacity-40"
            }`}
          >
            {saved ? "✓ Saved" : saving ? "Saving..." : entryId ? "Update entry" : "Save entry"}
          </button>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Helper: create a new cycle record if this period entry
// starts a new cycle (i.e., yesterday wasn't a period day)
// ──────────────────────────────────────────────

async function maybeCreateCycle(date: string) {
  try {
    let startDate = date;
    const checkDate = new Date(date);

    // Trace backwards to find the first day of the consecutive period streak
    for (let i = 0; i < 10; i++) { // Limit lookup to 10 days to prevent excessive reads
      checkDate.setDate(checkDate.getDate() - 1);
      const checkDateStr = checkDate.toISOString().split("T")[0];
      const prevEntry = await loadEntryByDate(checkDateStr);
      if (prevEntry?.periodFlag) {
        startDate = checkDateStr;
      } else {
        break;
      }
    }

    // Ensure a cycle record exists for this period start date
    const allCycles = await loadAllCycles();
    const existingCycle = allCycles.find((c) => c.startDate === startDate);
    if (!existingCycle) {
      await saveCycle({
        cycleId: generateId(),
        startDate,
      });
    }
  } catch (err) {
    console.error("Failed to check/create cycle:", err);
  }
}
