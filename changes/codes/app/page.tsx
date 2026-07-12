'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Left side abstract image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Abstract Red and Black Liquid"
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] mix-blend-multiply" />
        </motion.div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-3 h-3 rounded-full bg-[#e51d38] shadow-[0_0_10px_#e51d38]" />
            <span className="text-xl font-bold tracking-tight">RedDot</span>
          </div>

          <div className="mb-12">
            <p className="text-sm tracking-widest text-gray-500 uppercase mb-4">Privacy Model</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight leading-tight mb-4 font-serif">
              Ready for a better standard?
            </h1>
            <p className="text-gray-400">
              Get absolute privacy and high-fidelity cycle tracking today.
            </p>
          </div>

          <div className="flex gap-6 mb-8 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('signup')}
              className={`text-sm font-medium tracking-wide transition-colors ${
                activeTab === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              SIGN UP
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`text-sm font-medium tracking-wide transition-colors relative ${
                activeTab === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              LOG IN
              {activeTab === 'login' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-white"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e51d38] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                placeholder="••"
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e51d38] transition-colors"
                required
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e51d38] hover:bg-[#c0142b] text-white rounded-xl py-4 font-medium tracking-wide transition-colors"
            >
              {activeTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-white hover:underline"
            >
              {activeTab === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
