'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, onboardingDone } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingDone) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingDone, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your password and try again."
      );
      setLoading(false);
    }
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
            src="/assets/images/signup_page_image.jpeg"
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
            <Link
              href="/signup"
              className="text-sm font-medium tracking-wide text-gray-500 hover:text-gray-300 pb-2 transition-colors"
            >
              SIGN UP
            </Link>
            <span className="text-sm font-medium tracking-wide text-white relative pb-2 select-none">
              LOG IN
              <motion.div
                layoutId="tab-indicator"
                className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-white"
              />
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e51d38] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e51d38] transition-colors"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e51d38] hover:bg-[#c0142b] text-white rounded-xl py-4 font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              SIGN IN
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
