"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SYMPTOM_OPTIONS } from "@/lib/types";
import type { FlowIntensity, DailyEntry } from "@/lib/types";
import { saveEntry, loadEntryByDate, loadAllCycles, recalculateCycles } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { X, Calendar, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

// Custom Slider Component matching the screenshot
const CustomSlider = ({ value, onChange, label }: { value: number | undefined, onChange: (val: number) => void, label: string }) => {
  const percent = ((value || 1) - 1) / 4 * 100;
  return (
    <div className="w-full">
      <h3 className="text-xs text-gray-300 mb-2">{label}</h3>
      <div className="relative h-4 flex items-center group cursor-pointer" 
           onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const val = Math.round(((e.clientX - rect.left) / rect.width) * 4) + 1;
              onChange(Math.max(1, Math.min(5, val)));
           }}>
        {/* Track */}
        <div className="absolute w-full h-1 bg-white/10 rounded-full" />
        {/* Fill */}
        <div className="absolute h-1 bg-[#e51d38] shadow-[0_0_8px_#e51d38] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
        {/* Thumb */}
        <div className="absolute w-3 h-3 bg-[#e51d38] rounded-full shadow-[0_0_10px_#e51d38] transform -translate-x-1/2 transition-all duration-300" style={{ left: `${percent}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-2 px-0.5">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyLogPage() {
  const router = useRouter();
  const [date, setDate] = useState(getTodayString());
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);

  // Warning state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Load date from URL parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get("date");
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        const today = getTodayString();
        if (dateParam <= today) {
          setDate(dateParam);
        } else {
          setDate(today);
        }
      }
    }
  }, []);

  // Load existing entry when date changes
  useEffect(() => {
    async function loadExisting() {
      setLoadingEntry(true);
      setSaved(false);
      try {
        const existing = await loadEntryByDate(date);
        if (existing) {
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
        } else {
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
        }
        // Reset unsaved changes flag AFTER state loads
        setTimeout(() => setHasUnsavedChanges(false), 50);
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
    setHasUnsavedChanges(true);
  }, []);

  const setScale = useCallback((key: string, value: number) => {
    setScales((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAutofill = () => {
    const isPeriod = Math.random() < 0.3;
    setPeriodFlag(isPeriod);

    if (isPeriod) {
      const intensities: FlowIntensity[] = ["spotting", "light", "medium", "heavy"];
      setFlowIntensity(intensities[Math.floor(Math.random() * intensities.length)]);
    } else {
      setFlowIntensity(undefined);
    }

    const availableSymptoms = [...SYMPTOM_OPTIONS];
    const numSymptoms = Math.floor(Math.random() * 4);
    const selected: string[] = [];
    for (let i = 0; i < numSymptoms; i++) {
      const idx = Math.floor(Math.random() * availableSymptoms.length);
      const sym = availableSymptoms.splice(idx, 1)[0];
      if (sym) selected.push(sym);
    }
    setSelectedSymptoms(selected);

    setMood(Math.floor(Math.random() * 5) + 1);
    setScales({
      sleep: Math.floor(Math.random() * 5) + 1,
      energy: Math.floor(Math.random() * 5) + 1,
      appetite: Math.floor(Math.random() * 5) + 1,
      exercise: Math.floor(Math.random() * 5) + 1,
    });

    if (Math.random() < 0.25) {
      const journals = [
        "Felt a bit tired in the afternoon.",
        "Had a good workout session today. Energy felt great.",
        "Slept early. Woke up refreshed.",
        "Experiencing mild bloating and cravings today.",
        "Overall productive day, stayed hydrated.",
      ];
      setJournalText(journals[Math.floor(Math.random() * journals.length)]);
    } else {
      setJournalText("");
    }
    
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    const today = getTodayString();
    if (date > today) {
      alert("Logging cycle data for future dates is not permitted.");
      return;
    }
    setSaving(true);
    setSaved(false);

    try {
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

      await saveEntry(entry);
      await recalculateCycles();

      setEntryId(entry.entryId);
      setSaved(true);
      setHasUnsavedChanges(false);

      setTimeout(() => {
        router.back();
      }, 600);
    } catch (err) {
      console.error("Failed to save entry:", err);
      setSaving(false);
    }
  };

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setShowWarning(true);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Blurred Backdrop - Click to dismiss */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={requestClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-[500px] bg-[rgba(20,20,22,0.85)] backdrop-blur-xl border border-[#e51d38]/30 shadow-[0_0_40px_rgba(229,29,56,0.15)] rounded-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        {/* Close X button */}
        <button 
          onClick={requestClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loadingEntry ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#e51d38] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-start justify-between pr-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-3">Daily Log</h1>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-fit">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    max={getTodayString()}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const today = getTodayString();
                      if (selectedVal <= today) {
                        setDate(selectedVal);
                        setHasUnsavedChanges(true);
                      } else {
                        setDate(today);
                      }
                    }}
                    className="bg-transparent text-sm text-gray-300 focus:outline-none focus:text-white w-[110px] [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-9">
                <span className="text-xs text-gray-400">Period today?</span>
                <button 
                  onClick={() => { setPeriodFlag(!periodFlag); setFlowIntensity(undefined); setHasUnsavedChanges(true); }}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${periodFlag ? 'bg-[#e51d38] shadow-[0_0_10px_rgba(229,29,56,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform duration-300 ${periodFlag ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Flow Intensity (if Period is true) */}
            <AnimatePresence>
              {periodFlag && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 overflow-hidden"
                >
                  {FLOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFlowIntensity(opt.value); setHasUnsavedChanges(true); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        flowIntensity === opt.value
                          ? "bg-[#e51d38]/20 text-[#e51d38] border border-[#e51d38]/50 shadow-[0_0_10px_rgba(229,29,56,0.2)]"
                          : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Symptoms ── */}
            <div>
              <h2 className="text-sm font-medium text-gray-300 mb-3">Symptoms</h2>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => {
                  const isActive = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 border ${
                        isActive
                          ? "bg-[rgba(229,29,56,0.15)] text-[#e51d38] border-[#e51d38]/70 shadow-[0_0_10px_rgba(229,29,56,0.3)]"
                          : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-gray-200"
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Mood ── */}
            <div>
              <h2 className="text-sm font-medium text-gray-300 mb-4">Mood</h2>
              <div className="flex justify-between px-2">
                {MOOD_EMOJIS.map((m) => {
                  const isActive = mood === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => { setMood(isActive ? undefined : m.value); setHasUnsavedChanges(true); }}
                      className="flex flex-col items-center gap-2 group transition-all"
                    >
                      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'bg-[#e51d38]/20 shadow-[0_0_15px_rgba(229,29,56,0.3)]' : 'hover:bg-white/5'}`}>
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border border-[#e51d38] shadow-[inset_0_0_10px_rgba(229,29,56,0.5)]" />
                        )}
                        <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110 grayscale-0' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                          {m.emoji}
                        </span>
                      </div>
                      <span className={`text-[10px] transition-colors ${isActive ? 'text-[#e51d38] font-medium' : 'text-gray-500'}`}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Quick Scales ── */}
            <div>
              <h2 className="text-sm font-medium text-gray-300 mb-4">Quick Scales</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {Object.entries(SCALE_LABELS).map(([key, label]) => (
                  <CustomSlider 
                    key={key}
                    label={label}
                    value={scales[key]}
                    onChange={(val) => setScale(key, val)}
                  />
                ))}
              </div>
            </div>

            {/* ── Journal ── */}
            <div>
              <h2 className="text-sm font-medium text-gray-300 mb-3">Additional Notes</h2>
              <textarea
                value={journalText}
                onChange={(e) => { setJournalText(e.target.value); setHasUnsavedChanges(true); }}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[#e51d38]/30 rounded-xl p-4 text-sm text-gray-200 resize-none focus:outline-none focus:border-[#e51d38] shadow-[inset_0_0_20px_rgba(229,29,56,0.05)] transition-all h-24 custom-scrollbar"
              />
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAutofill}
                className="px-6 py-3.5 rounded-full text-[11px] font-mono tracking-widest text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-all flex-[0.8] uppercase"
              >
                Autofill
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-3.5 rounded-full text-[11px] font-bold font-mono tracking-widest text-white transition-all flex-[1.2] uppercase ${
                  saved
                    ? "bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                    : "bg-[#e51d38] shadow-[0_0_15px_rgba(229,29,56,0.4)] hover:shadow-[0_0_25px_rgba(229,29,56,0.6)] hover:bg-[#c0142b]"
                }`}
              >
                {saved ? "Saved" : saving ? "Saving..." : entryId ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Unsaved Changes Warning Overlay */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[340px] bg-[rgba(20,20,22,0.9)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#e51d38]/10 flex items-center justify-center mb-4 border border-[#e51d38]/30 mx-auto">
                <AlertTriangle className="w-6 h-6 text-[#e51d38]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Unsaved Changes</h3>
              <p className="text-sm text-gray-400 mb-6">
                You have unsaved data. If you close now, your progress will be lost.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => router.back()}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 text-xs font-mono tracking-wider text-gray-300 transition-colors uppercase"
                >
                  Discard
                </button>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#e51d38] hover:bg-[#c0142b] text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(229,29,56,0.3)] uppercase"
                >
                  Keep Editing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helper: create a new cycle record if this period entry
// starts a new cycle (i.e., yesterday wasn't a period day)
// ──────────────────────────────────────────────


