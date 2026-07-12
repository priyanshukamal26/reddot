'use client';

import { motion } from 'motion/react';
import { Search, Info, FileText } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';
import Link from 'next/link';

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
        {ARTICLES.map((article, idx) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/dashboard/know/${article.slug}`}
              className="group relative flex flex-col p-6 rounded-2xl backdrop-blur-md transition-all duration-300 h-full bg-[rgba(20,20,22,0.6)] border border-[rgba(255,255,255,0.05)] hover:border-[#e51d38]/30 hover:shadow-[0_0_20px_rgba(229,29,56,0.15)]"
            >
              <div className="absolute inset-0 bg-[#e51d38] opacity-0 group-hover:opacity-5 blur-xl transition-opacity rounded-2xl pointer-events-none" />
              <div className="mb-4">
                <FileText className="w-6 h-6 text-gray-400 group-hover:text-[#e51d38] transition-colors" />
              </div>
              
              <h3 className="text-base font-medium mb-2 leading-tight text-gray-200 group-hover:text-white transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 mb-6 flex-grow leading-relaxed line-clamp-3">
                {article.summary}
              </p>
              
              <div className="text-xs font-medium flex items-center gap-1 transition-colors text-gray-500 group-hover:text-[#e51d38] mt-auto">
                Read Article <span>→</span>
              </div>
            </Link>
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
