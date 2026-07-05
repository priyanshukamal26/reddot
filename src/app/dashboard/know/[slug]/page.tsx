"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getArticleBySlug, getArticles, type Article } from "@/lib/articles";
import { ArrowLeft, Clock, AlertTriangle, BookOpen, ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  // Find the current article
  const article = useMemo(() => getArticleBySlug(slug), [slug]);

  // Find recommended "Next Up" articles (excluding the current one)
  const recommendations = useMemo(() => {
    if (!article) return [];
    const all = getArticles();
    
    // Attempt to find articles in the same category first
    let matching = all.filter((a) => a.category === article.category && a.slug !== article.slug);
    
    // If none in same category, fall back to any other article
    if (matching.length === 0) {
      matching = all.filter((a) => a.slug !== article.slug);
    }
    
    // Return up to 2 recommendations
    return matching.slice(0, 2);
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-void text-paper relative space-grid py-24 px-4 flex items-center justify-center">
        <div className="absolute inset-0 bg-signal-deep/5 blur-[150px] pointer-events-none" />
        <div className="max-w-md w-full glass-panel rounded-lg p-8 text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-error mx-auto animate-bounce" />
          <h1 className="text-2xl font-bold tracking-tight">Article Not Found</h1>
          <p className="text-fog/60 text-xs">
            The educational module you are looking for does not exist or has been moved.
          </p>
          <button
            onClick={() => router.push("/dashboard/know")}
            className="
              inline-flex items-center gap-2 px-6 py-2.5 rounded bg-signal text-paper text-xs font-semibold
              hover:bg-signal-deep transition-colors
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Know Hub
          </button>
        </div>
      </div>
    );
  }

  // Phase-specific colors for the headers
  const getPhaseHeaderColors = (phase?: string) => {
    switch (phase) {
      case "menstrual":
        return { border: "border-signal/30", text: "text-signal", glow: "bg-signal/5" };
      case "follicular":
        return { border: "border-phase-rise/30", text: "text-phase-rise", glow: "bg-phase-rise/5" };
      case "ovulation":
        return { border: "border-phase-peak/30", text: "text-phase-peak", glow: "bg-phase-peak/5" };
      case "luteal":
        return { border: "border-phase-fade/40", text: "text-phase-fade", glow: "bg-phase-fade/5" };
      default:
        return { border: "border-white/5", text: "text-fog/60", glow: "bg-ash/10" };
    }
  };

  const headerColors = getPhaseHeaderColors(article.phase);

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* ── Ambient Background Glows ── */}
      <div className={`absolute top-[5%] left-[-20%] w-[500px] h-[500px] rounded-full ${headerColors.glow} blur-[120px] pointer-events-none`} />
      <div className="absolute bottom-[15%] right-[-15%] w-[400px] h-[400px] rounded-full bg-signal-deep/5 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* ── Back Button & Breadcrumbs ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/know")}
            className="
              inline-flex items-center gap-2 text-xs font-mono text-fog/60 hover:text-signal
              transition-colors py-1.5 px-3 rounded bg-ash/40 border border-white/5
            "
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hub</span>
          </button>

          <span className="text-[10px] font-mono uppercase tracking-widest text-fog/40">
            {article.topic}
          </span>
        </div>

        {/* ── Article Header ── */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-paper leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-fog/40 pb-6 border-b border-white/5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
            <span>•</span>
            <span className="capitalize">{article.category} guide</span>
            {article.phase && (
              <>
                <span>•</span>
                <span className={`font-semibold ${headerColors.text} capitalize`}>
                  {article.phase} phase
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Medical Disclaimer Box ── */}
        <div className="bg-ash/50 border border-white/5 rounded p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-signal/70 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal/80 font-bold">
              Medical Disclaimer
            </span>
            <p className="text-fog/70 text-xs italic leading-relaxed">
              {article.disclaimer || "This article is for educational purposes only and is not medical advice. RedDot does not provide medical diagnostics, treatments, or prescriptions. Always consult a qualified medical professional for personalized advice."}
            </p>
          </div>
        </div>

        {/* ── Article Body (Editorial Layout) ── */}
        <article className="space-y-6 text-fog/95 text-base leading-relaxed font-sans pt-2">
          {article.content.map((paragraph, idx) => {
            // Apply a subtle style to the first paragraph (larger text / drop-cap look)
            if (idx === 0) {
              return (
                <p key={idx} className="text-[17px] leading-relaxed text-paper/90 font-medium">
                  {paragraph}
                </p>
              );
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </article>

        {/* ── Recommendation / Next Up block ── */}
        {recommendations.length > 0 && (
          <div className="border-t border-white/5 pt-12 mt-16 space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-signal" />
              <h3 className="text-sm font-mono uppercase tracking-widest font-semibold text-paper">
                Next Up
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.slug}
                  href={`/dashboard/know/${rec.slug}`}
                  className="
                    group bg-ash/20 border border-white/5 rounded p-5 flex flex-col justify-between
                    hover:border-signal/25 hover:bg-ash/40 transition-all duration-300
                  "
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-fog/40">
                      {rec.topic}
                    </span>
                    <h4 className="text-sm font-bold text-paper group-hover:text-signal transition-colors line-clamp-2">
                      {rec.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-signal mt-4 opacity-80 group-hover:opacity-100">
                    <span>Read Now</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
