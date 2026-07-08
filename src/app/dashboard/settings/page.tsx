"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { exportData, importData, forcePushSync, saveEntry, saveCycle } from "@/lib/data";
import { clearAllData } from "@/lib/db";
import { SYMPTOM_OPTIONS } from "@/lib/types";
import { ArrowLeft, Download, Upload, Cloud, RefreshCw, KeyRound, AlertTriangle, CheckCircle2, Trash2, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { meta, refreshMeta, logout } = useAuth();
  const [syncLoading, setSyncLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [wipeLoading, setWipeLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  // Format backup date
  const lastBackupDate = meta?.last_export_at
    ? new Date(meta.last_export_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never";

  // Trigger sync preferences change
  const handleToggleSync = async () => {
    if (!meta) return;
    setSyncLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const nextSyncState = !meta.sync_enabled;

      // Update local settings in IndexedDB
      const updatedMeta = {
        ...meta,
        sync_enabled: nextSyncState,
      };
      await refreshMeta(); // Refresh local auth context state

      // Save directly to metadata store first
      const { putMeta } = await import("@/lib/db");
      await putMeta(updatedMeta);
      
      // If toggled on, push current local data bundle to the cloud immediately
      if (nextSyncState) {
        await forcePushSync();
      }

      await refreshMeta(); // Reload from db again to update in-memory state
      setMessage(nextSyncState ? "Cloud sync enabled and data pushed." : "Cloud sync disabled.");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Failed to update sync settings. Database error.");
    } finally {
      setSyncLoading(false);
    }
  };

  // Export encrypted data backup
  const handleExport = async () => {
    setExportLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const jsonString = await exportData();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `reddot-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last export time
      if (meta) {
        const { putMeta } = await import("@/lib/db");
        await putMeta({
          ...meta,
          last_export_at: new Date().toISOString(),
        });
        await refreshMeta();
      }

      setMessage("Backup exported successfully.");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Failed to export data.");
    } finally {
      setExportLoading(false);
    }
  };

  // Import encrypted backup
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setImportLoading(true);
    setMessage("");
    setIsError(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await importData(json);
        await refreshMeta();
        setMessage("Backup imported and restored successfully. Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        setIsError(true);
        setMessage("Invalid backup file or decryption key mismatch.");
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePanicWipe = async () => {
    if (wipeConfirm !== "WIPE") return;
    setWipeLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // 1. Call server to delete synced blobs & reset user_meta
      const res = await fetch("/api/user/wipe", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to delete cloud data.");
      }

      // 2. Clear local IndexedDB databases
      await clearAllData();

      setMessage("All local and synced data wiped successfully. Logging out...");
      
      // 3. Clear auth context state and session, then redirect
      setTimeout(() => {
        logout();
        router.replace("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Failed to complete panic wipe. Network/Server error.");
      setWipeLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    setSeedLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const previousSync = meta?.sync_enabled || false;
      const previousSalt = meta?.salt || "";

      // 1. Clear IndexedDB
      await clearAllData();

      // 2. Generate 4 cycles starting at 28-day intervals: 84 days ago, 56 days ago, 28 days ago, today
      const startOffsetDays = [84, 56, 28, 0];
      for (const offset of startOffsetDays) {
        const cycleDate = new Date();
        cycleDate.setDate(cycleDate.getDate() - offset);
        const cycleDateStr = cycleDate.toISOString().split("T")[0];
        await saveCycle({
          cycleId: Math.random().toString(36).substring(7),
          startDate: cycleDateStr,
        });
      }

      // 3. Generate 90 daily entries
      for (let i = 90; i >= 0; i--) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - i);
        const dateStr = logDate.toISOString().split("T")[0];

        const daysSinceStart = 90 - i;
        const cycleDayIndex = daysSinceStart >= 0 ? daysSinceStart % 28 : (28 + (daysSinceStart % 28)) % 28;

        let periodFlag = false;
        let flowIntensity: "spotting" | "light" | "medium" | "heavy" | undefined = undefined;
        const symptoms: string[] = [];
        let mood = 3;
        let sleep = 3;
        let energy = 3;
        let appetite = 3;
        let exercise = 3;

        if (cycleDayIndex < 5) {
          periodFlag = true;
          if (cycleDayIndex === 0 || cycleDayIndex === 1) {
            flowIntensity = "heavy";
            if (Math.random() < 0.8) symptoms.push("cramps");
            if (Math.random() < 0.6) symptoms.push("bloating");
            mood = 2;
            energy = 2;
            sleep = 2;
          } else if (cycleDayIndex === 2 || cycleDayIndex === 3) {
            flowIntensity = "medium";
            if (Math.random() < 0.6) symptoms.push("cramps");
            mood = 3;
            energy = 3;
            sleep = 3;
          } else {
            flowIntensity = "light";
            mood = 3;
            energy = 3;
          }
        } else if (cycleDayIndex >= 5 && cycleDayIndex < 12) {
          periodFlag = false;
          mood = Math.random() < 0.5 ? 4 : 5;
          energy = Math.random() < 0.5 ? 4 : 5;
          sleep = 4;
          if (Math.random() < 0.1) symptoms.push("fatigue");
        } else if (cycleDayIndex >= 12 && cycleDayIndex < 16) {
          periodFlag = false;
          mood = 5;
          energy = 5;
          sleep = 5;
          if (Math.random() < 0.2) symptoms.push("spotting");
          if (Math.random() < 0.2) symptoms.push("headache");
        } else {
          periodFlag = false;
          mood = Math.random() < 0.6 ? 3 : 2;
          energy = Math.random() < 0.5 ? 3 : 4;
          sleep = 3;
          if (Math.random() < 0.4) symptoms.push("acne");
          if (Math.random() < 0.4) symptoms.push("breast tenderness");
          if (Math.random() < 0.5) symptoms.push("cravings");
          if (Math.random() < 0.3) symptoms.push("irritability");
        }

        appetite = Math.floor(Math.random() * 3) + 3;
        exercise = Math.floor(Math.random() * 4) + 2;

        await saveEntry({
          entryId: Math.random().toString(36).substring(7),
          date: dateStr,
          periodFlag,
          flowIntensity,
          symptoms,
          mood,
          sleep,
          energy,
          appetite,
          exercise,
        });
      }

      // 4. Save metadata back
      const { putMeta } = await import("@/lib/db");
      await putMeta({
        last_export_at: meta?.last_export_at || null,
        sync_enabled: previousSync,
        onboarding_done: true,
        salt: previousSalt,
      });

      // 5. Cloud sync push if sync was previously active
      if (previousSync) {
        await forcePushSync();
      }

      await refreshMeta();
      setMessage("90-day cyclic demo data generated successfully! Reloading dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Demo seeding failed:", err);
      setIsError(true);
      setMessage("Failed to seed demo data.");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-signal/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-signal-deep/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded bg-ash/60 border border-white/5 text-fog hover:text-paper transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-paper">Settings</h1>
            <p className="text-xs text-fog font-mono uppercase tracking-wider">
              Privacy & backup parameters
            </p>
          </div>
        </div>

        {/* Global Notifications/Alerts */}
        {message && (
          <div
            className={`p-3 rounded-md text-xs flex gap-2 items-center ${
              isError
                ? "bg-error/10 border border-error/20 text-error"
                : "bg-signal/5 border border-signal/20 text-paper font-mono"
            }`}
          >
            {isError ? <span>✕</span> : <CheckCircle2 className="w-4 h-4 text-signal shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        {/* ── Section 1: Security Notice ── */}
        <div className="glass-panel rounded-lg p-5 space-y-4 border-l-2 border-signal shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-fog/5">
            <KeyRound className="w-4 h-4 text-signal" />
            <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
              Password & Encryption Notice
            </h2>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-fog">
            <p>
              Your data is encrypted locally using a cryptographic key derived from your account
              password. We do not store your password on our servers, which means:
            </p>
            <div className="bg-void/50 border border-white/5 rounded-md p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-signal shrink-0 mt-0.5" />
              <p className="text-[11px] text-paper">
                If you reset or forget your password, your previously synced/local data becomes
                <strong> permanently unreadable</strong> unless you have exported an offline JSON
                backup first.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Backup & Restore ── */}
        <div className="glass-panel rounded-lg p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-fog/5">
            <Download className="w-4 h-4 text-signal" />
            <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
              Local Backup Management
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex flex-col items-center justify-center p-5 bg-ash hover:bg-ash/80 border border-fog/10 rounded-md transition-colors text-center group disabled:opacity-40"
            >
              <Download className="w-6 h-6 text-signal group-hover:scale-105 transition-transform mb-2" />
              <span className="text-xs font-semibold text-paper">Export Backup</span>
              <span className="text-[10px] text-fog/60 mt-1">Download encrypted JSON file</span>
            </button>

            {/* Import */}
            <label className="flex flex-col items-center justify-center p-5 bg-ash hover:bg-ash/80 border border-fog/10 rounded-md transition-colors text-center group cursor-pointer disabled:opacity-40">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importLoading}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-signal group-hover:scale-105 transition-transform mb-2" />
              <span className="text-xs font-semibold text-paper">Import Backup</span>
              <span className="text-[10px] text-fog/60 mt-1">Restore from encrypted JSON file</span>
            </label>
          </div>

          <div className="flex justify-between items-center text-[10px] text-fog/40 font-mono pt-2">
            <span>LAST BACKUP ON THIS DEVICE</span>
            <span>{lastBackupDate.toUpperCase()}</span>
          </div>
        </div>

        {/* ── Section 3: Cloud Sync ── */}
        <div className="glass-panel rounded-lg p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-fog/5">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-signal" />
              <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
                Cloud Synchronisation
              </h2>
            </div>
            <button
              onClick={handleToggleSync}
              disabled={syncLoading}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                meta?.sync_enabled
                  ? "bg-signal/20 text-signal border border-signal/30"
                  : "bg-void border border-fog/10 text-fog hover:text-paper"
              }`}
            >
              {meta?.sync_enabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-fog">
              Enable automated sync to push your locally encrypted cycles and logs to our server. 
              Only ciphertext is uploaded; the server holds no keys to decrypt your information.
            </p>

            {meta?.sync_enabled && (
              <button
                onClick={async () => {
                  setSyncLoading(true);
                  setMessage("");
                  try {
                    await forcePushSync();
                    setMessage("Cloud sync completed successfully.");
                  } catch (err) {
                    setIsError(true);
                    setMessage("Sync push failed.");
                  } finally {
                    setSyncLoading(false);
                  }
                }}
                disabled={syncLoading}
                className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-deep transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? "animate-spin" : ""}`} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Section 3.5: Seed Demo Data ── */}
        <div className="glass-panel rounded-lg p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-fog/5">
            <Sparkles className="w-4 h-4 text-signal" />
            <h2 className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
              Developer Tools — Seeding
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-fog">
              Populate the local database with 90 days of realistic cyclic cycle history (period bleeding, moods, symptoms, and sleep scales). This is extremely useful for exploring trend charts, contributions, and AI insights.
              <strong className="text-signal"> Note: This will clear all existing logs before seeding.</strong>
            </p>

            <button
              onClick={handleSeedDemoData}
              disabled={seedLoading}
              className="w-full py-2.5 rounded bg-ash hover:bg-ash/80 border border-signal/20 hover:border-signal/40 text-paper font-semibold transition-all text-xs uppercase tracking-wider font-mono"
            >
              {seedLoading ? "Seeding 90-Day History..." : "Seed 90-Day Cyclic Demo Data"}
            </button>
          </div>
        </div>

        {/* ── Section 4: Danger Zone / Panic Wipe ── */}
        <div className="glass-panel rounded-lg p-5 space-y-4 border border-error/20 bg-error/5 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-error/10">
            <Trash2 className="w-4 h-4 text-error" />
            <h2 className="text-xs font-semibold text-error uppercase tracking-wider font-mono">
              Danger Zone — Panic Wipe
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-fog">
              Wiping your data will permanently delete all local logs, cycle entries, and chats from this browser. 
              If cloud sync is enabled, it will also delete all ciphertext blobs from our servers. 
              <strong className="text-paper"> This action is irreversible.</strong>
            </p>

            <div className="space-y-3 pt-2">
              <label className="block text-[10px] text-fog font-mono uppercase tracking-wider">
                Type &quot;WIPE&quot; to confirm:
              </label>
              <input
                type="text"
                value={wipeConfirm}
                onChange={(e) => setWipeConfirm(e.target.value)}
                placeholder="WIPE"
                className="w-full bg-void text-paper border border-error/20 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-error text-center font-mono"
              />
              
              <button
                onClick={handlePanicWipe}
                disabled={wipeConfirm !== "WIPE" || wipeLoading}
                className="w-full py-2.5 rounded bg-error text-paper font-semibold hover:bg-error/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-mono"
              >
                {wipeLoading ? "Wiping Data..." : "Wipe All Local & Cloud Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
