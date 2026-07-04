# RedDot — Project Track

## How to use this file
This is the single source of truth for build progress. Update it
immediately after completing any meaningful unit of work — not in a
batch at the end of a session. Every entry gets a timestamp. Nothing
is ever deleted from the History Log; mark things superseded, don't
erase them.

## Current Status
**Phase 0 — Foundation.** Starting scaffold and deployment. No code written yet.

## Build Plan (mirrors 10_MVP_BUILD_PLAN.md — keep in sync with it)

### Phase 0 — Foundation
- [ ] 1. Next.js + TypeScript + Tailwind scaffold, deployed to Vercel. Tailwind theme configured with v2 design tokens (`void`/`paper`/`signal`/`signal-deep`/`ash`/`fog`/`error` + phase-ramp tokens `phase-signal`/`phase-rise`/`phase-peak`/`phase-fade`).
- [ ] 2. Neon project + tables migrated (`users`, `encrypted_blobs`, `user_meta`, `report_analysis_events`).
- [ ] 3. Auth.js wired to Neon `users` table — sign up / log in working E2E.
- [ ] 4. Encryption layer: PBKDF2 key derivation (100k iterations, SHA-256) + AES-GCM 256-bit encrypt/decrypt utility functions in `lib/crypto.ts`. Unit tested in isolation.
- [ ] 5. IndexedDB wrapper (via `idb`) with `entries`/`cycles`/`meta`/`chats` stores per 04_DATA_MODEL.md.
- [ ] 6. Pill nav component (Tracking / RedDot.ai / Know segments + Profile button, sliding active-state fill).

### Phase 1 — Core Tracking Loop (under "Tracking")
- [ ] 7. Onboarding flow (privacy intro → cycle basics → sync choice → first insight).
- [ ] 8. Dashboard with phase-ring component (monochrome gradient-ramp version, not flat arcs). Static version first: current phase + day calculation from logged cycles.
- [ ] 9. Daily log screen (mood, symptoms, sleep/energy/appetite/exercise, journal) → encryption layer → IndexedDB.
- [ ] 10. Creative cycle-history view (heatmap version — MVP-safe per C4) + day detail slide-up panel.
- [ ] 11. Irregular-cycle-aware prediction logic (C2 range-based prediction). Simple average first, then regular/irregular check.
- [ ] 12. Cycle Insights tab within Tracking (trend charts) — basic version.

### Phase 2 — Privacy Features
- [ ] 13. Export (encrypted backup file download, includes chat history).
- [ ] 14. Import (restore from backup file, includes chats).
- [ ] 15. Last-backup indicator on dashboard + Profile popup.
- [ ] 16. Sync toggle + Neon sync endpoint (ciphertext push/pull via `encrypted_blobs`).
- [ ] 17. Password reset flow with data-loss warning modal.
- [ ] 18. Privacy page (B7) — content-heavy; mention RedDot.ai by name, confirm chat history follows same local-first/ciphertext rule.

### Phase 3 — AI Layer ("RedDot.ai")
- [ ] 19. Groq API key setup, basic chat endpoint wired to chat UI under RedDot.ai pill. Uses system prompt from 08_AI_PROMPTS_AND_LOGIC.md verbatim (shared safety preamble + E1 prompt).
- [ ] 20. Encrypted local chat history: write exchanges to `chats` IndexedDB store, past-chats list (content-neutral `title_hint`), resume-from-history with context intact. (MVP-tier, feature E5.)
- [ ] 21. RedDot.ai first-use disclaimer modal.
- [ ] 22. Report analysis mode/tab within RedDot.ai: file handling → OCR/text-extraction → Groq call → response (E3 system prompt).
- [ ] 23. Report upload consent modal + result screen with discard confirmation + timestamp.

### Phase 4 — Know Hub + Polish/V1.1
- [ ] 24. Know hub + article detail (H1/H2) — 1 explainer per phase (4) + 3–5 general articles.
- [ ] 25. Daily/weekly AI insight card (E2).
- [ ] 26. Phase-correlated insights (D4).
- [ ] 27. Logging streaks (F1).
- [ ] 28. Gentle reminders (F2).
- [ ] 29. Symptom pattern flags (G1).
- [ ] 30. Panic wipe (B6).
- [ ] 31. Radial/spiral cycle-view upgrade (C4 stretch version).
- [ ] 32. Visual polish pass across all in-app screens vs 07_DESIGN_SYSTEM.md v2.

### Phase 5 — Landing Page (parallelizable from Phase 1–2 onward)
- [ ] 33. GSAP/Lenis-driven landing page per 06_PAGES_AND_FLOWS.md motion spec (Hero → Privacy pitch → Four phases → AI pitch → Comparison → Final CTA/footer). Lenis smooth scroll, ScrollTrigger pinning/scrubbing, SplitText headline reveals, DrawSVG phase-ring animation. Mobile-first scrollytelling. `prefers-reduced-motion` support.
- [ ] 34. Privacy page visual polish to match v2 palette.

### Deferred / Stretch (mention in pitch only)
- [ ] Partner/support-person sharing (B8).
- [ ] Cycle health score (F3).
- [ ] Mood-pattern narrator (E4).
- [ ] Medication/birth control reminder log (G2).
- [ ] Radial/spiral cycle view (fallback: heatmap, already MVP-tier).
- [ ] Large Know content library (fallback: small curated set from Phase 4).

## Decisions & Deviations Log

[2026-07-04 16:20] — `11_STITCH_PROMPT.md` referenced in user instructions does not exist in `docs/`. Only 11 files (00–10) are present. Proceeding without it; no action needed since it was for Stitch mockup generation, not code.

## History Log (append-only, most recent at the top)

[2026-07-04 16:20] — Completed full reading pass of all 11 specification docs (00_README through 10_MVP_BUILD_PLAN). Comprehension verified: product is RedDot (menstrual health tracker), two core differentiators are (1) local-first encrypted architecture and (2) RedDot.ai's AI features. Navigation is pill nav (Tracking / RedDot.ai / Know + Profile popup). Naming: "RedDot" for the product, "RedDot.ai" only for the AI feature. Created this project_track.md. Next: begin Phase 0 scaffold.

## Doc Sync Notes

(No doc changes yet.)
