# RedDot — Project Track

## How to use this file
This is the single source of truth for build progress. Update it
immediately after completing any meaningful unit of work — not in a
batch at the end of a session. Every entry gets a timestamp. Nothing
is ever deleted from the History Log; mark things superseded, don't
erase them.

## Current Status
**Landing Page Overhaul, Scroll Pinning Alignment, compressed ranges, and Scrolling Marquee complete.** Rebuilt the public landing page (`src/app/page.tsx`) and global styles (`src/app/globals.css`) in accordance with the v2 Design System spec. Resolved the background `core-orb.jpeg` parallax positioning and scrolling issue by eliminating Tailwind v4 layout conflicts. Added padding and shunk Section 2's spacer to ensure clean layout separation. Fixed inline icon rendering in Section 3's heading using proper Lucide icons. Vertically centered the Section 3 scroll pinning using `"top 15%"` and compressed the range by 25% to `+=1800`px with proportional click offsets. Enabled seamless horizontal scrolling marquee using global keyframes and `shrink-0` classes. Created custom SVG filter `DecryptReveal` image transition component and copy-assets helper scripts. Checked and verified all builds pass successfully.

## Build Plan (mirrors 10_MVP_BUILD_PLAN.md — keep in sync with it)

### Phase 0 — Foundation
- [x] 1. Next.js + TypeScript + Tailwind scaffold, deployed to Vercel. Tailwind theme configured with v2 design tokens (`void`/`paper`/`signal`/`signal-deep`/`ash`/`fog`/`error` + phase-ramp tokens `phase-signal`/`phase-rise`/`phase-peak`/`phase-fade`).
- [x] 2. Neon project + tables migrated (`users`, `encrypted_blobs`, `user_meta`, `report_analysis_events`).
- [x] 3. Auth.js wired to Neon `users` table — sign up / log in working E2E.
- [x] 4. Encryption layer: PBKDF2 key derivation (100k iterations, SHA-256) + AES-GCM 256-bit encrypt/decrypt utility functions in `lib/crypto.ts`. Unit tested in isolation.
- [x] 5. IndexedDB wrapper (via `idb`) with `entries`/`cycles`/`meta`/`chats` stores per 04_DATA_MODEL.md.
- [x] 6. Pill nav component (Tracking / RedDot.ai / Know segments + Profile button, sliding active-state fill).

### Phase 1 — Core Tracking Loop (under "Tracking")
- [x] 7. Onboarding flow (privacy intro → cycle basics → sync choice → first insight).
- [x] 8. Dashboard with phase-ring component (monochrome gradient-ramp version, not flat arcs). Static version first: current phase + day calculation from logged cycles.
- [x] 9. Daily log screen (mood, symptoms, sleep/energy/appetite/exercise, journal) → encryption layer → IndexedDB.
- [x] 10. Creative cycle-history view (heatmap version — MVP-safe per C4) + day detail slide-up panel.
- [x] 11. Irregular-cycle-aware prediction logic (C2 range-based prediction). Simple average first, then regular/irregular check.
- [x] 12. Cycle Insights tab within Tracking (trend charts) — basic version.

### Phase 2 — Privacy Features
- [x] 13. Export (encrypted backup file download, includes chat history).
- [x] 14. Import (restore from backup file, includes chats).
- [x] 15. Last-backup indicator on dashboard + Profile popup.
- [x] 16. Sync toggle + Neon sync endpoint (ciphertext push/pull via `encrypted_blobs`).
- [ ] 17. Password reset flow with data-loss warning modal.
- [x] 18. Privacy page (B7) — content-heavy; mentions RedDot.ai by name, discloses AI plaintext exception honestly, all mandatory disclaimers placed per 09_SECURITY_AND_PRIVACY.md table.

### Phase 3 — AI Layer ("RedDot.ai")
- [x] 19. Groq API key setup, basic chat endpoint wired to chat UI under RedDot.ai pill. Uses system prompt from 08_AI_PROMPTS_AND_LOGIC.md verbatim (shared safety preamble + E1 prompt).
- [x] 20. Encrypted local chat history: write exchanges to `chats` IndexedDB store, past-chats list (content-neutral `title_hint`), resume-from-history with context intact. (MVP-tier, feature E5.)
- [x] 21. RedDot.ai first-use disclaimer modal.
- [x] 22. Report analysis mode/tab within RedDot.ai: file handling → OCR/text-extraction → Groq call → response (E3 system prompt).
- [x] 23. Report upload consent modal + result screen with discard confirmation + timestamp.

### Phase 4 — Know Hub + Polish/V1.1
- [x] 24. Know hub + article detail (H1/H2) — 1 explainer per phase (4) + 3–5 general articles.
- [ ] 25. Daily/weekly AI insight card (E2).
- [ ] 26. Phase-correlated insights (D4).
- [ ] 27. Logging streaks (F1).
- [ ] 28. Gentle reminders (F2).
- [ ] 29. Symptom pattern flags (G1).
- [ ] 30. Panic wipe (B6).
- [ ] 31. Radial/spiral cycle-view upgrade (C4 stretch version).
- [x] 32. Visual polish pass across all in-app screens vs 07_DESIGN_SYSTEM.md v2.

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

[2026-07-09 23:10] — **Landing Page Overhaul, Scroll Pinning Alignment, compressed ranges, and Scrolling Marquee.** Rebuilt public landing page (src/app/page.tsx) and global styles (src/app/globals.css) to adhere to the RedDot Design System v2 specification. Resolved the background core-orb image alignment/scrolling issue by removing Tailwind v4 layout conflicts and inline style overrides, letting GSAP manage positioning. Resolved overlapping in Section 2 by adding vertical padding to Action Pills and reducing the bottom spacer height. Cleared double quotes from Section 2 heading and imported/rendered appropriate Lucide icons in Section 3's inline icon cluster. Vertically centered Section 3 scroll pinning by updating ScrollTrigger start to 'top 15%' and compressed the pinned scroll range by 25% (to +=1800px) with proportional midpoint adjustments. Created global keyframes for marquee in globals.css and added shrink-0 classes to marquee divs to enable seamless scrolling. Introduced custom SVG filter DecryptReveal component and copy-assets helper scripts. Production build is verified clean.

[2026-07-08 20:50] — **Session Persistence, Log Editing, Demo Data Seeder & Brand Consistency.** Implemented sessionStorage-based key retention for PBKDF2 derived encryption keys, ensuring page refreshes do not log users out. Changed derived keys to extractable and added `exportKeyToBase64` / `importKeyFromBase64` helpers using Web Crypto APIs. Replaced raw `<a>` anchor tags with Next.js `<Link>` components in the chat page to avoid full-page reloads and preserve state. Added a fixed top navbar to the login and signup pages consistent with the landing page. Added URL-based date parameter routing (`?date=YYYY-MM-DD`) for historical logs, alongside an "Autofill Random Data" button in the Daily Log. Designed and built a 90-day mock history generator under Settings to seed realistic cyclic symptoms, mood, and sleep data in IndexedDB. Audited all server API endpoints to guarantee proper NextAuth session protection. Next.js build is verified clean.

[2026-07-05 23:15] — **Know Hub, Article Details, Navigation Sync, Local DB Mock, Login Sync Recovery & Resilient Decryption.** Created static educational data layer (`src/lib/articles.ts`) comprising 4 cycle phase guides and 4 general topics. Designed and implemented the searchable and filtered Know Hub (`/dashboard/know`) and editorial detail pages (`/dashboard/know/[slug]`) featuring responsive glassmorphic cards, medical disclaimer warnings, and recommended next modules. Updated `DashboardLayout` to synchronize PillNav active segment dynamically with Next.js URL paths using `usePathname`. Built a local sandbox database mock in `src/lib/neon.ts` (persisting in `mock_db.json`) allowing registration, logins, and settings/sync testing locally when Neon database URL is not configured. Resolved dashboard sync malfunction by adding automatic `pullAndSync()` invocation to `login()` in `src/context/auth-context.tsx` to restore browser IndexedDB records for cloud-sync-enabled accounts. Programmed defensive try-catch decryption wrapping for all bulk read operations in `src/lib/data.ts` (entries, cycles, chats) to skip individual corrupted/unreadable records instead of crashing the dashboard. Project compiles and builds successfully with 0 TypeScript errors.

[2026-07-05 22:50] — **Neon Cloud Sync, Groq Chat Integration, OCR Lab Analysis, & Insights Tab.** Run Neon migrations creating tables for `users`, `user_meta`, `encrypted_blobs`, and `report_analysis_events`. Integrated NextAuth credentials-based login verification with Neon user table. Implemented Cloud Sync push (`/api/sync/push`) and pull (`/api/sync/pull`) endpoints storing client-side encrypted blobs, with automatic synchronization triggers on local db writes. Wired Groq API AI completion (`/api/ai/chat`) and built the chat page (`/dashboard/ai`) using IndexedDB-persisted chat threads and token-efficient user log summaries. Built blood report OCR/PDF text extraction endpoint (`/api/ai/report`) using `pdf-parse` and `tesseract.js` image OCR with zero-store privacy guarantee and active delete verification. Implemented Recharts insights timeline (`/dashboard/insights`) mapping mood, sleep, energy, and symptom frequency, guarded against SSR hydration mismatch. Next.js build is verified clean with 0 TypeScript/compilation errors.

[2026-07-05 22:05] — **Aesthetic Overhaul & Premium Redesign.** Rebuilt the main landing page (`src/app/page.tsx`) to deliver an Awwwards-grade experience featuring GSAP ScrollTrigger timeline reveals, animated SVG drawing, floating gradient blurs, interactive trust-boundary card graphics, and a mock AI chat assistant preview. Re-themed the dashboard (`src/app/dashboard/page.tsx`) using dark-mode glassmorphism (`glass-panel`), glowing ambient highlights, Lucide React icons, and a highly polished UI. Added `gsap` and `lucide-react` to dependencies, and configured `globals.css` with ambient float animations and layout grid overlays. Fixed a React render-phase state update warning in `LoginPage` by wrapping its authentication redirect check inside a `useEffect` hook. All routes build clean with 0 TypeScript errors.

[2026-07-05 21:25] — **Data flow wired end-to-end.** Created AuthContext provider (local-first password → PBKDF2 key derivation, key in React context), Providers wrapper, AuthGuard route protection, dashboard layout (AuthGuard + AppShell). Wired signup → auth context signup() → derive key + save salt to IndexedDB → redirect to onboarding. Wired onboarding → save first Cycle record + mark onboarding_done in meta → dashboard. Wired dashboard → loadAllCycles() → calculateCycleStats() → getCurrentPhase() → real PhaseRing + predictNextPeriod(). Wired daily log → saveEntry() (encrypt → IndexedDB) + loadEntryByDate() for edit mode + auto Cycle creation on new period start. Wired cycle view → loadAllEntries() → real heatmap data + loadEntryByDate() for day detail. Wired login → loadMeta() for salt → deriveKey() → redirect. All 9 routes build clean (zero TS errors). New files: src/context/auth-context.tsx, src/app/providers.tsx, src/components/auth/AuthGuard.tsx, src/app/dashboard/layout.tsx. Modified: layout.tsx, signup, login, onboarding, dashboard, daily log, cycle view.

[2026-07-04 17:35] — Phase 1 UI screens built: onboarding flow (4-step wizard with privacy intro, cycle basics with irregular option, sync choice, completion), dashboard with PhaseRing + quick actions + AI insight preview + backup indicator + disclaimer, daily log screen (period/flow/symptoms/mood/scales/journal — targets <15s logging), creative heatmap cycle view (GitHub-contribution-style with monochrome red ramp, demo data for 6 months), day detail slide-up panel. Auth pages: login + signup with mandatory encryption-key acknowledgment checkbox. Privacy page (B7) with all mandatory disclaimers from 09_SECURITY_AND_PRIVACY.md placed. RedDot.ai chat UI shell component (past-chats sidebar, message list, suggested prompts, persistent disclaimer). All 8 routes build clean. Next: wire data flow, insights tab, then Neon/Auth.

[2026-07-04 16:59] — Phase 0 bulk progress: built encryption layer (lib/crypto.ts — PBKDF2 + AES-GCM, Web Crypto only), data types (lib/types.ts — all shapes from 04_DATA_MODEL.md), IndexedDB wrapper (lib/db.ts — entries/cycles/meta/chats stores with indexes), data service (lib/data.ts — encrypt→store and load→decrypt bridge), cycle calculation logic (lib/cycle.ts — phase calc + irregular-cycle prediction per C2), PillNav component with sliding signal-red indicator, ProfilePopup dropdown, AppShell layout, and PhaseRing canvas component (continuous gradient-ramp ring per 07_DESIGN_SYSTEM.md). Build verified clean. Next: Neon + Auth.js, then onboarding flow.

[2026-07-04 16:52] — Scaffolded Next.js 16 + TypeScript + Tailwind v4 (App Router, src dir). Configured globals.css with v2 design tokens from 07_DESIGN_SYSTEM.md: void/paper/signal/signal-deep/ash/fog/error + 4 phase-ramp tokens. Updated root layout with Inter (body) + JetBrains Mono (data) fonts. Build verified clean.

[2026-07-04 16:20] — Completed full reading pass of all 11 specification docs (00_README through 10_MVP_BUILD_PLAN). Comprehension verified: product is RedDot (menstrual health tracker), two core differentiators are (1) local-first encrypted architecture and (2) RedDot.ai's AI features. Navigation is pill nav (Tracking / RedDot.ai / Know + Profile popup). Naming: "RedDot" for the product, "RedDot.ai" only for the AI feature. Created this project_track.md. Next: begin Phase 0 scaffold.

## Doc Sync Notes

[2026-07-09 23:10] — Created docs/reddot-design-system.md landing page redesign spec. Updated walkthrough.md in artifacts folder documenting Section 2 & 3 layout, spacing, scroll range compression, and marquee fixes.
[2026-07-08 20:50] — Created `walkthrough.md` in artifacts folder outlining details of sessionStorage key persistence, Reports link fix, auth pages navigation headers, and endpoint protection verification.
[2026-07-05 23:15] — Created `walkthrough.md` in artifacts directory outlining details of Phase 4 build, dynamic route parameters, local DB mocks, and embedded full-flow walkthrough recording.
[2026-07-05 22:05] — Updated `docs/walkthrough_latest.md`: documented the aesthetic overhaul, GSAP scrollytelling sequences, ambient blurs, and glassmorphic dashboards.
[2026-07-05 21:36] — Updated `docs/walkthrough_latest.md`: added Session 2 (data flow wiring) details, updated all status tables to reflect wired state, preserved Session 1 content.
