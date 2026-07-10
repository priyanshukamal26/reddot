"use client";

import { useEffect, useRef, useState, useId } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import {
  Lock,
  EyeOff,
  Database,
  Smartphone,
  Ban,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Play,
  Pause,
  Menu,
  X,
  Activity,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import DecryptReveal from "@/components/layout/DecryptReveal";
import PhaseRing from "@/components/tracking/PhaseRing";

// Assets referenced via static public URLs (copied from src/assets to public/assets on prebuild)
const heroSignalBloom = "/assets/video/hero-signal-bloom.mp4";
const coreOrb = "/assets/images/core-orb.jpeg";
const phaseMenstrual = "/assets/images/phase-menstrual.jpeg";
const phaseFollicular = "/assets/images/phase-follicular.jpeg";
const phaseOvulation = "/assets/images/phase-ovulation.jpeg";
const phaseLuteal = "/assets/images/phase-luteal.jpeg";

// Custom Github Icon since lucide-react version lacks it
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
  try {
    CustomEase.create("signal", "M0,0 C0.16,1 0.3,1 1,1");
  } catch (e) {
    console.error("CustomEase creation failed", e);
  }
}

const sectionIds = ["section-1", "section-2", "section-3", "section-4", "section-5"];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLImageElement>(null);
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const phaseScrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeSection, setActiveSection] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [videoMounted, setVideoMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [orbError, setOrbError] = useState(false);
  const [phaseErrors, setPhaseErrors] = useState<Record<number, boolean>>({});
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isScramblePlaying, setIsScramblePlaying] = useState(false);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);



  // Delayed hero video mounting (2800ms pattern)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoMounted(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Initialize ScrollSmoother (strictly isolated to the landing page)
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
    });
    smootherRef.current = smoother;

    return () => {
      smoother.kill();
      smootherRef.current = null;
    };
  }, [prefersReducedMotion]);

  // Main GSAP Page animations (ScrollTriggers & Load-Sequence)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      // 1. Initial Load-Sequence
      const tl = gsap.timeline();

      // Logo wipe wipe
      tl.fromTo(
        ".brand-logo-segment",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "signal" }
      );

      // Logo dot pulse in 0.1s after
      tl.fromTo(
        ".brand-logo-dot",
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: "back.out(1.7)" },
        "-=0.1"
      );

      // Headline Line Reveal using SplitText
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "lines" });
        tl.fromTo(
          split.lines,
          { y: "120%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: "signal",
          },
          "-=0.5"
        );
      }

      // Sidebar instruments fade/slide in
      tl.fromTo(
        ".sidebar-stagger-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "signal" },
        "-=0.6"
      );

      // Scroll cue fade in
      tl.fromTo(
        ".scroll-cue-fade",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

      // 2. Section Wayfinding: Track active sections on the scroll rail
      sectionIds.forEach((id, index) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveSection(index);
              // Also adjust Ambient Grain opacity based on section theme
              const targetOpacity = (index === 1 || index === 3) ? 0.02 : 0.04;
              gsap.to(".ambient-grain", {
                opacity: targetOpacity,
                duration: 0.4,
                ease: "power2.out",
              });
            }
          },
        });
      });



      // 4. Section 2B: Heading parallax in-view
      gsap.fromTo(
        ".trust-heading-reveal",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "signal",
          scrollTrigger: {
            trigger: ".trust-heading-reveal",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 5. Section 2E: Three cards scroll trigger reveal
      gsap.fromTo(
        ".trust-card-item",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "signal",
          scrollTrigger: {
            trigger: ".trust-card-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 6. Section 3A: Transparent core-orb.png parallax
      if (orbRef.current) {
        gsap.set(orbRef.current, { xPercent: -50 });
        gsap.fromTo(
          orbRef.current,
          { yPercent: -65, opacity: 0 },
          {
            yPercent: -78,
            opacity: 1,
            duration: 1.4,
            ease: "signal",
            scrollTrigger: {
              trigger: "#section-3",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 7. Section 3C: Desktop pin and scroll-scrub for phases
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile && panelRef.current) {
        const pinTrigger = ScrollTrigger.create({
          trigger: panelRef.current,
          start: "top 15%",
          end: "+=1800",
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const phase = Math.min(3, Math.floor(progress * 4));
            setActivePhase(phase);
          },
        });
        phaseScrollTriggerRef.current = pinTrigger;
      }

      // 8. Section 4: Chat Mockup card lifts in with 3D tilt
      gsap.fromTo(
        ".chat-mockup-reveal",
        { y: 80, rotateX: 12, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.2,
          ease: "signal",
          scrollTrigger: {
            trigger: ".chat-mockup-reveal",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Section 3C Mobile Carousel Autocycle Fallback (Interval-driven below md breakpoint)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    let intervalId: NodeJS.Timeout;

    const startCycle = () => {
      if (mediaQuery.matches) {
        intervalId = setInterval(() => {
          setActivePhase((prev) => (prev + 1) % 4);
        }, 3500);
      }
    };

    startCycle();

    const listener = () => {
      clearInterval(intervalId);
      startCycle();
    };

    mediaQuery.addEventListener("change", listener);
    return () => {
      clearInterval(intervalId);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);



  // Section navigation scroll coordinator
  const scrollToSection = (index: number) => {
    const targetEl = document.getElementById(sectionIds[index]);
    if (!targetEl) return;
    setHamburgerOpen(false);
    if (smootherRef.current) {
      smootherRef.current.scrollTo(targetEl, true);
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Section 3 Phase click-to-jump coordinator
  const handlePhaseClick = (index: number) => {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      setActivePhase(index);
      return;
    }

    const trigger = phaseScrollTriggerRef.current;
    if (trigger) {
      const startPos = trigger.start;
      // 1800 range split into 4 phases (450 each). Target middle of each phase.
      const targetScroll = startPos + index * 450 + 225;
      if (smootherRef.current) {
        smootherRef.current.scrollTo(targetScroll, true);
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  // Magnetic button hover effect
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (prefersReducedMotion) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Cap movement to a tight 12px radius
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  // Phase mappings for Section 3 scrollytelling
  const phases = [
    {
      name: "Menstrual Phase",
      desc: "Peak saturation. Focuses on energy conservation, rest, and protective logs.",
      label: "PHASE-SIGNAL",
      image: phaseMenstrual,
      color: "var(--color-signal-500)",
      bg: "rgba(224, 16, 40, 0.15)",
    },
    {
      name: "Follicular Phase",
      desc: "Energy starts rising. Data service traces gradual metric shifts.",
      label: "PHASE-RISE",
      image: phaseFollicular,
      color: "var(--color-ink-300)",
      bg: "rgba(217, 201, 199, 0.15)",
    },
    {
      name: "Ovulation Phase",
      desc: "Peak lightness. Cycle predictions show key markers clearly.",
      label: "PHASE-PEAK",
      image: phaseOvulation,
      color: "var(--color-paper-50)",
      bg: "rgba(248, 248, 248, 0.15)",
    },
    {
      name: "Luteal Phase",
      desc: "Charcoal descending values. AI prepares your pre-period patterns.",
      label: "PHASE-FADE",
      image: phaseLuteal,
      color: "var(--color-ink-700)",
      bg: "rgba(74, 53, 54, 0.15)",
    },
  ];

  return (
    <div ref={containerRef} className="space-grid relative min-h-screen bg-void-950 overflow-hidden">


      {/* ── 4.3 Scroll Wayfinding Progress Rail (Desktop only) ── */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center gap-4">
        <div className="flex flex-col gap-8 items-center relative py-4">
          <div className="absolute top-4 bottom-4 w-[1px] bg-void-border">
            <div
              className="w-[1px] bg-signal-500 absolute top-0 transition-all duration-300 ease-out"
              style={{ height: `${(activeSection / 4) * 100}%` }}
            />
          </div>
          {[0, 1, 2, 3, 4].map((index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              aria-label={`Scroll to Section 0${index + 1}`}
              className={`font-mono text-[10px] w-7 h-7 rounded-full flex items-center justify-center bg-void-950 border z-10 transition-all duration-300 interactive-hover focus-visible:outline ${
                activeSection === index
                  ? "border-signal-500 text-signal-500 scale-110 font-bold"
                  : "border-void-border text-ink-500 hover:border-ink-700 hover:text-paper-50"
              }`}
            >
              0{index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ── Smooth Scroll Wrapping Structure ── */}
      <div id="smooth-wrapper" className="w-full">
        <div id="smooth-content" className="w-full">

          {/* ── SECTION 1: HERO (VOID) ── */}
          <section
            id="section-1"
            className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-void-950 px-6 md:px-16 pb-12"
          >
            {/* 1A. Header / Logotype */}
            <header className="relative z-30 pt-8 flex justify-between items-center w-full">
              <Link href="/" className="flex items-center gap-2 interactive-hover group">
                <span className="brand-logo-dot w-2 h-2 rounded-full bg-signal-500 block" />
                <span className="brand-logo-segment font-display text-xl font-bold tracking-tight uppercase text-paper-50">
                  RED<span className="text-signal-500">DOT</span>
                </span>
              </Link>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden text-paper-50 p-2 focus:outline-none focus-visible:outline interactive-hover"
              >
                {hamburgerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Navigation Links for Desktop */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => scrollToSection(1)}
                  className="text-[10px] font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase cursor-pointer interactive-hover"
                >
                  Trust Model
                </button>
                <button
                  onClick={() => scrollToSection(2)}
                  className="text-[10px] font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase cursor-pointer interactive-hover"
                >
                  Cycle Phases
                </button>
                <button
                  onClick={() => scrollToSection(3)}
                  className="text-[10px] font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase cursor-pointer interactive-hover"
                >
                  RedDot.ai
                </button>
                <Link
                  href="/login"
                  className="text-[10px] font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase interactive-hover"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 border border-signal-500 text-[10px] font-mono tracking-widest text-signal-500 hover:bg-signal-500 hover:text-paper-50 transition-all rounded-[--radius-sm] uppercase interactive-hover shadow-[4px_4px_0px_rgba(224,16,40,0.2)]"
                >
                  Join RedDot
                </Link>
              </div>
            </header>

            {/* 1C. Mobile Menu Overlay */}
            {hamburgerOpen && (
              <div className="fixed inset-0 z-40 bg-void-950 border-b border-void-border pt-24 px-8 flex flex-col gap-6 md:hidden">
                <button
                  onClick={() => scrollToSection(1)}
                  className="text-left text-sm font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase py-2 border-b border-void-border"
                >
                  Trust Boundary
                </button>
                <button
                  onClick={() => scrollToSection(2)}
                  className="text-left text-sm font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase py-2 border-b border-void-border"
                >
                  Cycle Spectrum
                </button>
                <button
                  onClick={() => scrollToSection(3)}
                  className="text-left text-sm font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase py-2 border-b border-void-border"
                >
                  RedDot.ai AI Layer
                </button>
                <Link
                  href="/login"
                  className="text-left text-sm font-mono tracking-widest text-ink-500 hover:text-paper-50 transition-colors uppercase py-2 border-b border-void-border"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-center w-full px-6 py-3 bg-signal-500 text-sm font-mono tracking-widest text-paper-50 rounded-[--radius-sm] uppercase mt-4"
                >
                  Join RedDot
                </Link>
              </div>
            )}

            {/* 1D. Hero Background: Video (loaded after 2800ms) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {videoMounted && !videoError ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover opacity-70 transition-opacity duration-1000"
                >
                  <source src={heroSignalBloom} type="video/mp4" />
                </video>
              ) : (
                // Beautiful warm dark-gradient fallback before mounting or on failure
                <div className="w-full h-full bg-gradient-to-tr from-void-950 via-void-900 to-void-950 opacity-100" />
              )}
              {/* Mega Watermark Glyph */}
              <div className="text-mega absolute left-[-4vw] bottom-[-2vw] text-paper-50 opacity-4 select-none pointer-events-none">
                •
              </div>
            </div>

            {/* 1E. Main Left Content Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-24 md:mt-32 relative z-10 w-full h-full">
              <div className="lg:col-span-7 flex flex-col items-start space-y-8 max-w-xl">
                {/* Section Eyebrow with Opening Statement Brand Line */}
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-signal-500">01</span>
                  <div className="w-16 h-[1.5px] bg-signal-500/30" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">Built for HackHazards &apos;26</span>
                </div>

                {/* Splitting Headline Reveal */}
                <h1
                  ref={titleRef}
                  className="font-display text-[2.8rem] sm:text-[3.2rem] md:text-[4.5rem] leading-[0.95] tracking-tight text-paper-50 select-none"
                >
                  Your cycle, <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-signal-500 via-signal-400 to-signal-100">
                    private by design.
                  </span>
                </h1>

                {/* Fact/Security Copy */}
                <p className="text-[13px] md:text-[14px] text-ink-700 leading-[1.6] max-w-sm">
                  RedDot is a local-first cycle tracker. No cloud servers reading your logs, no data brokers selling your history — just fully encrypted, on-device intelligence that answers to you and no one else.
                </p>

                {/* Interactive CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href="/signup"
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="group px-6 py-3.5 bg-signal-500 hover:bg-signal-600 text-paper-50 font-semibold text-xs tracking-wider uppercase rounded-[--radius-sm] shadow-[4px_4px_0px_rgba(224,16,40,0.35)] flex items-center gap-3 transition-colors interactive-hover"
                  >
                    <span>Create Secure Account</span>
                    <Lock className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:-translate-y-[2px]" />
                  </Link>

                  <button
                    onClick={() => scrollToSection(1)}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="px-6 py-3.5 border border-void-border bg-void-900/40 text-paper-50 hover:bg-void-800/50 hover:border-ink-500 transition-colors rounded-[--radius-sm] text-xs font-semibold uppercase tracking-wider interactive-hover"
                  >
                    Explore the Trust Model
                  </button>
                </div>
              </div>

              {/* 1F. Right Sidebar Instrument Panel (Hidden on mobile) */}
              <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative">
                <div className="glass-panel p-8 rounded-[--radius-card] border border-void-border max-w-[340px] w-full space-y-6 sidebar-stagger-item">
                  <div className="flex justify-between items-center border-b border-void-border pb-4">
                    <span className="font-mono text-[9px] font-bold text-paper-50 tracking-widest">LIVE PHASE READING</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-pulse" />
                  </div>

                  {/* Shared radial progress ring */}
                  <div className="flex justify-center relative py-2">
                    <PhaseRing
                      currentPhase="follicular"
                      dayWithinPhase={4}
                      cycleDay={4}
                      size={180}
                      strokeWidth={10}
                      showLabel={false}
                      animate={!prefersReducedMotion}
                    >
                      {/* Instrument labels */}
                      <div className="absolute text-center flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
                        <span className="text-3xl font-bold tracking-tight font-mono text-paper-50">04</span>
                        <p className="text-[8px] text-ink-500 uppercase tracking-widest font-mono font-medium">Follicular Phase</p>
                        <p className="text-[7.5px] text-signal-500 font-mono tracking-wider font-semibold">Day 4 of 9</p>
                      </div>
                    </PhaseRing>
                  </div>

                  {/* On-device stats instrument */}
                  <div className="space-y-3 pt-2 text-[10px] font-mono text-ink-500">
                    <div className="flex justify-between items-center">
                      <span>Encryption</span>
                      <span className="text-paper-50 font-medium">AES-256-GCM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Storage</span>
                      <span className="text-paper-50 font-medium">100% Local</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Metrics Sync</span>
                      <span className="text-paper-50 font-medium">Zero-Knowledge</span>
                    </div>
                  </div>

                  {/* View details widget */}
                  <button
                    onClick={() => scrollToSection(2)}
                    className="w-full flex justify-between items-center border-t border-void-border pt-4 font-mono text-[9px] text-paper-50 tracking-widest hover:text-signal-500 transition-colors interactive-hover group"
                  >
                    <span>EXPLORE METRICS</span>
                    <span className="w-5 h-5 rounded-full border border-void-border flex items-center justify-center group-hover:bg-signal-500 group-hover:border-signal-500 transition-all">
                      <Plus className="w-3 h-3 text-paper-50 transition-transform duration-300 group-hover:rotate-90" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 1G. Scroll Cue */}
            <div className="scroll-cue-fade flex items-center gap-4 relative z-10 pt-16 md:pt-0">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-500">Scroll to explore</span>
              <div className="w-6 h-6 rounded-full border border-void-border flex items-center justify-center">
                <span className="w-1 h-2 rounded-full bg-signal-500 animate-bounce" />
              </div>
            </div>
          </section>


          {/* ── SECTION 2: TRUST BOUNDARY (PAPER) ── */}
          <section
            id="section-2"
            data-theme="paper"
            className="relative w-full min-h-screen bg-paper-50 text-paper-ink-900 pt-28 pb-20 px-6 md:px-16 z-20 flex flex-col justify-between"
          >
            <div className="max-w-5xl mx-auto w-full space-y-16">
              {/* 2A. Label */}
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-paper-ink-600">[ 02 ]</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper-ink-900">Absolute Trust Boundary</span>
              </div>

              {/* 2B. Heading */}
              <h2 className="trust-heading-reveal font-display text-[1.8rem] sm:text-[2.2rem] md:text-[3.2rem] leading-[1.1] max-w-[900px] text-left select-none font-medium">
                Every symptom, every note, every log — encrypted on your device before it ever reaches a server.
              </h2>

              {/* 2C. Rotated Marquee Ribbon */}
              <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4 border-y border-paper-ink-900/10 select-none bg-paper-50 rotate-[-1deg]">
                <div className="flex whitespace-nowrap overflow-hidden">
                  <div className="animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] flex shrink-0 gap-8 pr-8 font-mono text-[10px] font-medium tracking-[0.25em] text-paper-ink-600 uppercase">
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                  </div>
                  <div className="animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] flex shrink-0 gap-8 pr-8 font-mono text-[10px] font-medium tracking-[0.25em] text-paper-ink-600 uppercase" aria-hidden="true">
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                    <span>AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •</span>
                  </div>
                </div>
              </div>

              {/* 2D. Action Pills */}
              <div className="flex flex-wrap gap-3 pt-8">
                {[
                  { icon: Smartphone, text: "Local-First" },
                  { icon: EyeOff, text: "Zero-Knowledge" },
                  { icon: Lock, text: "AES-256-GCM" },
                  { icon: Ban, text: "No Trackers" },
                  { icon: Github, text: "Open Source" },
                ].map((pill, idx) => {
                  const Icon = pill.icon;
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 rounded-full border border-paper-ink-900/15 px-4 py-2 text-[10px] font-mono tracking-wider font-semibold uppercase bg-white hover:bg-paper-ink-900 hover:text-paper-50 transition-colors select-none interactive-hover"
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{pill.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* 2E. Three Cards */}
              <div className="trust-card-grid grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-stretch">
                {[
                  {
                    title: "Secure Browser Sandbox",
                    tag: "Decrypted",
                    tagStyle: "bg-green-50 text-green-700 border border-green-200",
                    desc: "Plaintext cycle data, mood scores, and symptoms exist exclusively in your browser memory during active sessions.",
                    footer: "Local Web Crypto API",
                    icon: Smartphone,
                  },
                  {
                    title: "AES-GCM-256 Barrier",
                    tag: "Zero-Knowledge",
                    tagStyle: "bg-signal-100 text-signal-500 border border-signal-500/20",
                    desc: "Before writing to local disk or syncing, payload fields are encrypted with your password-derived key. No unencrypted logs leave this boundary.",
                    footer: "Plaintext Locked",
                    icon: Lock,
                  },
                  {
                    title: "Opaque Database",
                    tag: "Cloud Storage / Ciphertext",
                    tagStyle: "bg-paper-100 text-paper-ink-600 border border-black/5",
                    desc: "Neon PostgreSQL only stores base64-encoded encrypted blobs and initialization vectors. If subpoenaed, we hand over unreadable noise.",
                    footer: "Cloud Database",
                    icon: Database,
                  },
                ].map((card, idx) => {
                  const CardIcon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="trust-card-item bg-white border border-paper-ink-900/10 rounded-[--radius-card] p-8 flex flex-col justify-between shadow-sm relative group interactive-hover hover:border-paper-ink-900/30 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] font-medium tracking-widest text-paper-ink-600 uppercase">MODULE 0{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded-[--radius-sm] text-[8px] font-mono ${card.tagStyle}`}>
                            {card.tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-paper-ink-900 tracking-tight">{card.title}</h3>
                        <p className="text-xs text-paper-ink-600 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                      <div className="mt-8 flex items-center gap-2 border-t border-black/5 pt-4 text-[10px] font-mono text-paper-ink-600">
                        <CardIcon className="w-3.5 h-3.5 text-signal-500 stroke-[1.5]" />
                        <span>{card.footer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2F. Spacer for bleed overlapping */}
            <div className="min-h-[40px] md:min-h-[60px]" />

            {/* 2G. Bottom Text Row */}
            <div className="max-w-5xl mx-auto w-full hidden md:flex justify-between items-center font-mono text-[9px] text-paper-ink-600 tracking-widest select-none">
              <span>WE DON&apos;T JUST STORE DATA.</span>
              <span>PRIVACY © 2026</span>
            </div>
          </section>


          {/* ── SECTION 3: SPECTRUM (VOID) ── */}
          <section
            id="section-3"
            className="relative w-full bg-void-950 text-paper-50 pb-24 z-30"
          >
            {/* 3A. Overlapping Hero Art: core-orb.png */}
            <div className="relative w-full pointer-events-none h-0 z-0">
              {!orbError ? (
                <img
                  ref={orbRef}
                  src={coreOrb}
                  alt=""
                  onError={() => setOrbError(true)}
                  className="absolute left-1/2 w-[160vw] md:w-[1000px] max-w-none pointer-events-none opacity-0 select-none z-0"
                />
              ) : (
                // Overlapping glowing fallback
                <div className="absolute left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-signal-500/10 via-transparent to-transparent -translate-y-[80%] pointer-events-none" />
              )}
            </div>

            {/* 3B. Heading Area */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-16 pt-32 md:pt-48 space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-void-border pb-12">
                <div className="space-y-6 max-w-xl">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-ink-500">[ 03 ]</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper-50">Cycle Spectrum</span>
                  </div>
                  {/* Headline with inline SVG cluster */}
                  <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] md:text-[3.2rem] leading-[1.1] font-light">
                    Charted from thousands of private signals{" "}
                    <span className="inline-flex items-center gap-1.5 mx-1 select-none pointer-events-none">
                      <span className="w-8 h-8 rounded-full border border-void-border bg-black flex items-center justify-center text-signal-500">
                        <Activity size={14} className="stroke-[1.5]" />
                      </span>
                      <span className="w-8 h-8 rounded-full border border-void-border bg-black flex items-center justify-center text-paper-50">
                        <Sparkles size={14} className="stroke-[1.5]" />
                      </span>
                      <span className="w-8 h-8 rounded-full border border-void-border bg-black flex items-center justify-center text-ink-500">
                        <ShieldCheck size={14} className="stroke-[1.5]" />
                      </span>
                    </span>{" "}
                    & turned into patterns only you can see.
                  </h2>
                </div>

                <div className="space-y-6 md:text-right flex flex-col md:items-end">
                  <p className="font-mono text-[9px] text-ink-500 tracking-widest leading-relaxed max-w-xs">
                    WE DON&apos;T JUST LOG SYMPTOMS <br /> WE PROTECT YOUR STORY
                  </p>
                  <div className="flex flex-wrap gap-2 select-none">
                    {["Private", "Accurate", "Empowering"].map((pill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 border border-void-border rounded-full font-mono text-[9px] text-ink-300 tracking-wider hover:border-paper-50 hover:text-paper-50 transition-colors"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3C. Two-Column Panel (Pins on Desktop) */}
              <div
                ref={panelRef}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 items-start relative w-full"
              >
                {/* Left Panel: DecryptReveal */}
                <div className="md:col-span-5 flex flex-col justify-between h-[380px] md:h-[450px] bg-void-900 border border-void-border rounded-[--radius-card] p-8 relative overflow-hidden select-none">
                  {/* Top Glyphs */}
                  <div className="flex justify-between items-center font-mono text-[10px] text-ink-500">
                    <span className="tracking-widest">DECRYPTING CYCLE</span>
                    <span className="text-signal-500">• • •</span>
                  </div>

                  {/* Decrypting Image Viewport */}
                  <div className="flex-1 flex items-center justify-center p-4 relative carousel-image-trigger">
                    {/* Dark Lighten Blend image */}
                    {!phaseErrors[activePhase] ? (
                      <DecryptReveal
                        src={phases[activePhase].image}
                        alt={phases[activePhase].name}
                        className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] mix-blend-lighten object-contain transition-transform duration-500 scale-100 hover:scale-105"
                      />
                    ) : (
                      // Section-colored elegant fallback on error
                      <div
                        className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full opacity-60 filter blur-xl animate-pulse"
                        style={{ backgroundColor: phases[activePhase].color }}
                      />
                    )}
                  </div>

                  {/* Bottom Counter */}
                  <div className="flex justify-between items-center font-mono text-xs pt-4 border-t border-void-border">
                    <span className="text-ink-500">ACTIVE STATE</span>
                    <span className="font-bold text-paper-50">0{activePhase + 1} / 04</span>
                  </div>
                </div>

                {/* Right Panel: Interactive Phase List */}
                <div className="md:col-span-7 flex flex-col justify-between min-h-[380px] md:h-[450px] pl-0 md:pl-8 py-2">
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] tracking-widest text-ink-500 uppercase">
                      Understand your body. Protect your data.
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-pulse" />
                      <span className="font-mono text-[11px] font-bold text-signal-500 tracking-widest">
                        PHASE 0{activePhase + 1} ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Vertically Alternating List */}
                  <div className="space-y-4 pt-6 flex-1 flex flex-col justify-center">
                    {phases.map((phase, idx) => {
                      const isActive = activePhase === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePhaseClick(idx)}
                          className="w-full text-left flex justify-between items-center py-4 border-b border-void-border group interactive-hover outline-none"
                        >
                          <div className="space-y-1 pr-6 flex-1">
                            <h3
                              className={`text-lg font-bold tracking-tight transition-colors duration-300 font-display ${
                                isActive ? "text-paper-50" : "text-void-border group-hover:text-ink-500"
                              }`}
                            >
                              {phase.name}
                            </h3>
                            <p
                              className={`text-xs leading-relaxed transition-all duration-300 ${
                                isActive ? "text-ink-500 opacity-100 max-h-16 mt-1" : "opacity-0 max-h-0 overflow-hidden"
                              }`}
                            >
                              {phase.desc}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-[9px] tracking-wider transition-colors duration-300 ${
                                isActive ? "text-signal-500" : "text-void-border"
                              }`}
                            >
                              {phase.label}
                            </span>
                            <ArrowUpRight
                              className={`w-4 h-4 transition-all duration-300 ${
                                isActive
                                  ? "text-paper-50 translate-x-0.5 -translate-y-0.5"
                                  : "text-void-border opacity-30 group-hover:opacity-100"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Panel Footer */}
                  <div className="pt-6 font-mono text-[9px] text-ink-500 uppercase tracking-widest border-t border-void-border mt-4 flex justify-between">
                    <span>DECODING YOUR BODY&apos;S PATTERNS</span>
                    <span>100% SECURE BOUNDARY</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ── SECTION 4: INTELLIGENCE (PAPER) ── */}
          <section
            id="section-4"
            data-theme="paper"
            className="relative w-full bg-paper-50 text-paper-ink-900 py-32 px-6 md:px-16 z-20"
          >
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column Copy */}
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-paper-ink-600">[ 04 ]</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper-ink-900">On-Demand Intelligence</span>
                </div>

                <div className="inline-flex p-3 rounded-[--radius-md] bg-signal-500 text-paper-50 shadow-sm select-none">
                  <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                </div>

                <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] md:text-[3.2rem] leading-[1.1] select-none font-medium">
                  RedDot.ai
                </h2>

                <p className="text-xs sm:text-sm text-paper-ink-600 leading-relaxed font-light">
                  Ask RedDot.ai anything about your cycle. Upload a lab report, flag an anomaly, or ask why a metric moved — the assistant reasons over your encrypted data only for the length of that one question.
                </p>

                {/* Disclosure Strip */}
                <div className="bg-black/5 border-l-2 border-signal-500 px-5 py-4 font-mono text-[10px] text-paper-ink-600 leading-normal rounded-r-[--radius-sm] select-none">
                  <strong>🔒 Disclosed transparency:</strong> plaintext leaves the sandbox over secure HTTPS <em>only</em> for the duration of the request to fetch answers. Nothing is saved on the AI servers.
                </div>
              </div>

              {/* Right Column: Chat Mockup staged like a device shot */}
              <div className="lg:col-span-7 flex justify-center w-full">
                <div className="chat-mockup-reveal w-full max-w-[460px] bg-void-950 rounded-[--radius-card] border border-void-border shadow-2xl flex flex-col h-[380px] overflow-hidden select-none">
                  {/* Browser Header Bar */}
                  <div className="bg-void-900 px-4 py-3 border-b border-void-border flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-signal-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-ink-500/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-paper-50/20" />
                    </div>
                    <span className="text-[9px] font-mono text-ink-500 tracking-wider font-semibold">REDDOT.AI ASSISTANT</span>
                    <span className="text-[9px] font-mono text-signal-500 px-2 py-0.5 rounded bg-signal-500/10 border border-signal-500/20 font-bold">Secure Socket</span>
                  </div>

                  {/* Message List Preview */}
                  <div className="flex-1 p-6 space-y-5 overflow-y-auto text-xs font-sans">
                    {/* User Message */}
                    <div className="space-y-1 text-right flex flex-col items-end">
                      <span className="text-[8px] font-mono text-ink-500">You</span>
                      <div className="bg-signal-500/15 text-paper-50 border border-signal-500/20 rounded-[--radius-md] p-3 inline-block max-w-[85%] text-left">
                        Can you explain why my energy levels dropped on day 24 of this cycle?
                      </div>
                    </div>

                    {/* AI Message */}
                    <div className="space-y-1 flex flex-col items-start">
                      <span className="text-[8px] font-mono text-signal-500 font-bold">RedDot.ai</span>
                      <div className="bg-void-900/80 text-ink-300 border border-void-border rounded-[--radius-md] p-3 inline-block max-w-[85%] leading-relaxed">
                        Based on your logged data, Day 24 falls in your <strong>Luteal Phase</strong> (progesterone surge). A dip in energy is highly common during this transition. I noticed your sleep scale dropped to 2/5 on days 22-23, which likely amplified this effect.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ── SECTION 5: FINAL CTA + FOOTER (VOID) ── */}
          <section
            id="section-5"
            className="relative w-full bg-void-950 text-paper-50 pt-32 pb-16 text-center px-6 md:px-16 border-t border-void-border flex flex-col justify-between min-h-[80vh]"
          >
            <div className="max-w-xl mx-auto space-y-10 my-auto">
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-xs text-ink-500">[ 05 ]</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper-50">Ready?</span>
              </div>

              {/* Headline */}
              <h2 className="font-display text-[2.2rem] sm:text-[2.6rem] md:text-[3.6rem] font-bold tracking-tight leading-none text-paper-50 select-none">
                Ready for a better standard?
              </h2>

              <p className="text-[13px] md:text-[14px] text-ink-500 leading-relaxed max-w-sm mx-auto font-light">
                Get absolute privacy and high-fidelity cycle tracking today.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="w-full sm:w-auto px-8 py-4 bg-signal-500 hover:bg-signal-600 text-paper-50 font-bold text-xs tracking-wider uppercase rounded-[--radius-sm] shadow-[4px_4px_0px_rgba(224,16,40,0.35)] transition-colors interactive-hover"
                >
                  Sign Up (Key Notice Required)
                </Link>
                <Link
                  href="/login"
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="w-full sm:w-auto px-8 py-4 border border-void-border bg-void-900/40 text-paper-50 hover:bg-void-800/50 hover:border-ink-500 transition-colors rounded-[--radius-sm] text-xs font-bold uppercase tracking-wider interactive-hover"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Footer Copy */}
            <div className="pt-20 font-mono text-ink-500/50 space-y-2 select-none max-w-md mx-auto">
              <p>RedDot is an open-source demonstration for HackHazards &apos;26.</p>
              <p>© 2026 RedDot Team. Encryptable only with your secret password.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
