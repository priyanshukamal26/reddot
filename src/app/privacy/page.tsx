import Link from "next/link";

// ──────────────────────────────────────────────
// Privacy Page (B7 from 02_FEATURE_SPEC.md)
//
// Plain-language explanation of the data model.
// Per 09_SECURITY_AND_PRIVACY.md: must include all mandatory disclaimers.
// Per 03_ARCHITECTURE.md: must honestly disclose the AI assistant plaintext exception.
//
// Acceptance: a non-technical reader can understand the privacy model
// in under a minute.
// ──────────────────────────────────────────────

export const metadata = {
  title: "Privacy — RedDot",
  description: "How RedDot protects your menstrual health data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-void">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-fog/5">
        <Link href="/" className="text-xl font-bold text-paper">
          Red<span className="text-signal">Dot</span>
        </Link>
        <Link href="/login" className="text-sm text-fog hover:text-paper transition-colors">
          Sign in
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <h1 className="text-3xl font-bold text-paper">
          How RedDot protects your data
        </h1>

        {/* ── The short version ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-paper">The short version</h2>
          <ul className="space-y-2 text-sm text-fog leading-relaxed">
            <li className="flex gap-2">
              <span className="text-signal mt-0.5">•</span>
              <span>Your health data is <strong className="text-paper">encrypted on your device</strong> before it goes anywhere else. We can&apos;t read it — only you can, with your password.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-signal mt-0.5">•</span>
              <span>Cloud sync is <strong className="text-paper">off by default</strong>. If you turn it on, the server stores encrypted data it cannot decrypt.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-signal mt-0.5">•</span>
              <span>We have <strong className="text-paper">no advertising SDKs</strong>, no third-party analytics that track you, and we never sell or share your health data.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-signal mt-0.5">•</span>
              <span>You can <strong className="text-paper">export all your data</strong> anytime and <strong className="text-paper">delete everything</strong> permanently — and both actually work.</span>
            </li>
          </ul>
        </section>

        {/* ── What stays on your device ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-paper">What stays on your device</h2>
          <p className="text-sm text-fog leading-relaxed">
            All cycle, mood, symptom, journal, and RedDot.ai chat data is stored in
            your browser&apos;s local storage (IndexedDB), encrypted with a key derived
            from your password. Even someone with physical access to your device would
            see only encrypted data.
          </p>
          <p className="text-sm text-fog leading-relaxed">
            Dates (the day something was logged, not what was logged) are stored
            unencrypted locally to allow the app to show your calendar efficiently. A
            date alone doesn&apos;t reveal health information — the actual content
            (symptoms, mood, notes) is always encrypted.
          </p>
        </section>

        {/* ── What leaves your device ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-paper">What leaves your device — and when</h2>

          <div className="space-y-4">
            <div className="bg-ash rounded-md p-4">
              <h3 className="text-sm font-medium text-paper mb-1">Cloud sync (if you turn it on)</h3>
              <p className="text-xs text-fog leading-relaxed">
                Your encrypted data syncs to our server. The server stores ciphertext
                it cannot decrypt — even if our database were breached or subpoenaed, the
                data is unreadable without your password.
              </p>
            </div>

            <div className="bg-ash rounded-md p-4 border-l-2 border-signal">
              <h3 className="text-sm font-medium text-paper mb-1">
                RedDot.ai (the AI features)
              </h3>
              <p className="text-xs text-fog leading-relaxed">
                When you use RedDot.ai — the chat assistant or report analysis — your
                recent logged data (last ~30 days) is sent in plaintext to Groq&apos;s API
                to generate a response. This is the <strong className="text-paper">one place</strong> where
                plaintext health data leaves your device. It&apos;s necessary for the AI to
                give you useful, personalized answers, and we&apos;re transparent about it
                rather than pretending it doesn&apos;t happen.
              </p>
              <p className="text-xs text-fog leading-relaxed mt-2">
                Groq&apos;s data retention policy governs what happens on their end — we link
                to it below rather than making claims on their behalf. We do not store
                your conversations or AI responses server-side; they&apos;re encrypted and
                stored locally on your device, just like everything else.
              </p>
            </div>

            <div className="bg-ash rounded-md p-4">
              <h3 className="text-sm font-medium text-paper mb-1">Report/lab analysis</h3>
              <p className="text-xs text-fog leading-relaxed">
                When you upload a lab report for analysis, the file is processed in
                memory on our server and <strong className="text-paper">immediately discarded</strong> after
                the AI generates its response. It is never written to disk, never stored.
                The app shows you a confirmation with the exact time the file was discarded.
              </p>
            </div>
          </div>
        </section>

        {/* ── Product principles ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-paper">Our commitments</h2>
          <ul className="space-y-2 text-sm text-fog">
            <li>✕ No third-party advertising SDKs</li>
            <li>✕ No third-party analytics that track individual behavior</li>
            <li>✕ No selling or sharing health data with third parties, ever</li>
            <li>✓ Local-first by default; cloud sync is opt-in</li>
            <li>✓ Full data export and full data deletion always available</li>
          </ul>
        </section>

        {/* ── Medical disclaimer ── */}
        <section className="space-y-3 border-t border-fog/10 pt-8">
          <h2 className="text-lg font-semibold text-paper">Medical disclaimer</h2>
          <p className="text-sm text-fog leading-relaxed">
            RedDot is not a medical device, not a substitute for professional medical
            advice, and does not provide diagnoses. The AI features (RedDot.ai) provide
            informational summaries only. Always consult a qualified healthcare provider
            for medical advice, diagnosis, or treatment.
          </p>
          <p className="text-sm text-fog leading-relaxed">
            If you are experiencing a medical emergency, contact emergency services or a
            healthcare provider immediately.
          </p>
        </section>

        {/* ── Password and data recovery ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-paper">Password and data recovery</h2>
          <p className="text-sm text-fog leading-relaxed">
            Because your encryption key is derived from your password, resetting your
            password will make your existing encrypted data unreadable. We recommend
            using the backup/export feature regularly so you always have a recoverable
            copy of your data.
          </p>
        </section>

        {/* Footer links */}
        <div className="border-t border-fog/10 pt-8 flex items-center justify-between text-xs text-fog/50">
          <span>Built for HACKHAZARDS &apos;26</span>
          <a
            href="https://console.groq.com/docs/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fog transition-colors"
          >
            Groq Privacy Policy →
          </a>
        </div>
      </article>
    </main>
  );
}
