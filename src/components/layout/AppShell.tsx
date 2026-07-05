"use client";

import { useState, useCallback } from "react";
import PillNav, { type NavSection } from "@/components/nav/PillNav";
import ProfilePopup from "@/components/nav/ProfilePopup";

// ──────────────────────────────────────────────
// App Shell — wraps all authenticated (post-login) pages
//
// Provides: pill nav, profile popup, section routing
// ──────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  email?: string;
  syncEnabled?: boolean;
  lastBackupAt?: string | null;
  onToggleSync?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export default function AppShell({
  children,
  activeSection,
  onSectionChange,
  email = "",
  syncEnabled = false,
  lastBackupAt = null,
  onToggleSync,
  onLogout,
  onOpenSettings,
}: AppShellProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleProfileClick = useCallback(() => {
    setProfileOpen((prev) => !prev);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-void relative">
      {/* ── Fixed nav header ── */}
      <header className="sticky top-0 z-40 bg-void/95 backdrop-blur-sm border-b border-fog/5">
        <PillNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onProfileClick={handleProfileClick}
          userInitial={email ? email[0].toUpperCase() : "?"}
        />

        {/* Profile popup (anchored to nav header) */}
        <ProfilePopup
          isOpen={profileOpen}
          onClose={handleCloseProfile}
          email={email}
          syncEnabled={syncEnabled}
          lastBackupAt={lastBackupAt}
          onToggleSync={onToggleSync}
          onOpenSettings={() => {
            handleCloseProfile();
            onOpenSettings?.();
          }}
          onLogout={() => {
            handleCloseProfile();
            onLogout?.();
          }}
        />
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
