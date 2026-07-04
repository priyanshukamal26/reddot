"use client";

import { useRef, useEffect } from "react";

// ──────────────────────────────────────────────
// Profile Popup (#24 from 06_PAGES_AND_FLOWS.md)
//
// Triggered by the Profile button in the pill nav.
// Renders as a small anchored dropdown, not a full-screen modal.
//
// Contents when logged in:
// - Identity header (initial + email)
// - Link to Settings
// - Cloud sync quick toggle/status
// - Last-backup timestamp
// - Log out (visually separated)
// ──────────────────────────────────────────────

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  syncEnabled?: boolean;
  lastBackupAt?: string | null;
  onToggleSync?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export default function ProfilePopup({
  isOpen,
  onClose,
  email = "",
  syncEnabled = false,
  lastBackupAt = null,
  onToggleSync,
  onOpenSettings,
  onLogout,
}: ProfilePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Profile menu"
      className="
        absolute top-14 right-4 z-50
        w-72 rounded-md bg-ash border border-fog/10
        shadow-2xl shadow-black/40
        py-3 px-4 space-y-3
        animate-in fade-in slide-in-from-top-2
      "
    >
      {/* ── Identity header ── */}
      <div className="flex items-center gap-3 pb-3 border-b border-fog/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-signal text-paper text-sm font-bold">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-paper truncate">{email}</p>
        </div>
      </div>

      {/* ── Settings link ── */}
      <button
        onClick={onOpenSettings}
        className="w-full text-left text-sm text-fog hover:text-paper transition-colors py-1"
      >
        Settings
      </button>

      {/* ── Sync status shortcut ── */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-fog">Cloud sync</span>
        <button
          onClick={onToggleSync}
          className={`
            text-xs font-mono px-2 py-0.5 rounded-md transition-colors
            ${syncEnabled
              ? "bg-signal/20 text-signal"
              : "bg-void text-fog hover:text-paper"
            }
          `}
        >
          {syncEnabled ? "On" : "Off"}
        </button>
      </div>

      {/* ── Last backup ── */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-fog">Last backup</span>
        <span className="text-xs font-mono text-fog/70">
          {lastBackupAt ?? "Never"}
        </span>
      </div>

      {/* ── Divider + Log out ── */}
      <div className="pt-2 border-t border-fog/10">
        <button
          onClick={onLogout}
          className="w-full text-left text-sm text-error hover:text-error/80 transition-colors py-1"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
