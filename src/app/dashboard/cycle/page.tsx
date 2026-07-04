"use client";

import { useState } from "react";
import CycleHeatmap from "@/components/tracking/CycleHeatmap";
import DayDetail from "@/components/tracking/DayDetail";

// ──────────────────────────────────────────────
// Cycle Tracker View (#12 from 06_PAGES_AND_FLOWS.md)
//
// Houses the creative heatmap view (MVP) with day detail panel.
// Standard month-grid calendar can exist as secondary toggle view
// but isn't the default per spec.
// ──────────────────────────────────────────────

// Demo data — will be replaced by real data from IndexedDB
const DEMO_DATA = generateDemoData();

function generateDemoData() {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 180; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate cycle: period every ~28 days, 5 days long
    const dayInCycle = i % 28;
    const isPeriod = dayInCycle < 5;
    const flowIntensities = ["heavy", "heavy", "medium", "light", "spotting"] as const;

    data.push({
      date: dateStr,
      periodFlag: isPeriod,
      flowIntensity: isPeriod ? flowIntensities[dayInCycle] : undefined,
      symptomCount: isPeriod ? Math.floor(Math.random() * 4) + 1 : Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0,
      mood: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}

export default function CycleViewPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-paper">Cycle history</h1>
        <div className="flex gap-1 bg-ash rounded-md p-0.5">
          <button className="px-3 py-1 text-xs font-medium text-paper bg-signal/20 rounded-md">
            Heatmap
          </button>
          <button className="px-3 py-1 text-xs font-medium text-fog hover:text-paper rounded-md transition-colors">
            Calendar
          </button>
        </div>
      </div>

      <CycleHeatmap
        data={DEMO_DATA}
        months={6}
        onDayClick={(date) => setSelectedDate(date)}
      />

      {/* Day detail slide-up */}
      <DayDetail
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        date={selectedDate || ""}
        entry={null} // TODO: load real entry from IndexedDB
      />
    </div>
  );
}
