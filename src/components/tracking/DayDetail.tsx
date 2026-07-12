"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { loadEntryByDate } from "@/lib/data";
import type { DailyEntry } from "@/lib/types";
import { Bed, Zap, Utensils, Dumbbell, X, Droplets } from "lucide-react";

interface DayDetailProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: DailyEntry | null; // Kept for backwards compatibility
  date: string;
}

const MOOD_LABELS: Record<number, string> = {
  1: "😞 Very low",
  2: "😔 Low",
  3: "😐 Okay",
  4: "🙂 Good",
  5: "😊 Great",
};

const SCALE_ICONS: Record<string, React.ReactNode> = {
  sleep: <Bed className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  appetite: <Utensils className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
};

export default function DayDetail({ isOpen, onClose, date }: DayDetailProps) {
  const router = useRouter();
  
  const [activeDateStr, setActiveDateStr] = useState<string>(date);
  const [entriesCache, setEntriesCache] = useState<Record<string, DailyEntry | null>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveDateStr(date);
    }
  }, [isOpen, date]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const safeDateStr = activeDateStr || new Date().toISOString().split("T")[0];
  
  const getOffsetDateStr = (dateStr: string, offsetDays: number) => {
    if (!dateStr) return "";
    // Parse strictly as UTC to avoid local timezone offset shifts
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + offsetDays);
    return date.toISOString().split("T")[0];
  };

  const prevDateStr = getOffsetDateStr(safeDateStr, -1);
  const nextDateStr = getOffsetDateStr(safeDateStr, 1);

  const datesToLoad = [prevDateStr, safeDateStr, nextDateStr].filter(Boolean);

  // Fetch adjacent days
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const fetchEntries = async () => {
      const newCache = { ...entriesCache };
      let changed = false;
      for (const d of datesToLoad) {
        if (newCache[d] === undefined) {
          const entry = await loadEntryByDate(d);
          newCache[d] = entry ?? null;
          changed = true;
        }
      }
      if (changed && mounted) {
        setEntriesCache(newCache);
      }
    };
    fetchEntries();
    return () => { mounted = false; };
  }, [isOpen, activeDateStr]); 

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
      >
        {/* Clickable Backdrop to close */}
        <div className="absolute inset-0 z-0" onClick={onClose} />

        <div className="relative w-full h-[600px] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {datesToLoad.map((d, index) => {
              const isCenter = index === 1;
              const isLeft = index === 0;
              const isRight = index === 2;
              const entry = entriesCache[d];
              
              return (
                <motion.div
                  key={d}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: isLeft ? "-100%" : isRight ? "100%" : "0%" }}
                  animate={{ 
                    opacity: isCenter ? 1 : 0.4, 
                    scale: isCenter ? 1 : 0.85,
                    x: isLeft ? "-110%" : isRight ? "110%" : "0%",
                    zIndex: isCenter ? 20 : 10
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  onClick={() => {
                    if (isLeft) setActiveDateStr(prevDateStr);
                    if (isRight) setActiveDateStr(nextDateStr);
                  }}
                  className={`absolute w-[360px] max-w-[85vw] h-[550px] bg-[rgba(20,20,22,0.8)] backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-y-auto hidden-scrollbar flex flex-col shadow-2xl ${
                    isCenter ? 'cursor-default border-[#e51d38]/20 shadow-[0_0_40px_rgba(229,29,56,0.1)]' : 'cursor-pointer hover:border-white/20 transition-colors'
                  } ${
                    entry?.periodFlag ? 'bg-gradient-to-b from-[#e51d38]/10 to-transparent border-[#e51d38]/30 shadow-[0_0_30px_rgba(229,29,56,0.15)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </h2>
                      {entry?.periodFlag && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#e51d38] font-mono">
                          <Droplets className="w-3 h-3" /> Period
                        </div>
                      )}
                    </div>
                    {isCenter && (
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/dashboard/log?date=${d}`)} className="px-3 py-1 -mt-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-gray-300 hover:text-white transition-colors z-50 font-mono uppercase tracking-widest flex items-center justify-center">
                          Edit
                        </button>
                        <button onClick={onClose} className="p-1 -mt-1 -mr-1 text-gray-500 hover:text-white transition-colors z-50">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!entry ? (
                    <div className="flex flex-col items-center justify-center h-full flex-grow pb-10">
                      <p className="text-gray-500 text-sm mb-6">No data logged.</p>
                      {isCenter && (
                        <button onClick={() => router.push(`/dashboard/log?date=${d}`)} className="px-8 py-3 bg-[rgba(30,30,32,0.8)] border border-white/10 hover:border-[#e51d38]/50 text-white font-medium hover:bg-[#e51d38]/10 text-xs rounded-xl transition-all uppercase tracking-widest">
                          Log this Day
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8 flex-grow">
                      {/* Symptoms */}
                      {entry.symptoms.length > 0 && (
                        <div>
                          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Symptoms</h3>
                          <div className="flex flex-wrap gap-2">
                            {entry.symptoms.map(s => (
                              <span key={s} className="px-3 py-1.5 bg-[#e51d38]/10 border border-[#e51d38] rounded-full text-xs text-[#ff4d66] shadow-[0_0_12px_rgba(229,29,56,0.4)]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mood */}
                      {entry.mood && (
                        <div>
                          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Mood</h3>
                          <p className="text-sm text-white flex items-center gap-2">
                            {MOOD_LABELS[entry.mood] || entry.mood}
                          </p>
                        </div>
                      )}

                      {/* Quick Scales Vertical Bars */}
                      {(["sleep", "energy", "appetite", "exercise"] as const).some(k => entry[k] !== undefined) && (
                        <div>
                          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Quick Scales</h3>
                          <div className="flex justify-between gap-3">
                            {(["sleep", "energy", "appetite", "exercise"] as const).map(key => {
                              const val = entry[key];
                              if (val === undefined) return null;
                              // Scale is 1-5, so percent is (val/5)*100
                              const heightPercent = (val / 5) * 100;
                              
                              return (
                                <div key={key} className="flex flex-col items-center flex-1">
                                  <span className="text-[11px] text-gray-400 mb-0.5 capitalize">{key}</span>
                                  <span className="text-xs text-white mb-3 font-mono">{val}/5</span>
                                  
                                  {/* Vertical Track */}
                                  <div className="w-full max-w-[56px] h-48 bg-[rgba(20,20,22,0.8)] border border-white/5 rounded-[20px] p-1.5 flex flex-col justify-end relative overflow-hidden group shadow-inner">
                                    {/* The glowing fill */}
                                    <motion.div 
                                      initial={{ height: 0 }}
                                      animate={{ height: `${heightPercent}%` }}
                                      transition={{ duration: 1, ease: "easeOut", delay: isCenter ? 0.2 : 0 }}
                                      className="w-full bg-gradient-to-t from-[#e51d38] to-[#ff4d66] rounded-[16px] shadow-[0_0_25px_rgba(229,29,56,0.8)]"
                                    />
                                    {/* Icon overlaid */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-md mix-blend-overlay">
                                      {SCALE_ICONS[key]}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {entry && isCenter && (
                    <button onClick={() => router.push(`/dashboard/log?date=${d}`)} className="w-full mt-6 py-3.5 bg-[rgba(20,20,22,0.8)] border border-white/10 hover:border-[#e51d38]/50 text-white font-medium hover:bg-[#e51d38]/10 text-xs rounded-xl transition-all uppercase tracking-widest shrink-0">
                      Edit Log Entry
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
