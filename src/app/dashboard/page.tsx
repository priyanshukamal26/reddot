'use client';

import { motion } from 'motion/react';
import { Pen, Calendar, TrendingUp, Send, BrainCircuit, Droplets, Smile, FileText, Bed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadAllCycles, loadAllEntries, loadEntryByDate, recalculateCycles } from '@/lib/data';
import CycleHeatmap from '@/components/tracking/CycleHeatmap';
import { calculateCycleStats, getCurrentPhase } from '@/lib/cycle';
import type { CyclePhaseInfo } from '@/lib/types';

export default function TrackingPage() {
  const router = useRouter();
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [todayLog, setTodayLog] = useState({ period: false, mood: false, logs: false });
  const [insightsPreview, setInsightsPreview] = useState({ avgMood: '--', avgSleep: '--' });

  useEffect(() => {
    async function fetchPhase() {
      try {
        await recalculateCycles();
        const cycles = await loadAllCycles();
        if (cycles.length > 0) {
          const sorted = [...cycles].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const stats = calculateCycleStats(cycles);
          const currentPhase = getCurrentPhase(sorted[0].startDate, stats);
          setPhaseInfo(currentPhase);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const todayEntry = await loadEntryByDate(todayStr);
        if (todayEntry) {
          setTodayLog({
            period: todayEntry.periodFlag,
            mood: todayEntry.mood !== undefined,
            logs: todayEntry.symptoms.length > 0 || !!todayEntry.notes,
          });
        }

        const entries = await loadAllEntries();
        const transformedData = entries.map((entry) => ({
          date: entry.date,
          periodFlag: entry.periodFlag,
          flowIntensity: entry.flowIntensity,
          symptomCount: entry.symptoms.length,
          mood: entry.mood,
        }));
        setHeatmapData(transformedData);

        let moodSum = 0, moodCount = 0;
        let sleepSum = 0, sleepCount = 0;
        entries.forEach(e => {
          if (e.mood) { moodSum += e.mood; moodCount++; }
          if (e.sleep) { sleepSum += e.sleep; sleepCount++; }
        });
        setInsightsPreview({
          avgMood: moodCount ? (moodSum / moodCount).toFixed(1) : '--',
          avgSleep: sleepCount ? (sleepSum / sleepCount).toFixed(1) : '--',
        });
      } catch (err) {
        console.error("Failed to load phase:", err);
      }
    }
    fetchPhase();
  }, []);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-start pt-10">
      
      {/* Hero Section: Cycle Ring & AI Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16 animate-in fade-in zoom-in duration-700">
        
        {/* Left Column: Cycle Ring */}
        <div className="flex justify-center md:justify-end items-center pr-0 md:pr-8">
          <div className="relative w-[340px] h-[340px] flex items-center justify-center">
            {/* Glow behind */}
            <div className="absolute w-[300px] h-[300px] bg-[#e51d38] opacity-20 blur-[80px] rounded-full mix-blend-screen" />
            
            {/* SVG Circle */}
            <svg className="absolute inset-0 w-[340px] h-[340px] transform -rotate-90 z-10" viewBox="0 0 340 340">
              <circle
                cx="170"
                cy="170"
                r="150"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress Circle (simulating the follicular phase arc) */}
              <motion.circle
                cx="170"
                cy="170"
                r="150"
                stroke="url(#redGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDasharray: "942", strokeDashoffset: "942" }}
                animate={{ strokeDashoffset: "700" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                  filter: "drop-shadow(0px 0px 12px rgba(229, 29, 56, 0.6))"
                }}
              />
              <defs>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d66" />
                  <stop offset="100%" stopColor="#c0142b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text */}
            <div className="relative flex flex-col items-center justify-center text-center z-20">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl font-serif tracking-tighter mb-1"
              >
                {phaseInfo ? String(phaseInfo.cycleDay).padStart(2, '0') : '--'}
              </motion.h2>
              <p className="text-gray-400 text-sm tracking-wide mb-1">
                {phaseInfo ? `Day ${phaseInfo.dayWithinPhase}` : 'No active cycle'}
              </p>
              <p className="text-[#e51d38] font-medium tracking-wide">
                {phaseInfo ? phaseInfo.phase : 'Log a cycle to begin'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Report */}
        <div className="flex flex-col justify-center pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/5 relative">
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#e51d38]/20 to-transparent hidden md:block" />
          
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="w-5 h-5 text-[#e51d38]" />
            <h3 className="text-lg font-medium text-white tracking-wide">RedDot.ai Engine</h3>
          </div>
          
          <div className="bg-[rgba(20,20,22,0.4)] backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e51d38]/20 to-transparent" />
            
            <p className="text-gray-300 text-sm leading-relaxed mb-6 h-[80px]">
              {phaseInfo?.phase === 'menstrual' && "Your body is currently shedding its uterine lining. Energy levels are typically at their lowest. Prioritize rest, hydration, and light movement."}
              {phaseInfo?.phase === 'follicular' && "Estrogen is rising, which usually brings a natural boost in energy, mood, and cognitive focus. It's an excellent time for high-intensity workouts and creative projects."}
              {phaseInfo?.phase === 'ovulation' && "Hormones are peaking. You might feel highly energetic and sociable. This is biologically your most fertile window."}
              {phaseInfo?.phase === 'luteal' && "Progesterone is taking over, which can have a calming or sedating effect. You may experience premenstrual symptoms or cravings as your body prepares for the next cycle."}
              {!phaseInfo && "Log your first cycle to unlock personalized biological insights and predictive modeling."}
            </p>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Smile className="w-3.5 h-3.5 text-gray-500" />
                  <span>Mood <span className="text-white font-medium ml-1">{insightsPreview.avgMood}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Bed className="w-3.5 h-3.5 text-gray-500" />
                  <span>Sleep <span className="text-white font-medium ml-1">{insightsPreview.avgSleep}</span></span>
                </div>
              </div>
              <button onClick={() => router.push('/dashboard/ai')} className="text-[#e51d38] text-xs font-mono uppercase tracking-widest hover:text-white transition-colors">
                Chat AI →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
        {/* Log Today Card */}
        <motion.div 
          onClick={() => router.push('/dashboard/log')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 relative overflow-hidden group hover:border-[#e51d38]/30 transition-colors cursor-pointer flex flex-col justify-between h-full"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e51d38]/20 to-transparent" />
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-white mb-1">Log Today</h3>
              <p className="text-xs text-gray-400">Symptoms, mood, daily logs</p>
            </div>
            <Pen className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex-grow flex flex-col justify-center items-center py-4 opacity-80">
             <div className="text-4xl font-serif text-white tracking-tighter mb-1">
                {new Date().getDate()}
             </div>
             <div className="text-[10px] text-[#e51d38] font-mono tracking-widest uppercase">
                {new Date().toLocaleDateString('en-US', { month: 'long', weekday: 'long' })}
             </div>
          </div>

          <div className="flex flex-col gap-2 mt-auto">
             <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-colors group-hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${todayLog.period ? 'bg-[#e51d38]/10' : 'bg-white/5'}`}>
                    <Droplets className={`w-4 h-4 ${todayLog.period ? 'text-[#e51d38]' : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm text-gray-300">Flow</span>
                </div>
                <span className={`text-[10px] font-mono tracking-wider ${todayLog.period ? 'text-[#e51d38]' : 'text-gray-600'}`}>
                   {todayLog.period ? 'LOGGED' : 'PENDING'}
                </span>
             </div>
             <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-colors group-hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${todayLog.mood ? 'bg-[#e51d38]/10' : 'bg-white/5'}`}>
                    <Smile className={`w-4 h-4 ${todayLog.mood ? 'text-[#e51d38]' : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm text-gray-300">Mood</span>
                </div>
                <span className={`text-[10px] font-mono tracking-wider ${todayLog.mood ? 'text-[#e51d38]' : 'text-gray-600'}`}>
                   {todayLog.mood ? 'LOGGED' : 'PENDING'}
                </span>
             </div>
             <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-colors group-hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${todayLog.logs ? 'bg-[#e51d38]/10' : 'bg-white/5'}`}>
                    <FileText className={`w-4 h-4 ${todayLog.logs ? 'text-[#e51d38]' : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm text-gray-300">Symptoms</span>
                </div>
                <span className={`text-[10px] font-mono tracking-wider ${todayLog.logs ? 'text-[#e51d38]' : 'text-gray-600'}`}>
                   {todayLog.logs ? 'LOGGED' : 'PENDING'}
                </span>
             </div>
          </div>
        </motion.div>

        {/* Cycle View Card */}
        <motion.div 
          onClick={() => router.push('/dashboard/cycle')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 group hover:border-[#e51d38]/30 transition-colors cursor-pointer flex flex-col justify-between h-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-medium text-white mb-1">Cycle View</h3>
              <p className="text-xs text-gray-400">Heatmap & patterns</p>
            </div>
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div className="w-full opacity-90 pointer-events-none mt-2">
            <CycleHeatmap data={heatmapData} months={1} />
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div 
          onClick={() => router.push('/dashboard/insights')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 group hover:border-[#e51d38]/30 transition-colors cursor-pointer flex flex-col justify-between h-full overflow-hidden relative"
        >
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <h3 className="font-medium text-white mb-1">Insights</h3>
              <p className="text-xs text-gray-400">Trend charts & stats</p>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex-grow flex flex-col justify-center py-2 relative z-10">
             <p className="text-xs text-gray-400 leading-relaxed max-w-[90%]">
               Your wellness factors are actively being tracked. Consistent daily logging unlocks personalized correlation patterns and deeper health insights.
             </p>
          </div>

          <div className="mt-auto relative z-10 space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                   <div className="text-[10px] text-gray-500 font-mono tracking-wider mb-2">AVG MOOD</div>
                   <div className="text-xl font-bold text-white tracking-tighter">{insightsPreview.avgMood}<span className="text-xs text-gray-600 font-normal ml-1">/5</span></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                   <div className="text-[10px] text-gray-500 font-mono tracking-wider mb-2">AVG SLEEP</div>
                   <div className="text-xl font-bold text-white tracking-tighter">{insightsPreview.avgSleep}<span className="text-xs text-gray-600 font-normal ml-1">/5</span></div>
                </div>
             </div>
             
             <div className="flex items-center text-[11px] text-[#e51d38] font-medium tracking-wide group-hover:translate-x-1 transition-transform">
                View detailed patterns &rarr;
             </div>
          </div>

          {/* Simple SVG Chart Background */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none mix-blend-screen">
            <svg className="w-full h-full translate-y-4" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path 
                d="M0 30 Q 10 20, 20 25 T 40 15 T 60 20 T 80 5 T 100 10" 
                fill="none" 
                stroke="#e51d38" 
                strokeWidth="2"
                style={{ filter: "drop-shadow(0px 2px 4px rgba(229,29,56,0.4))" }}
              />
              <path 
                d="M0 30 Q 10 20, 20 25 T 40 15 T 60 20 T 80 5 T 100 10 L 100 40 L 0 40 Z" 
                fill="url(#fade)" 
              />
              <defs>
                <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(229,29,56,0.2)" />
                  <stop offset="100%" stopColor="rgba(229,29,56,0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
      </div>

      {/* AI Engine Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-[rgba(20,20,22,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center"
      >
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-[#e51d38] opacity-20 blur-xl rounded-full mix-blend-screen" />
          <BrainCircuit className="w-12 h-12 text-[#e51d38] relative z-10" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#e51d38] tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#e51d38] animate-pulse" />
            RedDot.AI Engine
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4 max-w-2xl">
            Based on your data, we anticipate a rise in energy. Personalized insights to anim ity measaling. Consider high-intensity workouts today.
          </p>
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiQuery.trim()) {
                  router.push(`/dashboard/ai?q=${encodeURIComponent(aiQuery)}`);
                }
              }}
              placeholder="Ask RedDot.ai..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button 
              onClick={() => {
                if (aiQuery.trim()) router.push(`/dashboard/ai?q=${encodeURIComponent(aiQuery)}`);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="hidden md:block w-32 h-24">
           <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path 
                d="M0 20 Q 25 35, 50 20 T 100 20" 
                fill="none" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="1.5"
              />
            </svg>
        </div>
      </motion.div>
    </div>
  );
}
