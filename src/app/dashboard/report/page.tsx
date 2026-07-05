"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<string>("");
  const [discardedAt, setDiscardedAt] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 8 * 1024 * 1024) {
        setError("File size exceeds 8MB limit.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setConsentOpen(true); // Open consent popup before upload
    }
  };

  const handleConsentAccept = async () => {
    setConsentOpen(false);
    if (!file) return;

    setLoading(true);
    setError("");
    setAnalysis("");
    setDiscardedAt(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze report.");
      }

      setAnalysis(data.analysis);
      setDiscardedAt(data.discarded_at);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "System error: Failed to process document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-paper relative space-grid py-12 px-4 overflow-hidden">
      {/* ── Background Glows ── */}
      <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-signal/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-signal-deep/5 blur-[120px] pointer-events-none" />

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
            <h1 className="text-xl font-bold text-paper">Report analysis</h1>
            <p className="text-xs text-fog font-mono uppercase tracking-wider">
              Ephemeral Document processing
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="glass-panel rounded-md p-4 flex gap-3 items-start border-l-2 border-signal shadow-md">
          <ShieldAlert className="w-5 h-5 text-signal shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-paper">Zero-Store Security Guarantee</h3>
            <p className="text-[11px] text-fog leading-relaxed">
              Your uploaded lab or blood report is processed strictly in-memory on our server
              and is permanently discarded immediately after analysis. RedDot never writes
              your document or its text contents to disk or database.
            </p>
          </div>
        </div>

        {/* Upload form / Upload Area */}
        {!analysis && !loading && (
          <div className="glass-panel rounded-lg p-8 text-center border-dashed border-fog/20 hover:border-signal/40 transition-colors cursor-pointer relative overflow-hidden">
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-ash flex items-center justify-center border border-fog/10 text-fog">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-paper">Upload Lab Report</p>
                <p className="text-xs text-fog mt-1">
                  Supports PDF, PNG, or JPEG formats (Max 8MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-panel rounded-lg p-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold text-paper">Processing report...</p>
              <p className="text-xs text-fog mt-1">
                Extracting metrics and analyzing reference ranges. This may take up to a minute.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-md text-error text-xs flex gap-2">
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Output Display */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Discarded Verification Indicator */}
            {discardedAt && (
              <div className="bg-signal/5 border border-signal/20 rounded-md p-3 flex items-center justify-between text-xs text-paper font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-signal" />
                  <span>FILE SAFELY DISCARDED</span>
                </div>
                <span className="text-[10px] text-fog/60">
                  {new Date(discardedAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}

            {/* Analysis card */}
            <div className="glass-panel rounded-lg p-6 space-y-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-signal/5 to-transparent pointer-events-none" />

              <div className="flex items-center gap-2 pb-3 border-b border-fog/5">
                <FileText className="w-4 h-4 text-signal" />
                <h2 className="text-sm font-semibold text-paper uppercase tracking-wider font-mono">
                  Report Summary & Metrics
                </h2>
              </div>

              {/* Parsed text body */}
              <div className="text-xs text-fog leading-relaxed space-y-4 whitespace-pre-line">
                {analysis}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setAnalysis("");
                  setFile(null);
                  setDiscardedAt(null);
                }}
                className="px-4 py-2 bg-ash border border-fog/10 text-paper text-xs rounded hover:bg-ash/80 transition-colors"
              >
                Upload another file
              </button>
            </div>
          </div>
        )}

        {/* safety footer disclaimer */}
        <div className="flex justify-center gap-1.5 items-center text-[9px] text-fog/30 border-t border-white/5 pt-4">
          <span>
            Non-diagnostic tool. Report summaries are for informational purposes only. If you are
            experiencing a medical emergency, contact emergency services immediately.
          </span>
        </div>
      </div>

      {/* ── Consent disclaimer modal ── */}
      {consentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/85 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-lg p-6 space-y-4 shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-signal/20 relative">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-signal shrink-0" />
              <h2 className="text-sm font-bold text-paper">Document Consent Notice</h2>
            </div>
            <p className="text-xs text-fog leading-relaxed">
              By proceeding, you authorize RedDot to process this document in-memory. The text is
              extracted, analyzed via the Groq API (which is governed by Groq&apos;s privacy policy), and
              is immediately discarded from our systems. 
              <br />
              <br />
              <strong className="text-paper">
                No copy of the file or its extracted contents will be saved or persisted server-side.
              </strong>
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setConsentOpen(false);
                  setFile(null);
                }}
                className="px-3 py-1.5 bg-void border border-fog/10 rounded text-fog hover:text-paper text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentAccept}
                className="px-3 py-1.5 bg-signal rounded text-paper font-semibold hover:bg-signal-deep text-xs transition-colors"
              >
                Accept & Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
