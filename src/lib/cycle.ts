/**
 * RedDot — Cycle Phase Calculation
 *
 * Source of truth: docs/02_FEATURE_SPEC.md (C2), docs/04_DATA_MODEL.md
 *
 * Handles:
 * - Phase calculation (menstrual → follicular → ovulation → luteal)
 * - Irregular cycle detection (C2's range-based prediction)
 * - Next period prediction (with confidence)
 */

import type { Cycle, CurrentPhase, CyclePhase, PredictionConfidence, DailyEntry } from "./types";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

// Default phase durations in days (used when no logged data exists)
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_MENSTRUAL_DAYS = 5;
const DEFAULT_FOLLICULAR_DAYS = 9;
const DEFAULT_OVULATION_DAYS = 2;
// Luteal fills the remainder

// Irregularity threshold: if std dev of cycle lengths exceeds this,
// switch to range-based prediction (C2 requirement)
const IRREGULARITY_THRESHOLD_DAYS = 5;

// ──────────────────────────────────────────────
// Cycle length statistics
// ──────────────────────────────────────────────

export interface CycleStats {
  averageLength: number;
  stdDev: number;
  minLength: number;
  maxLength: number;
  confidence: PredictionConfidence;
  cycleLengths: number[];
}

/**
 * Calculate cycle statistics from logged cycles.
 * Returns average, standard deviation, and whether the pattern is regular/irregular.
 */
export function calculateCycleStats(cycles: Cycle[]): CycleStats | null {
  if (cycles.length < 2) return null;

  // Sort by start date
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Calculate lengths between consecutive cycle starts
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].startDate).getTime();
    const curr = new Date(sorted[i].startDate).getTime();
    const days = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (days > 0 && days < 90) {
      // Sanity check: ignore gaps > 90 days
      lengths.push(days);
    }
  }

  if (lengths.length === 0) return null;

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  return {
    averageLength: Math.round(avg),
    stdDev: Math.round(stdDev * 10) / 10,
    minLength: Math.min(...lengths),
    maxLength: Math.max(...lengths),
    confidence: stdDev > IRREGULARITY_THRESHOLD_DAYS ? "irregular" : "regular",
    cycleLengths: lengths,
  };
}

// ──────────────────────────────────────────────
// Current phase calculation
// ──────────────────────────────────────────────

/**
 * Calculate the current cycle phase based on the most recent cycle start
 * and the user's average cycle stats.
 */
export function getCurrentPhase(
  lastCycleStart: string,
  stats: CycleStats | null,
  today: Date = new Date()
): CurrentPhase {
  const cycleLength = stats?.averageLength ?? DEFAULT_CYCLE_LENGTH;
  const confidence: PredictionConfidence = stats?.confidence ?? "regular";

  const y1 = today.getFullYear();
  const m1 = today.getMonth();
  const d1 = today.getDate();
  const todayLocalMidnight = new Date(y1, m1, d1).getTime();

  const [y2, m2, d2] = lastCycleStart.split("-").map(Number);
  const startLocalMidnight = new Date(y2, m2 - 1, d2).getTime();

  const daysSinceStart = Math.round(
    (todayLocalMidnight - startLocalMidnight) / (1000 * 60 * 60 * 24)
  );
  
  // If for some reason the start date is in the future, fallback to day 1
  const cycleDay = daysSinceStart >= 0 ? (daysSinceStart % cycleLength) + 1 : 1;

  // Phase boundaries scaled to cycle length
  const menstrualEnd = DEFAULT_MENSTRUAL_DAYS;
  const follicularEnd = menstrualEnd + Math.round(
    (DEFAULT_FOLLICULAR_DAYS / DEFAULT_CYCLE_LENGTH) * cycleLength
  );
  const ovulationEnd = follicularEnd + DEFAULT_OVULATION_DAYS;
  // Luteal fills the rest

  let phase: CyclePhase;
  let dayWithinPhase: number;

  if (cycleDay <= menstrualEnd) {
    phase = "menstrual";
    dayWithinPhase = cycleDay;
  } else if (cycleDay <= follicularEnd) {
    phase = "follicular";
    dayWithinPhase = cycleDay - menstrualEnd;
  } else if (cycleDay <= ovulationEnd) {
    phase = "ovulation";
    dayWithinPhase = cycleDay - follicularEnd;
  } else {
    phase = "luteal";
    dayWithinPhase = cycleDay - ovulationEnd;
  }

  return { phase, dayWithinPhase, cycleDay, confidence };
}

// ──────────────────────────────────────────────
// Next period prediction
// ──────────────────────────────────────────────

export interface PeriodPrediction {
  /** Predicted start date (or center of range for irregular) */
  expectedDate: Date;
  /** For irregular cycles: earliest possible date */
  rangeStart?: Date;
  /** For irregular cycles: latest possible date */
  rangeEnd?: Date;
  /** Whether this is a confident prediction or a range */
  confidence: PredictionConfidence;
}

/**
 * Predict the next period start date.
 *
 * Per C2: if cycle is irregular, produce a range-based prediction
 * rather than a falsely-precise single date.
 */
export function predictNextPeriod(
  lastCycleStart: string,
  stats: CycleStats | null
): PeriodPrediction {
  const cycleLength = stats?.averageLength ?? DEFAULT_CYCLE_LENGTH;
  const confidence: PredictionConfidence = stats?.confidence ?? "regular";
  const start = new Date(lastCycleStart);

  const expectedDate = new Date(start);
  expectedDate.setDate(expectedDate.getDate() + cycleLength);

  if (confidence === "irregular" && stats) {
    const rangeStart = new Date(start);
    rangeStart.setDate(rangeStart.getDate() + stats.minLength);

    const rangeEnd = new Date(start);
    rangeEnd.setDate(rangeEnd.getDate() + stats.maxLength);

    return { expectedDate, rangeStart, rangeEnd, confidence };
  }

  return { expectedDate, confidence };
}

// ──────────────────────────────────────────────
// Formatting helpers
// ──────────────────────────────────────────────

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  return Math.ceil(
    (target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calculate consecutive daily logging streak.
 */
export function calculateLoggingStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;

  // Get unique sorted dates in descending order (most recent first)
  const uniqueDates = Array.from(new Set(entries.map((e) => e.date)))
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = uniqueDates[0];
  mostRecent.setHours(0, 0, 0, 0);

  // If the most recent log is older than yesterday, the streak is broken (0)
  if (mostRecent < yesterday) {
    return 0;
  }

  let streak = 1;
  let currentExpected = new Date(mostRecent);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    const expectedPrev = new Date(currentExpected);
    expectedPrev.setDate(expectedPrev.getDate() - 1);

    if (prevDate.getTime() === expectedPrev.getTime()) {
      streak++;
      currentExpected = prevDate;
    } else if (prevDate > expectedPrev) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}
