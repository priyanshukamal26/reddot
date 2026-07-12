'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { email, logout } = useAuth();

  const tabs = [
    { name: 'Tracking', path: '/dashboard' },
    { name: 'RedDot.ai', path: '/dashboard/ai' },
    { name: 'Know', path: '/dashboard/know' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#e51d38] shadow-[0_0_8px_#e51d38]" />
        <span className="text-xl font-bold tracking-tight text-white">RedDot</span>
      </Link>

      {/* Pill Navigation */}
      <div className="flex items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full p-1 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="pill-indicator"
                  className="absolute inset-0 bg-[#e51d38] rounded-full shadow-[0_0_15px_rgba(229,29,56,0.4)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/20 transition-colors bg-white/5"
        >
          <User className="w-5 h-5 text-gray-300" />
        </button>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 mt-3 w-48 bg-[#141416] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-white/10 text-sm">
              <p className="text-gray-400">Signed in as</p>
              <p className="font-medium text-white truncate">{email || "user@reddot.app"}</p>
            </div>
            <div className="py-1">
              <button 
                onClick={() => router.push('/dashboard/settings')}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
