/**
 * RedDot — Dashboard Layout
 *
 * Wraps all /dashboard/* routes with:
 * - AuthGuard (redirects unauthenticated users)
 * - AppShell (pill nav + profile popup)
 *
 * This means individual dashboard pages don't need to manage
 * auth checks or the nav shell themselves.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import type { NavSection } from "@/components/nav/PillNav";
import { useAuth } from "@/context/auth-context";
import { loadAllCycles } from "@/lib/data";
import { calculateCycleStats, getCurrentPhase } from "@/lib/cycle";
import type { CyclePhase } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, meta, email, refreshMeta } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);

  // Load current phase state
  useEffect(() => {
    async function fetchPhase() {
      try {
        const cycles = await loadAllCycles();
        if (cycles.length > 0) {
          const sorted = [...cycles].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const stats = calculateCycleStats(cycles);
          const phaseInfo = getCurrentPhase(sorted[0].startDate, stats);
          setCurrentPhase(phaseInfo.phase);
        }
      } catch (err) {
        console.error("Failed to load phase for nav:", err);
      }
    }
    fetchPhase();
  }, [pathname]); // Refresh on navigation/page updates

  // Helper to determine active section from pathname
  const getActiveSectionFromPath = useCallback((path: string): NavSection => {
    if (path.startsWith("/dashboard/ai") || path.startsWith("/dashboard/report")) {
      return "reddot-ai";
    }
    if (path.startsWith("/dashboard/know")) {
      return "know";
    }
    return "tracking";
  }, []);

  const [activeSection, setActiveSection] = useState<NavSection>(() =>
    getActiveSectionFromPath(pathname)
  );

  // Sync active section when path changes
  useEffect(() => {
    setActiveSection(getActiveSectionFromPath(pathname));
  }, [pathname, getActiveSectionFromPath]);

  const handleSectionChange = useCallback(
    (section: NavSection) => {
      setActiveSection(section);
      if (section === "tracking") router.push("/dashboard");
      else if (section === "reddot-ai") router.push("/dashboard/ai");
      else if (section === "know") router.push("/dashboard/know");
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  const handleOpenSettings = useCallback(() => {
    router.push("/dashboard/settings");
  }, [router]);

  const handleToggleSync = useCallback(async () => {
    if (!meta) return;
    try {
      const nextState = !meta.sync_enabled;
      const updatedMeta = { ...meta, sync_enabled: nextState };

      // Save directly to metadata store first
      const { putMeta } = await import("@/lib/db");
      await putMeta(updatedMeta);

      if (nextState) {
        const { forcePushSync } = await import("@/lib/data");
        await forcePushSync();
      }

      await refreshMeta();
    } catch (err) {
      console.error("Failed to toggle sync in layout:", err);
    }
  }, [meta, refreshMeta]);

  return (
    <AuthGuard requireOnboarding={true}>
      <AppShell
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        email={email || "user@reddot.app"}
        syncEnabled={meta?.sync_enabled ?? false}
        lastBackupAt={meta?.last_export_at ?? null}
        onToggleSync={handleToggleSync}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
        currentPhase={currentPhase}
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
