"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/components/tracking/CalendarView";
import DayDetail from "@/components/tracking/DayDetail";
import { loadAllEntries, loadEntryByDate } from "@/lib/data";
import type { DailyEntry } from "@/lib/types";

// ──────────────────────────────────────────────
// Cycle Tracker View (#12 from 06_PAGES_AND_FLOWS.md)
//
// Houses the creative heatmap view (MVP) with day detail panel.
// Now reads real entry data from IndexedDB via data service.
// ──────────────────────────────────────────────

interface HeatmapDayData {
  date: string;
  periodFlag: boolean;
  flowIntensity?: "spotting" | "light" | "medium" | "heavy";
  symptomCount: number;
  mood?: number;
}

export default function CycleViewPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDayData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all entries and transform for heatmap
  useEffect(() => {
    async function loadData() {
      try {
        const entries = await loadAllEntries();

        // Transform DailyEntry[] → HeatmapDayData[]
        const data: HeatmapDayData[] = entries.map((entry) => ({
          date: entry.date,
          periodFlag: entry.periodFlag,
          flowIntensity: entry.flowIntensity,
          symptomCount: entry.symptoms.length,
          mood: entry.mood,
        }));

        setHeatmapData(data);
      } catch (err) {
        console.error("Failed to load entries for heatmap:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load full entry detail when a day is clicked
  const handleDayClick = async (date: string) => {
    setSelectedDate(date);
    try {
      const entry = await loadEntryByDate(date);
      setSelectedEntry(entry ?? null);
    } catch (err) {
      console.error("Failed to load day detail:", err);
      setSelectedEntry(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex justify-center">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-paper">Cycle history</h1>
        <div className="flex gap-1 bg-ash rounded-md p-0.5">
          <button className="px-3 py-1 text-xs font-medium text-fog hover:text-paper rounded-md transition-colors">
            Heatmap
          </button>
          <button className="px-3 py-1 text-xs font-medium text-paper bg-signal/20 rounded-md">
            Calendar
          </button>
        </div>
      </div>

      {heatmapData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-fog text-sm">
            No entries yet. Start logging daily to see your cycle patterns here.
          </p>
        </div>
      ) : (
        <CalendarView
          data={heatmapData}
          onDayClick={handleDayClick}
        />
      )}

      {/* Day detail slide-up */}
      <DayDetail
        isOpen={selectedDate !== null}
        onClose={handleCloseDetail}
        date={selectedDate || ""}
        entry={selectedEntry}
      />
    </div>
  );
}
