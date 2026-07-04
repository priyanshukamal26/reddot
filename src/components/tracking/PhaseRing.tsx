"use client";

import { useRef, useEffect } from "react";
import type { CyclePhase } from "@/lib/types";

// ──────────────────────────────────────────────
// Phase Ring — the signature visual device
//
// Source of truth: 07_DESIGN_SYSTEM.md, 02_FEATURE_SPEC.md (C5)
//
// A continuous gradient-ramp ring (not four flat pie-slices):
//   Menstrual (phase-signal #E0102A) → Follicular (phase-rise #D9C9C7) →
//   Ovulation (phase-peak #FAFAFA, with signal outline) → Luteal (phase-fade #4A3536) →
//   back to Menstrual
//
// Current position shown with a sharp marker, not a soft dot.
// Phase also identifiable via text label, not color alone (accessibility).
// ──────────────────────────────────────────────

interface PhaseRingProps {
  currentPhase: CyclePhase;
  dayWithinPhase: number;
  cycleDay: number;
  totalCycleDays?: number; // for positioning the marker
  size?: number; // px
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

const PHASE_COLORS = {
  menstrual: "#E0102A",
  follicular: "#D9C9C7",
  ovulation: "#FAFAFA",
  luteal: "#4A3536",
};

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

// Default phase durations as fractions of a cycle
const DEFAULT_PHASE_FRACTIONS: Record<CyclePhase, number> = {
  menstrual: 0.18, // ~5 days of 28
  follicular: 0.32, // ~9 days
  ovulation: 0.07, // ~2 days
  luteal: 0.43, // ~12 days
};

export default function PhaseRing({
  currentPhase,
  dayWithinPhase,
  cycleDay,
  totalCycleDays = 28,
  size = 200,
  strokeWidth = 12,
  className = "",
  showLabel = true,
}: PhaseRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw gradient ring — sweep through phases as a continuous arc
    const phases: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];
    const totalSegments = 360;
    const segmentAngle = (2 * Math.PI) / totalSegments;

    let cumulativeFraction = 0;
    const phaseStarts: number[] = [];
    for (const phase of phases) {
      phaseStarts.push(cumulativeFraction);
      cumulativeFraction += DEFAULT_PHASE_FRACTIONS[phase];
    }

    for (let i = 0; i < totalSegments; i++) {
      const fraction = i / totalSegments;
      const angle = -Math.PI / 2 + i * segmentAngle; // Start from top

      // Determine which phase this segment belongs to and blend color
      let phaseIndex = 0;
      for (let p = phases.length - 1; p >= 0; p--) {
        if (fraction >= phaseStarts[p]) {
          phaseIndex = p;
          break;
        }
      }

      const currentPhaseName = phases[phaseIndex];
      const nextPhaseName = phases[(phaseIndex + 1) % phases.length];
      const phaseStart = phaseStarts[phaseIndex];
      const phaseEnd =
        phaseIndex < phases.length - 1 ? phaseStarts[phaseIndex + 1] : 1;
      const phaseProgress = (fraction - phaseStart) / (phaseEnd - phaseStart);

      // Interpolate color between current and next phase
      const color = interpolateColor(
        PHASE_COLORS[currentPhaseName],
        PHASE_COLORS[nextPhaseName],
        phaseProgress
      );

      ctx.beginPath();
      ctx.arc(center, center, radius, angle, angle + segmentAngle + 0.01); // slight overlap to prevent gaps
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "butt";
      ctx.stroke();
    }

    // Draw current position marker — sharp tick, not a dot
    const markerFraction = Math.min(cycleDay / totalCycleDays, 1);
    const markerAngle = -Math.PI / 2 + markerFraction * 2 * Math.PI;
    const markerInnerRadius = radius - strokeWidth / 2 - 4;
    const markerOuterRadius = radius + strokeWidth / 2 + 4;

    ctx.beginPath();
    ctx.moveTo(
      center + markerInnerRadius * Math.cos(markerAngle),
      center + markerInnerRadius * Math.sin(markerAngle)
    );
    ctx.lineTo(
      center + markerOuterRadius * Math.cos(markerAngle),
      center + markerOuterRadius * Math.sin(markerAngle)
    );
    ctx.strokeStyle = "#FAFAFA";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    // Small filled circle at the tip
    ctx.beginPath();
    ctx.arc(
      center + markerOuterRadius * Math.cos(markerAngle),
      center + markerOuterRadius * Math.sin(markerAngle),
      4,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#FAFAFA";
    ctx.fill();
  }, [currentPhase, cycleDay, totalCycleDays, size, strokeWidth, radius, center]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        aria-label={`Cycle phase ring: ${PHASE_LABELS[currentPhase]}, day ${dayWithinPhase}`}
        role="img"
      />

      {/* Center text — phase + day count */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold text-paper font-mono">
          {cycleDay}
        </span>
        <span className="text-xs text-fog uppercase tracking-widest mt-1">
          Day
        </span>
      </div>

      {/* Text label below ring — accessibility: phase never communicated by color alone */}
      {showLabel && (
        <div className="mt-3 text-center">
          <span
            className="text-sm font-medium"
            style={{ color: PHASE_COLORS[currentPhase] }}
          >
            {PHASE_LABELS[currentPhase]}
          </span>
          <span className="text-xs text-fog ml-2">
            Day {dayWithinPhase}
          </span>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Color interpolation helper
// ──────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function interpolateColor(color1: string, color2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}
