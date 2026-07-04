"use client";

import { useMemo } from "react";

// ──────────────────────────────────────────────
// Cycle Heatmap — the creative cycle-history view
//
// Source: 02_FEATURE_SPEC.md (C4), 06_PAGES_AND_FLOWS.md
//
// GitHub-contribution-style heatmap where:
// - Each cell = one day
// - Color intensity (monochrome red ramp from 07_DESIGN_SYSTEM.md)
//   shows flow intensity / symptom load
// - Layout spans months in rows
// - Tapping any cell opens day detail
//
// This is the MVP-safe alternative to the radial/spiral view (stretch).
// ──────────────────────────────────────────────

interface DayData {
  date: string; // YYYY-MM-DD
  periodFlag: boolean;
  flowIntensity?: "spotting" | "light" | "medium" | "heavy";
  symptomCount: number;
  mood?: number;
}

interface CycleHeatmapProps {
  data: DayData[];
  months?: number; // How many months to show
  onDayClick?: (date: string) => void;
}

// Monochrome red ramp from design system
const INTENSITY_COLORS = {
  none: "#1C1C1C", // ash — no data
  low: "#4A3536", // phase-fade — light activity
  medium: "#8C0A1C", // signal-deep — moderate
  high: "#E0102A", // signal — peak (period)
  empty: "#0A0A0A", // void — future dates
};

function getIntensityColor(day: DayData | undefined): string {
  if (!day) return INTENSITY_COLORS.empty;

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

function getIntensityLabel(day: DayData | undefined): string {
  if (!day) return "No data";
  if (day.periodFlag) return `Period (${day.flowIntensity || "logged"})`;
  if (day.symptomCount > 0) return `${day.symptomCount} symptom${day.symptomCount > 1 ? "s" : ""}`;
  return "Logged";
}

export default function CycleHeatmap({
  data,
  months = 6,
  onDayClick,
}: CycleHeatmapProps) {
  // Build month grid
  const grid = useMemo(() => {
    const today = new Date();
    const dataMap = new Map(data.map((d) => [d.date, d]));
    const monthGrids: { label: string; weeks: (DayData | null | undefined)[][] }[] = [];

    for (let m = months - 1; m >= 0; m--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: monthDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });

      const daysInMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      ).getDate();

      // Build weeks (7-column grid)
      const firstDayOfWeek = monthDate.getDay();
      const weeks: (DayData | null | undefined)[][] = [];
      let currentWeek: (DayData | null | undefined)[] = new Array(firstDayOfWeek).fill(null);

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayDate = new Date(dateStr);
        const isFuture = dayDate > today;

        if (isFuture) {
          currentWeek.push(undefined);
        } else {
          currentWeek.push(dataMap.get(dateStr) || { date: dateStr, periodFlag: false, symptomCount: 0 });
        }

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
      }

      monthGrids.push({ label: monthLabel, weeks });
    }

    return monthGrids;
  }, [data, months]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-6">
      {/* ── Legend ── */}
      <div className="flex items-center gap-4 text-xs text-fog">
        <span>Less</span>
        <div className="flex gap-1">
          {Object.values(INTENSITY_COLORS)
            .filter((c) => c !== INTENSITY_COLORS.empty)
            .map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>
        <span>More</span>
      </div>

      {/* ── Month grids ── */}
      {grid.map((month, monthIdx) => (
        <div key={monthIdx}>
          <h3 className="text-xs font-medium text-fog mb-2">{month.label}</h3>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="text-[9px] text-fog/50 text-center">
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="space-y-1">
            {month.weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => {
                  if (day === null) {
                    return <div key={dayIdx} className="w-full aspect-square" />;
                  }
                  const color = getIntensityColor(day);
                  const label = day ? getIntensityLabel(day) : "Future";
                  const dateStr = day?.date;

                  return (
                    <button
                      key={dayIdx}
                      onClick={() => dateStr && onDayClick?.(dateStr)}
                      disabled={!day}
                      className="w-full aspect-square rounded-sm transition-transform hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:cursor-default"
                      style={{ backgroundColor: color }}
                      aria-label={dateStr ? `${dateStr}: ${label}` : "Future"}
                      title={dateStr ? `${dateStr}: ${label}` : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
