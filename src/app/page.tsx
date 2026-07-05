"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Cpu, MessageSquare, ChevronRight, Lock, EyeOff, Sparkles, Database } from "lucide-react";

// Register ScrollTrigger client-side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initial Hero Intro Animation
    const ctx = gsap.context(() => {
      // Draw PhaseRing SVG stroke
      if (ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { strokeDashoffset: 628 }, // 2 * Math.PI * 100
          { strokeDashoffset: 150, duration: 1.8, ease: "power4.out" }
        );
      }

      // Title character reveal-style fade up
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
        );
      }

      // 2. Scroll-triggered animations for sections
      // Parallax effect on floating blur blobs
      gsap.to(".blur-blob-1", {
        yPercent: -20,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.to(".blur-blob-2", {
        yPercent: 30,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      // Fade-in sections
      const sections = gsap.utils.toArray<HTMLElement>(".scroll-section");
      sections.forEach((sec) => {
        gsap.fromTo(
          sec.querySelectorAll(".reveal-item"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: {
              trigger: sec,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // SVG flow animation path in Trust section
      gsap.fromTo(
        ".flow-line",
        { strokeDashoffset: 100 },
        {
          strokeDashoffset: 0,
          duration: 3,
          repeat: -1,
          ease: "linear",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-void text-paper relative space-grid overflow-hidden">
      {/* ── Ambient Background Blobs ── */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-signal/10 blur-[120px] pointer-events-none blur-blob-1" />
      <div className="absolute top-[50%] right-[-10%] w-[600px] h-[600px] rounded-full bg-signal-deep/15 blur-[150px] pointer-events-none blur-blob-2" />
      <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-paper/5 blur-[120px] pointer-events-none" />

      {/* ── Fixed Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
          <span className="font-display text-xl font-bold tracking-tight uppercase">
            Red<span className="text-signal">Dot</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-fog hover:text-paper transition-colors tracking-wider uppercase font-mono">
            Privacy Model
          </Link>
          <Link href="/login" className="text-xs text-fog hover:text-paper transition-colors tracking-wider uppercase font-mono">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 text-xs uppercase tracking-wider font-mono rounded bg-signal text-paper hover:bg-signal-deep transition-all duration-300 shadow-[0_0_15px_rgba(224,16,42,0.3)]"
          >
            Join RedDot
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div ref={heroTextRef} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-ash border border-white/5 text-[10px] text-signal font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Built for HackHazards &apos;26
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
              Your cycle, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal to-paper">
                private by design.
              </span>
            </h1>
            <p className="text-fog text-lg md:text-xl max-w-xl font-light leading-relaxed">
              RedDot is a local-first menstrual tracker. No cloud servers reading your logs, no data brokers selling your records. Fully encrypted client-side, with on-demand private AI assistance.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded bg-signal text-paper font-semibold hover:bg-signal-deep transition-all duration-300 shadow-[0_0_30px_rgba(224,16,42,0.4)]"
              >
                Create Secure Account
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#encryption-details"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-ash/60 border border-white/10 text-paper font-medium hover:bg-ash transition-colors"
              >
                Explore Trust Model
              </a>
            </div>
          </div>

          {/* Interactive PhaseRing SVG */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 rounded-full border border-signal/10 scale-105 animate-pulse-slow pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />

              {/* Vector path */}
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 240 240">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0102A" />
                    <stop offset="30%" stopColor="#D9C9C7" />
                    <stop offset="60%" stopColor="#FAFAFA" />
                    <stop offset="100%" stopColor="#4A3536" />
                  </linearGradient>
                </defs>
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="rgba(255,255,255,0.02)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  ref={ringRef}
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="url(#ringGrad)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="628"
                  strokeLinecap="round"
                />
              </svg>

              {/* Core metrics */}
              <div className="absolute text-center space-y-1">
                <span className="text-5xl font-bold tracking-tighter font-mono text-paper">09</span>
                <p className="text-[10px] text-fog uppercase tracking-widest font-mono">Follicular Phase</p>
                <p className="text-[9px] text-signal font-mono">Day 4 of 9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Encryption / Trust Boundary ── */}
      <section id="encryption-details" className="scroll-section py-24 px-6 md:px-12 border-t border-white/5 relative bg-ash/20">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex p-2 rounded bg-signal/10 border border-signal/20 text-signal">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="reveal-item text-3xl md:text-5xl font-bold tracking-tight">
              Absolute Trust Boundary
            </h2>
            <p className="reveal-item text-fog text-sm md:text-base font-light">
              We leverage client-side PBKDF2 key derivation & AES-GCM-256 encryption. Raw logs never touch the cloud in plaintext.
            </p>
          </div>

          {/* Interactive Trust Diagram */}
          <div className="reveal-item grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Box 1: Browser */}
            <div className="glass-panel p-8 rounded-lg relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-signal uppercase tracking-wider">Device Level</span>
                  <div className="px-2 py-0.5 rounded bg-green-950/40 text-green-400 border border-green-500/20 text-[9px] font-mono">Decrypted</div>
                </div>
                <h3 className="text-xl font-bold text-paper">Secure Browser Sandbox</h3>
                <p className="text-xs text-fog leading-relaxed">
                  Plaintext cycle data, mood scores, and symptoms exist exclusively in your browser memory during active sessions.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-4 text-xs font-mono text-fog">
                <Cpu className="w-4 h-4 text-signal" /> Local Web Crypto API
              </div>
            </div>

            {/* Box 2: Encryption Step */}
            <div className="glass-panel p-8 rounded-lg border-signal/20 relative bg-gradient-to-b from-signal-deep/10 to-transparent flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-signal uppercase tracking-wider">Zero-Knowledge</span>
                <h3 className="text-xl font-bold text-paper">AES-GCM-256 Barrier</h3>
                <p className="text-xs text-fog leading-relaxed">
                  Before writing to local disk or syncing, payload fields are encrypted with your password-derived key. No unencrypted logs leave this boundary.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-4 text-xs font-mono text-fog">
                <EyeOff className="w-4 h-4 text-signal" /> Plaintext Locked
              </div>
            </div>

            {/* Box 3: Sync Storage */}
            <div className="glass-panel p-8 rounded-lg relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-fog/60 uppercase tracking-wider">Cloud Storage</span>
                  <div className="px-2 py-0.5 rounded bg-signal/10 text-signal border border-signal/20 text-[9px] font-mono">Ciphertext Only</div>
                </div>
                <h3 className="text-xl font-bold text-paper">Opaque Database</h3>
                <p className="text-xs text-fog leading-relaxed">
                  Neon PostgreSQL only stores base64-encoded encrypted blobs and initialization vectors. If subpoenaed, we hand over unreadable noise.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-4 text-xs font-mono text-fog">
                <Database className="w-4 h-4 text-fog/60" /> Cloud Database
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: The Four Phases ── */}
      <section className="scroll-section py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-lg space-y-3">
            <span className="text-xs font-mono text-signal uppercase tracking-widest">Interactive Walkthrough</span>
            <h2 className="reveal-item text-3xl md:text-5xl font-bold tracking-tight">The Cycle Spectrum</h2>
            <p className="reveal-item text-fog text-sm font-light">
              Your body is a gradient, not a collection of flat charts. Our design represents this continuous biological flow.
            </p>
          </div>

          <div className="reveal-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phase 1 */}
            <div className="glass-panel p-6 rounded-md hover:border-signal/30 transition-all duration-300 group">
              <div className="w-8 h-8 rounded bg-[#E0102A] mb-4 flex items-center justify-center text-xs font-mono font-bold text-paper">M</div>
              <h3 className="font-bold text-paper text-sm">Menstrual Phase</h3>
              <p className="text-xs text-fog mt-2 font-light">Peak saturation. Focuses on energy conservation, rest, and protective logs.</p>
              <div className="mt-4 text-[10px] font-mono text-[#E0102A] tracking-wider uppercase">phase-signal</div>
            </div>

            {/* Phase 2 */}
            <div className="glass-panel p-6 rounded-md hover:border-white/20 transition-all duration-300 group">
              <div className="w-8 h-8 rounded bg-[#D9C9C7] mb-4 flex items-center justify-center text-xs font-mono font-bold text-void">F</div>
              <h3 className="font-bold text-paper text-sm">Follicular Phase</h3>
              <p className="text-xs text-fog mt-2 font-light">Energy starts rising. Data service traces gradual metric shifts.</p>
              <div className="mt-4 text-[10px] font-mono text-[#D9C9C7] tracking-wider uppercase">phase-rise</div>
            </div>

            {/* Phase 3 */}
            <div className="glass-panel p-6 rounded-md hover:border-white/30 transition-all duration-300 group">
              <div className="w-8 h-8 rounded bg-[#FAFAFA] border border-signal mb-4 flex items-center justify-center text-xs font-mono font-bold text-void">O</div>
              <h3 className="font-bold text-paper text-sm">Ovulation Phase</h3>
              <p className="text-xs text-fog mt-2 font-light">Peak lightness. Cycle predictions show key markers clearly.</p>
              <div className="mt-4 text-[10px] font-mono text-[#FAFAFA] tracking-wider uppercase">phase-peak</div>
            </div>

            {/* Phase 4 */}
            <div className="glass-panel p-6 rounded-md hover:border-white/10 transition-all duration-300 group">
              <div className="w-8 h-8 rounded bg-[#4A3536] mb-4 flex items-center justify-center text-xs font-mono font-bold text-paper">L</div>
              <h3 className="font-bold text-paper text-sm">Luteal Phase</h3>
              <p className="text-xs text-fog mt-2 font-light">Charcoal descending values. AI prepares your pre-period patterns.</p>
              <div className="mt-4 text-[10px] font-mono text-[#4A3536] tracking-wider uppercase">phase-fade</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: AI Assistant Mock ── */}
      <section className="scroll-section py-24 px-6 md:px-12 border-t border-white/5 relative bg-ash/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex p-2 rounded bg-signal/10 border border-signal/20 text-signal">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="reveal-item text-3xl md:text-5xl font-bold tracking-tight">
              On-Demand Intelligence
            </h2>
            <p className="reveal-item text-fog text-sm md:text-base font-light leading-relaxed">
              Interact with **RedDot.ai**, our built-in assistant. Upload lab reports, ask about cycle anomalies, or review pattern correlations.
            </p>
            <div className="reveal-item bg-void p-4 rounded border border-white/5 text-[11px] font-mono text-fog/60 leading-normal">
              <strong>🔒 Disclosed transparency:</strong> plaintext data leaves the sandbox over secure HTTPS *only* for the duration of the request to fetch answers. Nothing is saved on the AI servers.
            </div>
          </div>

          <div className="reveal-item lg:col-span-7">
            <div className="glass-panel rounded-lg overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[350px]">
              {/* Browser Panel Header */}
              <div className="bg-ash px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-signal/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-fog/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-paper/20" />
                </div>
                <span className="text-[10px] font-mono text-fog/60 tracking-wider">REDDOT.AI ASSISTANT</span>
                <span className="text-[10px] font-mono text-[#E0102A] px-2 py-0.5 rounded bg-signal/10 border border-signal/20">Secure Socket</span>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
                {/* Message 1 */}
                <div className="space-y-1 text-right">
                  <span className="text-[9px] font-mono text-fog/40">You</span>
                  <div className="bg-signal/15 text-paper border border-signal/20 rounded-md p-3 inline-block max-w-[80%]">
                    Can you explain why my energy levels dropped on day 24 of this cycle?
                  </div>
                </div>

                {/* Message 2 */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-signal">RedDot.ai</span>
                  <div className="bg-ash/70 text-paper border border-white/5 rounded-md p-3 inline-block max-w-[80%] leading-relaxed">
                    Based on your logged data, Day 24 falls in your **Luteal Phase** (progesterone surge). A dip in energy is highly common during this transition. I noticed your sleep scale dropped to 2/5 on days 22-23, which likely amplified this effect.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Footer Section ── */}
      <section className="py-24 text-center px-6 border-t border-white/5 relative bg-gradient-to-t from-signal-deep/10 to-transparent">
        <div className="max-w-xl mx-auto space-y-8">
          <h2 className="text-4xl font-bold tracking-tight text-paper">
            Ready for a better standard?
          </h2>
          <p className="text-fog text-sm leading-relaxed max-w-md mx-auto">
            Get absolute privacy and high-fidelity cycle tracking today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded bg-signal text-paper font-semibold hover:bg-signal-deep transition-all duration-300 shadow-[0_0_20px_rgba(224,16,42,0.3)] text-sm uppercase tracking-wider font-mono"
            >
              Sign Up (Key Notice Required)
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded bg-ash text-paper border border-white/5 font-semibold hover:bg-ash/80 transition-all text-sm uppercase tracking-wider font-mono"
            >
              Sign In
            </Link>
          </div>
          <div className="pt-12 text-[10px] text-fog/40 font-mono space-y-2">
            <p>RedDot is an open-source demonstration for HackHazards &apos;26.</p>
            <p>© 2026 RedDot Team. Decryptable only with your secret password.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
