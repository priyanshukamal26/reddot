'use client';

import { motion } from 'motion/react';
import { Pen, Calendar, TrendingUp, Send, BrainCircuit, Droplets, Smile, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TrackingPage() {
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-start pt-10">
      
      {/* Central Circular Progress */}
      <div className="relative mb-16 flex justify-center items-center">
        {/* Glow behind */}
        <div className="absolute w-[300px] h-[300px] bg-[#e51d38] opacity-20 blur-[80px] rounded-full mix-blend-screen" />
        
        {/* SVG Circle */}
        <svg className="w-[340px] h-[340px] transform -rotate-90" viewBox="0 0 340 340">
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
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-6xl font-serif tracking-tighter mb-1"
          >
            04
          </motion.h2>
          <p className="text-gray-400 text-sm tracking-wide mb-1">Day 4 of 9</p>
          <p className="text-[#e51d38] font-medium tracking-wide">Follicular Phase</p>
        </div>

        {/* Technical Decorators */}
        <div className="absolute -left-12 top-1/2 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          <div className="w-8 h-[1px] bg-white/20" />
          <span>75%</span>
        </div>
        <div className="absolute -right-12 top-[30%] flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          <span>29%</span>
          <div className="w-8 h-[1px] bg-white/20" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
        {/* Log Today Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 relative overflow-hidden group hover:border-[#e51d38]/30 transition-colors"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e51d38]/20 to-transparent" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-medium text-white mb-1">Log Today</h3>
              <p className="text-xs text-gray-400">Symptoms, mood, daily logs</p>
            </div>
            <Pen className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex gap-4">
            <button className="flex-1 aspect-square rounded-xl border border-[#e51d38]/30 bg-[#e51d38]/5 flex items-center justify-center text-[#e51d38] hover:bg-[#e51d38]/10 transition-colors shadow-[0_0_15px_rgba(229,29,56,0.1)]">
              <Droplets className="w-6 h-6" />
            </button>
            <button className="flex-1 aspect-square rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <Smile className="w-6 h-6" />
            </button>
            <button className="flex-1 aspect-square rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Cycle View Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 group hover:border-[#e51d38]/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-medium text-white mb-1">Cycle View</h3>
              <p className="text-xs text-gray-400">Heatmap & patterns</p>
            </div>
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          {/* Heatmap Mock */}
          <div className="grid grid-cols-10 gap-1.5 opacity-80">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-full aspect-square rounded-sm ${
                  i >= 12 && i <= 15 ? 'bg-[#e51d38] shadow-[0_0_8px_rgba(229,29,56,0.6)]' : 
                  i >= 10 && i <= 17 ? 'bg-[#e51d38]/40' : 
                  'bg-white/5'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 group hover:border-[#e51d38]/30 transition-colors flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-white mb-1">Insights</h3>
              <p className="text-xs text-gray-400">Trend charts & stats</p>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-grow flex items-end">
            {/* Simple SVG Chart */}
            <svg className="w-full h-16" viewBox="0 0 100 40" preserveAspectRatio="none">
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
              placeholder="Ask RedDot.ai..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors">
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
