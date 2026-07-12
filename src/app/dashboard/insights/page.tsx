"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Smile, Bed, Dumbbell, CalendarRange, HeartPulse, Heart, Activity, AlertTriangle, MoreHorizontal } from "lucide-react";
import { loadAllEntries, loadAllCycles } from "@/lib/data";
import { calculateCycleStats, getCurrentPhase } from "@/lib/cycle";
import type { DailyEntry, Cycle } from "@/lib/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface ChartPoint {
  date: string;
  formattedDate: string;
  mood: number | null;
  sleep: number | null;
  energy: number | null;
}

interface SymptomFrequency {
  symptom: string;
  count: number;
}

// ──────────────────────────────────────────────
// Helper: Fallback empty radar data if no logs
// ──────────────────────────────────────────────
const emptyRadarData = [
  { name: "Mood", value: 0, fullMark: 5, desc: "Average mood." },
  { name: "Energy", value: 0, fullMark: 5, desc: "Average energy." },
  { name: "Sleep", value: 0, fullMark: 5, desc: "Average sleep quality." },
  { name: "Appetite", value: 0, fullMark: 5, desc: "Average appetite." },
  { name: "Exercise", value: 0, fullMark: 5, desc: "Average exercise levels." }
];

export default function InsightsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [symptomData, setSymptomData] = useState<SymptomFrequency[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>(emptyRadarData);
  const [stats, setStats] = useState({
    avgMood: 0,
    avgSleep: 0,
    totalLogs: 0,
  });
  const [insights, setInsights] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  
  // Live Metrics State
  const [currentCycleDay, setCurrentCycleDay] = useState<number>(1);
  const [currentPhaseStr, setCurrentPhaseStr] = useState<string>("Menstrual");
  const [cycleLength, setCycleLength] = useState<number>(28);

  // Client-side mount check to prevent Recharts hydration issues in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadStats() {
      try {
        const entries = await loadAllEntries();

        // Sort entries by date ascending
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // 1. Transform for mood/sleep/energy trends
        const trends: ChartPoint[] = sortedEntries.map((e) => ({
          date: e.date,
          formattedDate: new Date(e.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mood: e.mood || null,
          sleep: e.sleep || null,
          energy: e.energy || null,
        }));

        setChartData(trends.slice(-15)); // Show last 15 logged days

        // 2. Energy Levels Bar Chart Data (Last 7 Calendar Days)
        const last7CalendarDays = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
          
          const entry = sortedEntries.find(e => e.date === dateStr);
          const hasData = !!(entry && entry.energy !== undefined);
          last7CalendarDays.push({
            displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // e.g. "Jul 10"
            fullDate: dateStr,
            energy: hasData ? entry.energy : 5, // fill height for empty bar
            actualEnergy: hasData ? entry.energy : 0,
            hasData
          });
        }
        setEnergyData(last7CalendarDays);

        // 3. Radar Chart (Recent Wellness Balance)
        const last7 = sortedEntries.slice(-7);
        let m=0, mc=0, e=0, ec=0, s=0, sc=0, a=0, ac=0, x=0, xc=0;
        last7.forEach(entry => {
          if (entry.mood) { m+=entry.mood; mc++; }
          if (entry.energy) { e+=entry.energy; ec++; }
          if (entry.sleep) { s+=entry.sleep; sc++; }
          if (entry.appetite) { a+=entry.appetite; ac++; }
          if (entry.exercise) { x+=entry.exercise; xc++; }
        });

        if (last7.length > 0) {
          setRadarData([
            { name: "Mood", value: mc ? Number((m/mc).toFixed(1)) : 0, fullMark: 5, desc: "Average mood over your last 7 logs." },
            { name: "Energy", value: ec ? Number((e/ec).toFixed(1)) : 0, fullMark: 5, desc: "Average energy over your last 7 logs." },
            { name: "Sleep", value: sc ? Number((s/sc).toFixed(1)) : 0, fullMark: 5, desc: "Average sleep quality over your last 7 logs." },
            { name: "Appetite", value: ac ? Number((a/ac).toFixed(1)) : 0, fullMark: 5, desc: "Average appetite over your last 7 logs." },
            { name: "Exercise", value: xc ? Number((x/xc).toFixed(1)) : 0, fullMark: 5, desc: "Average exercise levels over your last 7 logs." }
          ]);
        }

        // 4. Symptom Frequency Calculation
        const counts: Record<string, number> = {};
        let moodSum = 0;
        let moodCount = 0;
        let sleepSum = 0;
        let sleepCount = 0;

        sortedEntries.forEach((e) => {
          if (e.mood !== undefined) {
            moodSum += e.mood;
            moodCount++;
          }
          if (e.sleep !== undefined) {
            sleepSum += e.sleep;
            sleepCount++;
          }
          if (e.symptoms) {
            e.symptoms.forEach((s) => {
              counts[s] = (counts[s] || 0) + 1;
            });
          }
        });

        const formattedSymptoms = Object.entries(counts)
          .map(([symptom, count]) => ({ symptom, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setSymptomData(formattedSymptoms);
        const avgS = sleepCount > 0 ? parseFloat((sleepSum / sleepCount).toFixed(1)) : 0;
        setStats({
          avgMood: moodCount > 0 ? parseFloat((moodSum / moodCount).toFixed(1)) : 0,
          avgSleep: avgS,
          totalLogs: entries.length,
        });

        // 4. Phase correlations and Care prompts
        const cycles = await loadAllCycles();
        const hasData = cycles.length >= 2;
        setHasEnoughData(hasData);

        if (cycles.length > 0) {
          const cStats = calculateCycleStats(cycles);
          setCycleLength(cStats?.averageLength || 28);
          
          const sortedCyclesDesc = [...cycles].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const currentCycle = sortedCyclesDesc[0];
          
          const phaseData = getCurrentPhase(currentCycle.startDate, cStats, new Date());
          setCurrentCycleDay(phaseData.cycleDay);
          const pStr = phaseData.phase;
          setCurrentPhaseStr(pStr.charAt(0).toUpperCase() + pStr.slice(1));
        }

        if (hasData) {
          const cStats = calculateCycleStats(cycles);
          const detectedInsights: string[] = [];
          const detectedFlags: string[] = [];

          // Sort cycles ascending
          const sortedCycles = [...cycles].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

          const phaseEntries: Record<string, DailyEntry[]> = {
            menstrual: [],
            follicular: [],
            ovulation: [],
            luteal: [],
          };

          sortedEntries.forEach((entry) => {
            const entryDate = new Date(entry.date);
            const cycle = sortedCycles.find((c, idx) => {
              const start = new Date(c.startDate);
              const nextStart = sortedCycles[idx + 1] ? new Date(sortedCycles[idx + 1].startDate) : null;
              return entryDate >= start && (!nextStart || entryDate < nextStart);
            });

            if (cycle) {
              const currentPhase = getCurrentPhase(cycle.startDate, cStats, entryDate);
              if (phaseEntries[currentPhase.phase]) {
                phaseEntries[currentPhase.phase].push(entry);
              }
            }
          });

          // Energy & Mood calculations
          let overallMoodSum = 0;
          let overallMoodCount = 0;
          let overallEnergySum = 0;
          let overallEnergyCount = 0;

          const phaseStats: Record<string, { moodSum: number; moodCount: number; energySum: number; energyCount: number }> = {
            menstrual: { moodSum: 0, moodCount: 0, energySum: 0, energyCount: 0 },
            follicular: { moodSum: 0, moodCount: 0, energySum: 0, energyCount: 0 },
            ovulation: { moodSum: 0, moodCount: 0, energySum: 0, energyCount: 0 },
            luteal: { moodSum: 0, moodCount: 0, energySum: 0, energyCount: 0 },
          };

          Object.entries(phaseEntries).forEach(([phaseName, entriesList]) => {
            entriesList.forEach((e) => {
              if (e.mood !== undefined) {
                overallMoodSum += e.mood;
                overallMoodCount++;
                phaseStats[phaseName].moodSum += e.mood;
                phaseStats[phaseName].moodCount++;
              }
              if (e.energy !== undefined) {
                overallEnergySum += e.energy;
                overallEnergyCount++;
                phaseStats[phaseName].energySum += e.energy;
                phaseStats[phaseName].energyCount++;
              }
            });
          });

          const avgOverallMood = overallMoodCount > 0 ? overallMoodSum / overallMoodCount : 0;
          const avgOverallEnergy = overallEnergyCount > 0 ? overallEnergySum / overallEnergyCount : 0;

          Object.entries(phaseStats).forEach(([phaseName, statsVal]) => {
            const phaseAvgMood = statsVal.moodCount > 0 ? statsVal.moodSum / statsVal.moodCount : 0;
            const phaseAvgEnergy = statsVal.energyCount > 0 ? statsVal.energySum / statsVal.energyCount : 0;

            if (statsVal.moodCount >= 2 && avgOverallMood > 0) {
              const diff = avgOverallMood - phaseAvgMood;
              if (diff >= 0.4) {
                detectedInsights.push(
                  `Your mood ratings tend to drop during your ${phaseName} phase (averaging ${phaseAvgMood.toFixed(1)}/5 compared to your overall average of ${avgOverallMood.toFixed(1)}/5).`
                );
              }
            }

            if (statsVal.energyCount >= 2 && avgOverallEnergy > 0) {
              const diff = avgOverallEnergy - phaseAvgEnergy;
              if (diff >= 0.4) {
                detectedInsights.push(
                  `You report lower energy levels during your ${phaseName} phase (averaging ${phaseAvgEnergy.toFixed(1)}/5 vs your cycle-wide average of ${avgOverallEnergy.toFixed(1)}/5).`
                );
              }
            }
          });

          // Check consecutive symptom flags
          let heavyBleedingCount = 0;
          let crampsCount = 0;

          const recentCycles = sortedCycles.slice(-3);
          recentCycles.forEach((cycle) => {
            const start = new Date(cycle.startDate);
            const cycleEnd = new Date(start);
            cycleEnd.setDate(cycleEnd.getDate() + (cStats?.averageLength || 28));

            const cycleEntries = sortedEntries.filter((e) => {
              const d = new Date(e.date);
              return d >= start && d <= cycleEnd;
            });

            const hasHeavy = cycleEntries.some((e) => e.flowIntensity === "heavy");
            if (hasHeavy) heavyBleedingCount++;

            const hasCramps = cycleEntries.some((e) => e.symptoms?.includes("cramps"));
            if (hasCramps) crampsCount++;
          });

          if (recentCycles.length >= 3) {
            if (heavyBleedingCount >= 3) {
              detectedFlags.push(
                "You have logged heavy flow for 3 consecutive cycles. Consider discussing this with your healthcare provider at your next visit."
              );
            }
            if (crampsCount >= 3) {
              detectedFlags.push(
                "Cramps have been logged for 3 consecutive cycles. If this pattern is causing notable discomfort, it may be helpful to consult a doctor."
              );
            }
          }

          if (detectedInsights.length === 0) {
            detectedInsights.push(
              "Your logs show stable wellness factors across all phases. Keep tracking daily to refine pattern detection."
            );
          }

          setInsights(detectedInsights);
          setFlags(detectedFlags);
        }
      } catch (err) {
        console.error("Failed to load insights data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [mounted]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center space-grid">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ash border border-fog/10 p-3 rounded-md shadow-lg font-mono text-[10px] space-y-1 text-paper z-50">
          <p className="font-semibold text-xs border-b border-fog/5 pb-1 mb-1">{label}</p>
          {payload.map((p: any) => {
            if (p.payload.hasData === false) {
               return <p key={p.name} className="text-fog/50 font-sans tracking-wide">No log for this day</p>
            }
            const val = p.payload.actualEnergy !== undefined ? p.payload.actualEnergy : p.value;
            return (
              <p key={p.name} style={{ color: p.color }}>
                {p.name.toUpperCase()}: {val}{val <= 5 && !p.name.includes("Hormone") && p.name !== "Metrics" ? "/5" : ""}
              </p>
            );
          })}
          {payload[0].payload.desc && (
            <p className="text-gray-400 mt-2 max-w-[150px] leading-relaxed break-words">{payload[0].payload.desc}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const sleepPercentage = Math.round((stats.avgSleep / 5) * 100);
  const sleepLabel = sleepPercentage >= 80 ? "Good" : sleepPercentage >= 60 ? "Average" : "Below Average";

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* ── Background Glows ── */}
      <div className="absolute top-[30%] left-[-15%] w-[400px] h-[400px] rounded-full bg-signal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-signal-deep/5 blur-[140px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded bg-ash/60 border border-white/5 text-fog hover:text-paper transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-paper font-sans">Cycle & wellness insights</h1>
            <p className="text-xs text-fog font-mono uppercase tracking-wider">
              Pattern correlations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ───────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: LIVE HEALTH METRICS                          */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel border-white/5 bg-[rgba(20,20,22,0.6)] rounded-xl p-5 shadow-lg border">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase">Live Health Metrics</h2>
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </div>

              {/* Current Phase Tracker */}
              <div className="space-y-2 mb-8 group cursor-help relative">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-200">Current Phase: {currentPhaseStr}</span>
                  <span className="text-gray-400 font-mono">Day {currentCycleDay}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e51d38] to-[#ff4d6d] shadow-[0_0_10px_#e51d38] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (currentCycleDay / cycleLength) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Recent Wellness Balance Radar Chart */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-gray-200">Wellness Balance</span>
                  <span className="text-[#e51d38] font-mono opacity-80">Last 7d</span>
                </div>
                <div className="h-[200px] w-full flex justify-center items-center relative group">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.15)" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name="Metrics"
                        dataKey="value"
                        stroke="#e51d38"
                        strokeWidth={2}
                        fill="#e51d38"
                        fillOpacity={0.2}
                        dot={{ r: 3, fill: "#e51d38" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Energy Levels Bar Chart */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-200">Energy Levels</span>
                  <span className="text-[#e51d38] font-mono opacity-80">Last 7d</span>
                </div>
                {energyData.length === 0 ? (
                  <div className="h-20 text-[10px] text-gray-500 flex items-center justify-center font-mono">No recent energy logs</div>
                ) : (
                  <div className="h-32 w-full border border-white/5 rounded-lg p-3 bg-white/[0.02]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={energyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <pattern id="hashedPattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                          </pattern>
                        </defs>
                        <YAxis domain={[0, 5]} hide />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                          dy={5}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                          content={<CustomTooltip />} 
                        />
                        <Bar 
                          dataKey="energy" 
                          radius={[4, 4, 4, 4]} 
                          barSize={14}
                        >
                          {
                            energyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.hasData ? '#e51d38' : 'url(#hashedPattern)'} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          </div>


          {/* ───────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: EXISTING INSIGHTS                           */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ── Metrics Grid ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-fog text-xs font-medium">
                  <Smile className="w-4 h-4 text-signal" />
                  <span>Avg Mood</span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-paper font-mono">
                  {stats.avgMood > 0 ? `${stats.avgMood}/5` : "N/A"}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-fog text-xs font-medium">
                  <Bed className="w-4 h-4 text-signal" />
                  <span>Avg Sleep</span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-paper font-mono">
                  {stats.avgSleep > 0 ? `${stats.avgSleep}/5` : "N/A"}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-fog text-xs font-medium">
                  <CalendarRange className="w-4 h-4 text-signal" />
                  <span>Total Logs</span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-paper font-mono">
                  {stats.totalLogs} days
                </div>
              </div>
            </div>

            {/* ── Chart 1: Mood, Sleep & Energy Trends ── */}
            <div className="glass-panel rounded-xl p-5 space-y-4 shadow-lg border border-white/5">
              <div className="flex items-center justify-between pb-2 border-b border-fog/5">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-signal" />
                  <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
                    Wellness Factors Timeline
                  </h2>
                </div>
                <span className="text-[10px] text-fog/40 font-mono">LAST 15 ENTRIES</span>
              </div>

              {chartData.length === 0 ? (
                <p className="text-xs text-fog/50 text-center py-10 font-mono">
                  No trend data available. Start logging to generate timelines.
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={9}
                        tickLine={false}
                        fontFamily="monospace"
                      />
                      <YAxis
                        domain={[1, 5]}
                        tickCount={5}
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={9}
                        tickLine={false}
                        fontFamily="monospace"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: "10px", marginTop: "10px", fontFamily: "monospace" }}
                      />
                      <Line
                        name="Mood"
                        type="monotone"
                        dataKey="mood"
                        stroke="#e51d38"
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 0, fill: "#e51d38" }}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                      <Line
                        name="Sleep"
                        type="monotone"
                        dataKey="sleep"
                        stroke="#808080"
                        strokeWidth={1.5}
                        dot={{ r: 1.5, strokeWidth: 0, fill: "#808080" }}
                        activeDot={{ r: 3 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* ── Section 3: Phase Correlations & Care Prompts ── */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-signal" />
                <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
                  Wellness Patterns & Care Prompts
                </h2>
              </div>

              {!hasEnoughData ? (
                <div className="glass-panel p-5 rounded-xl text-center text-xs text-fog/60 leading-relaxed font-mono">
                  Not enough cycle history yet to detect correlations. Keep tracking daily to automatically surface patterns across cycles (requires 2+ cycles).
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Care Flags */}
                  {flags.map((flag, idx) => (
                    <div key={idx} className="glass-panel rounded-xl p-4 flex gap-3 border-l-2 border-error bg-error/5 shadow-md">
                      <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-paper uppercase font-mono tracking-wider text-[10px] text-error">Care Prompt</h4>
                        <p className="text-[11px] text-fog leading-relaxed">{flag}</p>
                      </div>
                    </div>
                  ))}

                  {/* Correlations */}
                  {insights.map((insight, idx) => (
                    <div key={idx} className="glass-panel rounded-xl p-4 flex gap-3 border-l-2 border-signal shadow-md">
                      <Heart className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-paper uppercase font-mono tracking-wider text-[10px] text-signal">Phase Correlation</h4>
                        <p className="text-[11px] text-fog leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Correlation note card ── */}
            <div className="glass-panel rounded-xl p-4 flex gap-3 border-l-2 border-signal shadow-md relative overflow-hidden mt-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-signal/5 to-transparent pointer-events-none" />
              <Sparkles className="w-5 h-5 text-signal shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-paper">Private Correlation Engine</h3>
                <p className="text-[11px] text-fog leading-relaxed">
                  These insights are derived entirely in your browser using local decryption keys.
                  No health data profiles, trends, or metrics are uploaded or analyzed server-side
                  by external tracking models.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
