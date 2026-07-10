"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getArticles, type Article } from "@/lib/articles";
import { Search, Clock, ArrowRight, BookOpen, RefreshCw, FileText, Sparkles, Brain } from "lucide-react";
import CoreDot from "@/components/layout/CoreDot";
import { loadAllCycles } from "@/lib/data";
import { calculateCycleStats, getCurrentPhase } from "@/lib/cycle";

export default function KnowHubPage() {
  const allArticles = useMemo(() => getArticles(), []);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "phase" | "general">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  // Fetch current phase on mount
  useEffect(() => {
    async function fetchPhase() {
      try {
        const cycles = await loadAllCycles();
        if (cycles.length > 0) {
          const sorted = [...cycles].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const stats = calculateCycleStats(cycles);
          const phaseInfo = getCurrentPhase(sorted[0].startDate, stats);
          setCurrentPhase(phaseInfo.phase);
        }
      } catch (err) {
        console.error("Failed to load current phase in Know Hub:", err);
      }
    }
    fetchPhase();
  }, []);

  // Get unique topics for quick filter tags
  const topics = useMemo(() => {
    const list = new Set<string>();
    allArticles.forEach((art) => {
      if (art.category === "general") {
        list.add(art.topic);
      } else {
        list.add("Cycle Basics");
      }
    });
    return ["All", ...Array.from(list)];
  }, [allArticles]);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      // 1. Category Filter
      if (selectedCategory !== "all" && art.category !== selectedCategory) {
        return false;
      }

      // 2. Topic Tag Filter
      if (selectedTopic !== "All") {
        if (selectedTopic === "Cycle Basics") {
          if (art.category !== "phase") return false;
        } else if (art.topic !== selectedTopic) {
          return false;
        }
      }

      // 3. Search Term Filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(query);
        const matchesSummary = art.summary.toLowerCase().includes(query);
        const matchesTopic = art.topic.toLowerCase().includes(query);
        const matchesContent = art.content.some((para) => para.toLowerCase().includes(query));
        return matchesTitle || matchesSummary || matchesTopic || matchesContent;
      }

      return true;
    });
  }, [allArticles, searchTerm, selectedCategory, selectedTopic]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTopic("All");
  };

  // Helper to get Phase styling details
  const getPhaseStyles = (phase?: string) => {
    switch (phase) {
      case "menstrual":
        return {
          border: "border-void-border hover:border-signal-500/50",
          text: "text-signal-500",
          badgeBg: "bg-signal-500/10 text-signal border-signal-500/20",
          dot: "bg-signal",
          name: "Menstrual Phase"
        };
      case "follicular":
        return {
          border: "border-void-border hover:border-signal-500/50",
          text: "text-[#D9C9C7]",
          badgeBg: "bg-signal-500/10 text-signal border-signal-500/20",
          dot: "bg-[#D9C9C7]",
          name: "Follicular Phase"
        };
      case "ovulation":
        return {
          border: "border-void-border hover:border-signal-500/50",
          text: "text-[#FAFAFA]",
          badgeBg: "bg-signal-500/10 text-signal border-signal-500/20",
          dot: "bg-[#FAFAFA]",
          name: "Ovulation Phase"
        };
      case "luteal":
        return {
          border: "border-void-border hover:border-signal-500/50",
          text: "text-[#4A3536]",
          badgeBg: "bg-signal-500/10 text-signal border-signal-500/20",
          dot: "bg-[#4A3536]",
          name: "Luteal Phase"
        };
      default:
        return {
          border: "border-void-border hover:border-signal-500/50",
          text: "text-fog",
          badgeBg: "bg-void border border-void-border text-fog",
          dot: "bg-fog",
          name: "General Topic"
        };
    }
  };

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-signal-deep/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-25%] w-[600px] h-[600px] rounded-full bg-signal/5 blur-[180px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* ── Page Header ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-signal">
            <CoreDot className="w-1.5 h-1.5" />
            <span className="text-xs font-mono uppercase tracking-widest font-semibold text-signal-500">Educational Modules</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-paper font-display">Know Hub</h1>
          <p className="text-fog max-w-xl text-sm leading-relaxed">
            Evidence-based, privacy-first guides to your menstrual cycle, hormonal health, and reproductive wellness. 
            All insights are locally accessible and strictly informational.
          </p>
        </div>

        {/* ── Filters and Controls Panel ── */}
        <div className="glass-panel rounded-xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-fog/30" />
            <input
              type="text"
              placeholder="Search articles, conditions, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-11 pr-4 py-3 rounded bg-void-900 border border-void-border
                text-paper placeholder-fog/30 text-sm font-sans
                focus:outline-none focus:border-signal-500
                transition-all duration-200
              "
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-void-border pt-4">
            {/* Category Tabs */}
            <div className="flex bg-void p-1 rounded border border-void-border self-start">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 uppercase tracking-widest ${
                  selectedCategory === "all"
                    ? "bg-signal-500/10 text-paper border border-signal-500/20 font-bold"
                    : "text-fog hover:text-paper"
                }`}
              >
                All Articles
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("phase");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 uppercase tracking-widest ${
                  selectedCategory === "phase"
                    ? "bg-signal-500/10 text-paper border border-signal-500/20 font-bold"
                    : "text-fog hover:text-paper"
                }`}
              >
                Cycle Phases
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("general");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-mono font-medium rounded transition-all duration-150 uppercase tracking-widest ${
                  selectedCategory === "general"
                    ? "bg-signal-500/10 text-paper border border-signal-500/20 font-bold"
                    : "text-fog hover:text-paper"
                }`}
              >
                General Topics
              </button>
            </div>

            {/* Quick Topic Filter Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-fog/40 mr-1">Topics:</span>
              {topics.map((t) => {
                // Hide specific general tags if we're filtering on Phase category
                if (selectedCategory === "phase" && t !== "All" && t !== "Cycle Basics") return null;
                if (selectedCategory === "general" && t === "Cycle Basics") return null;

                const isSelected = selectedTopic === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`
                      px-2.5 py-1 rounded text-xs border font-mono uppercase tracking-wider transition-all duration-150
                      ${
                        isSelected
                          ? "border-signal-500 bg-signal-500/10 text-paper font-bold"
                          : "bg-void-900 border-void-border text-fog hover:text-paper hover:border-ink-500"
                      }
                    `}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Articles Grid ── */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => {
              const styles = getPhaseStyles(article.phase);
              const imageUrl = article.phase ? `/assets/images/phase-${article.phase}.jpeg` : null;
              const isCurrentPhase = article.phase && article.phase === currentPhase;

              return (
                <Link
                  key={article.slug}
                  href={`/dashboard/know/${article.slug}`}
                  className={`
                    group bg-void-900 rounded-xl p-0 flex flex-col justify-between overflow-hidden
                    border ${styles.border} hover:shadow-[4px_4px_0px_rgba(224,16,40,0.35)] transition-all duration-300
                  `}
                >
                  <div className="flex flex-col flex-grow">
                    {/* Render Image Thumbnail for Phase Articles */}
                    {imageUrl ? (
                      <div className="w-full aspect-[4/3] overflow-hidden border-b border-void-border relative">
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      /* Non-phase content generic icon header container */
                      <div className="px-6 pt-6 flex justify-start">
                        <div className="w-9 h-9 rounded-full border border-void-border flex items-center justify-center text-ink-500 group-hover:text-signal-500 group-hover:border-signal-500/50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      {/* Header: Badge & Reading Time */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${styles.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                          {styles.name}
                          {isCurrentPhase && (
                            <span className="text-[8px] font-mono bg-signal-500 text-paper px-1 rounded-sm font-bold uppercase tracking-wider ml-1">
                              Current
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-fog/40">
                          <Clock className="w-3 h-3" />
                          {article.readingTime}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-paper font-display group-hover:text-signal-500 transition-colors duration-200">
                          {article.title}
                        </h2>
                        <p className="text-fog/75 text-xs leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Read action footer */}
                  <div className="p-6 pt-4 border-t border-void-border flex items-center gap-1 text-xs text-signal font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="glass-panel rounded-xl p-12 text-center max-w-md mx-auto space-y-4 shadow-lg border border-void-border">
            <div className="inline-flex p-3 rounded-full bg-void-950 border border-void-border text-fog/30">
              <CoreDot pulse={true} className="w-2.5 h-2.5" />
            </div>
            <h3 className="text-sm font-bold font-mono tracking-widest text-paper uppercase">No modules found</h3>
            <p className="text-fog/60 text-xs leading-relaxed">
              No articles match that search. Try a different term, or browse by phase instead.
            </p>
            <button
              onClick={handleClearFilters}
              className="
                inline-flex items-center gap-2 px-4 py-2.5 rounded bg-signal-500 text-paper text-xs font-mono font-medium uppercase tracking-widest
                hover:bg-signal-600 transition-colors shadow-md hover:shadow-[4px_4px_0px_rgba(224,16,40,0.35)]
              "
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
