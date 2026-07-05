"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getArticles, type Article } from "@/lib/articles";
import { Search, BookOpen, Clock, ArrowRight, HeartPulse, Sparkles, RefreshCw } from "lucide-react";

export default function KnowHubPage() {
  const allArticles = useMemo(() => getArticles(), []);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "phase" | "general">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  // Get unique topics for quick filter tags (excluding phase name topics for cleanliness)
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
          bg: "hover:shadow-[0_0_20px_rgba(224,16,42,0.15)]",
          border: "border-signal/20",
          text: "text-signal",
          badgeBg: "bg-signal/10 text-signal border-signal/20",
          dot: "bg-signal",
          name: "Menstrual Phase"
        };
      case "follicular":
        return {
          bg: "hover:shadow-[0_0_20px_rgba(217,201,199,0.15)]",
          border: "border-phase-rise/20",
          text: "text-phase-rise",
          badgeBg: "bg-phase-rise/10 text-phase-rise border-phase-rise/20",
          dot: "bg-phase-rise",
          name: "Follicular Phase"
        };
      case "ovulation":
        return {
          bg: "hover:shadow-[0_0_20px_rgba(250,250,250,0.15)]",
          border: "border-phase-peak/20",
          text: "text-phase-peak",
          badgeBg: "bg-phase-peak/10 text-phase-peak border-phase-peak/20",
          dot: "bg-phase-peak",
          name: "Ovulation Phase"
        };
      case "luteal":
        return {
          bg: "hover:shadow-[0_0_20px_rgba(74,53,54,0.35)]",
          border: "border-phase-fade/30",
          text: "text-phase-fade",
          badgeBg: "bg-phase-fade/20 text-phase-fade border-phase-fade/35",
          dot: "bg-phase-fade",
          name: "Luteal Phase"
        };
      default:
        return {
          bg: "hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
          border: "border-white/5",
          text: "text-fog",
          badgeBg: "bg-ash border-white/5 text-fog",
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
            <HeartPulse className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest font-semibold">Educational Modules</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-paper">Know Hub</h1>
          <p className="text-fog max-w-xl text-sm leading-relaxed">
            Evidence-based, privacy-first guides to your menstrual cycle, hormonal health, and reproductive wellness. 
            All insights are locally accessible and strictly informational.
          </p>
        </div>

        {/* ── Filters and Controls Panel ── */}
        <div className="glass-panel rounded-lg p-6 space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-fog/40" />
            <input
              type="text"
              placeholder="Search articles, conditions, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-11 pr-4 py-3 rounded bg-void/60 border border-white/5
                text-paper placeholder-fog/40 text-sm font-sans
                focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/30
                transition-all duration-200
              "
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-white/5 pt-4">
            {/* Category Tabs */}
            <div className="flex bg-void p-1 rounded border border-white/5 self-start">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
                  selectedCategory === "all"
                    ? "bg-ash text-paper border border-white/5"
                    : "text-fog/60 hover:text-paper"
                }`}
              >
                All Articles
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("phase");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
                  selectedCategory === "phase"
                    ? "bg-ash text-paper border border-white/5"
                    : "text-fog/60 hover:text-paper"
                }`}
              >
                Cycle Phases
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("general");
                  setSelectedTopic("All");
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
                  selectedCategory === "general"
                    ? "bg-ash text-paper border border-white/5"
                    : "text-fog/60 hover:text-paper"
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
                      px-2.5 py-1 rounded text-xs border transition-all duration-150
                      ${
                        isSelected
                          ? "bg-signal text-paper border-signal"
                          : "bg-void border-white/5 text-fog/60 hover:text-paper hover:border-white/10"
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
              return (
                <Link
                  key={article.slug}
                  href={`/dashboard/know/${article.slug}`}
                  className={`
                    group glass-panel rounded-lg p-6 flex flex-col justify-between 
                    border ${styles.border} ${styles.bg} transition-all duration-300
                  `}
                >
                  <div className="space-y-4">
                    {/* Header: Badge & Reading Time */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${styles.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {styles.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-fog/40">
                        <Clock className="w-3 h-3" />
                        {article.readingTime}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold tracking-tight text-paper group-hover:text-signal transition-colors duration-200">
                        {article.title}
                      </h2>
                      <p className="text-fog/70 text-xs leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Read action footer */}
                  <div className="flex items-center gap-1 text-xs text-signal font-mono mt-6 pt-4 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-12 text-center max-w-md mx-auto space-y-4">
            <div className="inline-flex p-3 rounded-full bg-ash/50 border border-white/5 text-fog/40">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-paper">No articles found</h3>
            <p className="text-fog/60 text-xs leading-relaxed">
              No matching modules. Try adjusting your search keywords, category tabs, or topic tag filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded bg-signal text-paper text-xs font-semibold
                hover:bg-signal-deep transition-colors
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
