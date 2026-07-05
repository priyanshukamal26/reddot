/**
 * RedDot — Auth Guard
 *
 * Protects authenticated routes:
 * - Not authenticated → redirect to /login
 * - Authenticated but onboarding not done → redirect to /onboarding
 * - Otherwise → render children
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, also requires onboarding to be complete */
  requireOnboarding?: boolean;
}

export default function AuthGuard({
  children,
  requireOnboarding = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, onboardingDone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requireOnboarding && !onboardingDone) {
      router.replace("/onboarding");
      return;
    }
  }, [isAuthenticated, isLoading, onboardingDone, requireOnboarding, router]);

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated or onboarding needed — redirect is happening
  if (!isAuthenticated || (requireOnboarding && !onboardingDone)) {
    return null;
  }

  return <>{children}</>;
}
