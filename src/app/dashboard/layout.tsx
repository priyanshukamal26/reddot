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

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import type { NavSection } from "@/components/nav/PillNav";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, meta, email, refreshMeta } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<NavSection>("tracking");

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
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
