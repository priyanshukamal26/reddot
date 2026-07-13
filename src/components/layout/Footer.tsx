'use client';

import React from 'react';

const ConstellationIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-16 h-16 text-[#e51d38] mb-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Nodes */}
    <circle cx="30" cy="30" r="4" fill="currentColor" />
    <circle cx="70" cy="30" r="4" fill="currentColor" />
    <circle cx="50" cy="50" r="4" fill="currentColor" />
    <circle cx="30" cy="70" r="4" fill="currentColor" />
    <circle cx="70" cy="70" r="4" fill="currentColor" />
    <circle cx="50" cy="20" r="4" fill="currentColor" />
    <circle cx="50" cy="80" r="4" fill="currentColor" />
    
    {/* Connecting lines */}
    <line x1="30" y1="30" x2="70" y2="30" />
    <line x1="30" y1="30" x2="50" y2="50" />
    <line x1="70" y1="30" x2="50" y2="50" />
    <line x1="30" y1="70" x2="50" y2="50" />
    <line x1="70" y1="70" x2="50" y2="50" />
    <line x1="30" y1="70" x2="70" y2="70" />
    
    <line x1="50" y1="20" x2="30" y2="30" />
    <line x1="50" y1="20" x2="70" y2="30" />
    <line x1="50" y1="80" x2="30" y2="70" />
    <line x1="50" y1="80" x2="70" y2="70" />
    
    <line x1="50" y1="20" x2="50" y2="50" />
    <line x1="50" y1="80" x2="50" y2="50" />
  </svg>
);

const ChipIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-16 h-16 text-[#e51d38] mb-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer chip body */}
    <rect x="25" y="25" width="50" height="50" rx="6" />
    {/* Inner detail */}
    <rect x="38" y="38" width="24" height="24" rx="3" />
    
    {/* Circuit traces/legs */}
    {/* Top legs */}
    <line x1="35" y1="25" x2="35" y2="15" />
    <circle cx="35" cy="15" r="2" fill="currentColor" />
    <line x1="50" y1="25" x2="50" y2="12" />
    <circle cx="50" cy="12" r="2" fill="currentColor" />
    <line x1="65" y1="25" x2="65" y2="15" />
    <circle cx="65" cy="15" r="2" fill="currentColor" />

    {/* Bottom legs */}
    <line x1="35" y1="75" x2="35" y2="85" />
    <circle cx="35" cy="85" r="2" fill="currentColor" />
    <line x1="50" y1="75" x2="50" y2="88" />
    <circle cx="50" cy="88" r="2" fill="currentColor" />
    <line x1="65" y1="75" x2="65" y2="85" />
    <circle cx="65" cy="85" r="2" fill="currentColor" />

    {/* Left legs */}
    <line x1="25" y1="35" x2="15" y2="35" />
    <circle cx="15" cy="35" r="2" fill="currentColor" />
    <line x1="25" y1="50" x2="12" y2="50" />
    <circle cx="12" cy="50" r="2" fill="currentColor" />
    <line x1="25" y1="65" x2="15" y2="65" />
    <circle cx="15" cy="65" r="2" fill="currentColor" />

    {/* Right legs */}
    <line x1="75" y1="35" x2="85" y2="35" />
    <circle cx="85" cy="35" r="2" fill="currentColor" />
    <line x1="75" y1="50" x2="88" y2="50" />
    <circle cx="88" cy="50" r="2" fill="currentColor" />
    <line x1="75" y1="65" x2="85" y2="65" />
    <circle cx="85" cy="65" r="2" fill="currentColor" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full bg-[#070707] text-[#8e8e8f] border-t border-white/5 relative z-20">
      {/* Top Banner: Data Sovereignty */}
      <div className="w-full py-16 px-6 border-b border-white/5 flex flex-col items-center text-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#070707]">
        <h2 className="font-display text-3xl sm:text-4xl text-white font-medium mb-3 tracking-tight">
          Data Sovereignty.
        </h2>
        <p className="text-sm text-[#5e5e60] max-w-md leading-relaxed font-light">
          Your biological intelligence belongs to you. No cloud. No compromise.
        </p>
      </div>

      {/* Main Footer: 3 Columns */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 items-start text-center">
        {/* Creator 1: Shambhavi */}
        <div className="flex flex-col items-center">
          <ConstellationIcon />
          <h3 className="text-sm font-mono tracking-[0.2em] font-semibold text-white uppercase mb-1">
            Shambhavi Nayak
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-[#5e5e60] uppercase mb-4">
            Creative Developer
          </p>
          <div className="flex gap-3 text-xs font-mono">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e5e60] hover:text-[#e51d38] transition-colors"
            >
              [<span className="px-0.5">in</span>]
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e5e60] hover:text-[#e51d38] transition-colors"
            >
              [<span className="px-0.5">gh</span>]
            </a>
          </div>
        </div>

        {/* Center: RedDot Branding */}
        <div className="flex flex-col items-center h-full justify-center py-2">
          <h2 className="font-display text-4xl text-white font-bold tracking-[0.15em] uppercase mb-4 select-none">
            RED<span className="text-[#e51d38]">DOT</span>
          </h2>
          <div className="text-[10px] font-mono tracking-[0.25em] text-[#5e5e60] uppercase leading-relaxed max-w-xs">
            <p className="mb-1">Engineered for privacy.</p>
            <p className="mb-1">Designed for you.</p>
            <p>Connect with the creators.</p>
          </div>
        </div>

        {/* Creator 2: Priyanshu */}
        <div className="flex flex-col items-center">
          <ChipIcon />
          <h3 className="text-sm font-mono tracking-[0.2em] font-semibold text-white uppercase mb-1">
            Priyanshu Kamal
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-[#5e5e60] uppercase mb-4">
            Full Stack Engineer
          </p>
          <div className="flex gap-3 text-xs font-mono">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e5e60] hover:text-[#e51d38] transition-colors"
            >
              [<span className="px-0.5">in</span>]
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e5e60] hover:text-[#e51d38] transition-colors"
            >
              [<span className="px-0.5">gh</span>]
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono tracking-wider text-[#5e5e60] uppercase">
          <div>
            © 2026 RedDot Team. Open-source demonstration for HackHazards &apos;26.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e51d38] animate-pulse" />
              encrypted_stream_active
            </span>
            <span>v1.0.4-beta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
