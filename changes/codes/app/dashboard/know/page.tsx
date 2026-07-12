'use client';

import { motion } from 'motion/react';
import { Search, Droplet, RefreshCcw, Moon, TrendingUp, Activity, Shield, Stethoscope, Target, Apple, Brain, BedDouble, Dumbbell, Info } from 'lucide-react';

const modules = [
  {
    id: 1,
    title: 'The Menstrual Phase: Rest and Shedding',
    desc: 'Understand the physiological process of the menstrual phase...',
    icon: Droplet,
    active: true,
  },
  {
    id: 2,
    title: 'Ovulation Phase',
    desc: 'Explore the main aspects around the ovulation phase.',
    icon: RefreshCcw,
    active: false,
  },
  {
    id: 3,
    title: 'Luteal Phase',
    desc: 'Explore the ovulation variations and luteal phase.',
    icon: Moon,
    active: false,
  },
  {
    id: 4,
    title: 'The Follicular Phase: Growth and Rising Energy',
    desc: 'Explore the follicle-stimulating hormone to explore rise in energy...',
    icon: TrendingUp,
    active: true,
  },
  {
    id: 5,
    title: 'Hormonal Health Basics',
    desc: 'Explore the evidence on normal hormonal health and patterns.',
    icon: Activity,
    active: false,
  },
  {
    id: 6,
    title: 'Cycle Tracking & Privacy',
    desc: 'Explore the steps to access your cycle tracking & privacy.',
    icon: Shield,
    active: false,
  },
  {
    id: 7,
    title: 'Common Conditions (PCOS, Endo)',
    desc: 'Explore the conditions and some common conditions (PCOS, Endo).',
    icon: Stethoscope,
    active: false,
  },
  {
    id: 8,
    title: 'Fertility Awareness',
    desc: 'Explore the important fertility awareness of fertility awareness.',
    icon: Target,
    active: false,
  },
  {
    id: 9,
    title: 'Nutrition & Cycle',
    desc: 'Understand the response of your nutrition and cycle.',
    icon: Apple,
    active: false,
  },
  {
    id: 10,
    title: 'Mental Health & Cycle',
    desc: 'Explore the mental health & cycle matters and emotions.',
    icon: Brain,
    active: false,
  },
  {
    id: 11,
    title: 'Sleep & Cycle',
    desc: 'Explore the mental health with sleep in order to improve sleep & cycle.',
    icon: BedDouble,
    active: false,
  },
  {
    id: 12,
    title: 'Exercise & Cycle',
    desc: 'Explore the exercise & motion check and exercise & cycle.',
    icon: Dumbbell,
    active: false,
  },
];

export default function KnowHubPage() {
  return (
    <div className="max-w-6xl mx-auto pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-2">
            Educational Modules
          </p>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Know Hub</h1>
          <p className="text-sm text-gray-400">
            Evidence-based, privacy-first guides to menstrual variations.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[rgba(20,20,22,0.6)] backdrop-blur-md border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e51d38]/50 transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {modules.map((mod, idx) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`group relative flex flex-col p-6 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
              mod.active
                ? 'bg-[#e51d38]/5 border border-[#e51d38] shadow-[0_0_20px_rgba(229,29,56,0.15)]'
                : 'bg-[rgba(20,20,22,0.6)] border border-[rgba(255,255,255,0.05)] hover:border-white/20'
            }`}
          >
            {/* Hover Glow */}
            {!mod.active && (
              <div className="absolute inset-0 bg-[#e51d38] opacity-0 group-hover:opacity-5 blur-xl transition-opacity rounded-2xl pointer-events-none" />
            )}

            <div className="mb-4">
              <mod.icon className={`w-6 h-6 ${mod.active ? 'text-[#e51d38]' : 'text-gray-400 group-hover:text-gray-200'}`} />
            </div>
            
            <h3 className={`text-base font-medium mb-2 leading-tight ${mod.active ? 'text-white' : 'text-gray-200'}`}>
              {mod.title}
            </h3>
            <p className="text-xs text-gray-500 mb-6 flex-grow leading-relaxed">
              {mod.desc}
            </p>
            
            <div className={`text-xs font-medium flex items-center gap-1 transition-colors ${mod.active ? 'text-[#e51d38]' : 'text-gray-500 group-hover:text-gray-300'}`}>
              Read Article <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 text-xs text-gray-500 pb-8">
        <Info className="w-3 h-3" />
        <p>Informational only — not medical advice. Privacy-first design.</p>
      </div>
    </div>
  );
}
