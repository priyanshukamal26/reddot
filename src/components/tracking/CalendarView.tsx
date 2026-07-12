"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DayData {
  date: string; // YYYY-MM-DD
  periodFlag: boolean;
  flowIntensity?: "spotting" | "light" | "medium" | "heavy";
  symptomCount: number;
  mood?: number;
}

interface CalendarViewProps {
  data: DayData[];
  onDayClick?: (date: string) => void;
}

const INTENSITY_COLORS = {
  none: "transparent",
  low: "#4A3536", // phase-fade
  medium: "#8C0A1C", // signal-deep
  high: "#E0102A", // signal
};

function getIntensityColor(day: DayData | undefined): string {
  if (!day) return INTENSITY_COLORS.none;

  if (day.periodFlag) {
    switch (day.flowIntensity) {
      case "heavy":
        return INTENSITY_COLORS.high;
      case "medium":
        return INTENSITY_COLORS.medium;
      case "light":
      case "spotting":
        return INTENSITY_COLORS.low;
      default:
        return INTENSITY_COLORS.medium;
    }
  }

  if (day.symptomCount >= 3) return INTENSITY_COLORS.medium;
  if (day.symptomCount >= 1) return INTENSITY_COLORS.low;

  return INTENSITY_COLORS.none;
}

export default function CalendarView({ data, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const dataMap = useMemo(() => {
    return new Map(data.map((d) => [d.date, d]));
  }, [data]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Generate calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
  const todayStr = new Date().toISOString().split("T")[0];

  const grid: (number | null)[] = Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(d);
  }
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-lg font-bold text-paper font-sans tracking-tight">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded bg-ash/60 hover:bg-ash transition-colors text-fog hover:text-paper"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded bg-ash/60 hover:bg-ash transition-colors text-fog hover:text-paper"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-fog/60 pb-2">
            {label}
          </div>
        ))}

        {grid.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const dayData = dataMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = new Date(dateStr) > new Date(todayStr);

          const bgColor = getIntensityColor(dayData);
          const hasData = bgColor !== "transparent";

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr)}
              disabled={isFuture && !dayData}
              className={`aspect-square relative rounded-md flex flex-col items-center justify-center transition-all ${
                isToday ? "border border-signal/50 ring-1 ring-signal/20" : "border border-white/5"
              } ${isFuture && !dayData ? "opacity-30 cursor-default" : "hover:scale-105 hover:border-signal/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"}`}
              style={{ backgroundColor: hasData ? bgColor : "rgba(255,255,255,0.02)" }}
            >
              <span className={`text-sm font-mono ${hasData ? "text-white font-bold" : "text-fog"}`}>
                {dayNum}
              </span>
              {dayData?.periodFlag && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-mono text-fog border-t border-white/5 pt-4">
        <span className="font-semibold text-white">Flow Intensity:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.low }} />
          <span>Light</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.medium }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLORS.high }} />
          <span>Heavy</span>
        </div>
      </div>
    </div>
  );
}
