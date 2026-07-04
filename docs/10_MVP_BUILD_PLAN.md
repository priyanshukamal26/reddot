# 10 — MVP Build Plan (v2)

> **Revision note:** sequencing is updated for the v2 scope additions — the pill nav (Tracking/RedDot.ai/Know), RedDot.ai's persistent chat history, the creative cycle-history view, the Know education hub, and the GSAP/Lenis landing page as a distinct, parallelizable workstream. The core principle from v1 is unchanged: if something has to be cut under time pressure, cut from the bottom of this list, never by quietly weakening the privacy architecture (see 00_README_START_HERE.md).

## Goal of this doc

Translate 02_FEATURE_SPEC.md's MVP-tagged features into a buildable order, with explicit cut lines if time runs short.

## Build order

### Phase 0 — Foundation (do this before any feature screens)
1. Next.js + TypeScript + Tailwind scaffold, deployed to Vercel (empty shell, but deployed — derisks deployment surprises early). Configure the Tailwind theme with the v2 design tokens (`void`/`paper`/`signal`/`signal-deep`/`ash`/`fog`/`error` + the four phase-ramp tokens) from the start, so every screen built afterward already uses the right palette instead of needing a re-theme pass later.
2. Neon project created, `users`/`encrypted_blobs`/`user_meta`/`report_analysis_events` tables migrated (no schema change needed for chat sync — it reuses `encrypted_blobs`, see 04_DATA_MODEL.md).
3. Auth.js wired to Neon `users` table — sign up / log in working end to end.
4. Encryption layer: PBKDF2 key derivation from password + AES-GCM encrypt/decrypt utility functions, unit-testable in isolation before any UI depends on them.
5. IndexedDB wrapper (via `idb`) with the `entries`/`cycles`/`meta`/**`chats`** object stores from 04_DATA_MODEL.md — build the `chats` store now even though RedDot.ai's UI comes later in Phase 3; it's a small addition to the same wrapper code and avoids a second pass through this layer.
6. Build the **pill nav component** itself (Tracking / RedDot.ai / Know segments + Profile button, with the sliding active-state fill) as a standalone, reusable shell — every post-login screen mounts inside it, so it's worth getting right once rather than retrofitting it under three different section layouts later.

**Why this order:** almost everything else depends on auth + encryption + storage + the nav shell existing first.

### Phase 1 — Core tracking loop (lives under "Tracking")
7. Onboarding flow (privacy intro → cycle basics → sync choice → first insight).
8. Dashboard with the phase-ring component — build the **monochrome gradient-ramp version** directly (not four flat-colored arcs then convert later); static version first (current phase + day calculation from logged cycles), irregular-cycle confidence logic can follow.
9. Daily log screen (mood, symptoms, sleep/energy/appetite/exercise, journal) writing through the encryption layer into IndexedDB.
10. **Creative cycle-history view** — build the heatmap version first (the MVP-safe choice per 02_FEATURE_SPEC.md's C4); the radial/spiral view is Phase 4/stretch, not blocking here. Plus day detail (slide-up panel).
11. Irregular-cycle-aware prediction logic (C2's range-based prediction) — simple average-based version first, then layer in the regular/irregular check.
12. Cycle Insights tab within Tracking (trend charts) — basic version; phase-correlated pattern text (D4) is Phase 4.

**Demo-readiness checkpoint:** at the end of Phase 1, the app should be fully demoable as a tracker under the new nav, even with no AI yet. Don't skip ahead before this loop genuinely works.

### Phase 2 — Privacy features that make the architecture real, not just claimed
13. Export (encrypted backup file download) — include chat history in the exported bundle now that it exists, not as a later add-on.
14. Import (restore from backup file) — same note, restore chats too.
15. Last-backup indicator on dashboard + in the Profile popup.
16. Sync toggle + Neon sync endpoint (ciphertext push/pull) — `encrypted_blobs` already accommodates chat sync via `blob_type`, so this doesn't need separate work later.
17. Password reset flow with the data-loss warning modal.
18. Privacy page (can be written/designed early in parallel with engineering work — it's mostly content). Update its copy to mention RedDot.ai by name and confirm chat history follows the same local-first/ciphertext-sync rule as everything else — this is a meaningful trust claim now, not a minor footnote.

### Phase 3 — AI layer ("RedDot.ai")
19. Groq API key set up, basic chat endpoint wired to a chat UI under the RedDot.ai pill, using the system prompt from 08_AI_PROMPTS_AND_LOGIC.md.
20. **Encrypted local chat history**: writing each exchange into the `chats` IndexedDB store, building the past-chats list (with the content-neutral `title_hint` — see 04_DATA_MODEL.md), and resume-from-history (loading a thread and continuing it with context intact). This is now MVP-tier (feature E5), not a stretch add-on — build it in this phase, not deferred to polish.
21. RedDot.ai first-use disclaimer modal.
22. Report analysis as a mode/tab within RedDot.ai: file handling → OCR/text-extraction → Groq call → response, with the strict E3 system prompt.
23. Report upload consent modal + result screen with discard confirmation.

**Demo-readiness checkpoint:** this phase is what separates the submission from "another tracker." Chat (with working history/resume), report analysis, and the discard confirmation should all be working and demoable before spending more time polishing visuals further.

### Phase 4 — "Know" hub + remaining polish/V1.1 features
24. **Know hub + article detail** (H1/H2) — write a focused set of real content rather than a sprawling, half-finished library: aim for one short explainer per phase (4 total) plus 3–5 general topic articles (e.g., PCOS basics, tracking irregular cycles, what's normal vs. worth flagging to a doctor). Quality and correctness over volume — a small set of well-written, properly-disclaimed articles is more credible (and faster to build) than a large thin one.
25. Daily/weekly AI insight card (E2).
26. Phase-correlated insights (D4), if not already done in Phase 1.
27. Logging streaks (F1).
28. Gentle reminders (F2).
29. Symptom pattern flags (G1).
30. Panic wipe (B6).
31. Radial/spiral cycle-view upgrade (C4 stretch version), if the heatmap is solid and time remains.
32. Visual polish pass across all in-app screens against 07_DESIGN_SYSTEM.md v2 (sharp-corner consistency, "spend the red" discipline check, responsive checks).

### Phase 5 — Landing page (parallelizable; can start as early as the design system is locked)
33. Build the GSAP/Lenis-driven landing page per 06_PAGES_AND_FLOWS.md's section-by-section motion spec. **This phase has no hard dependency on Phases 1–4 being finished** — it needs the design system (07_DESIGN_SYSTEM.md v2) and the content/copy decisions (headline, section copy), not a working backend. If team size allows, assign this to whoever isn't deep in the encryption/AI plumbing and run it in parallel starting around Phase 1–2; if working solo, treat it as the last major block of work, since a broken or half-built landing page is far less damaging to a demo than a broken core product.
34. Privacy page polish to match the v2 visual system (it's currently scoped as "mostly content" in Phase 2 — give it a final pass here so it matches the bolder palette rather than reading like a leftover plain page).

### Cut entirely if needed (stretch tier, fine to mention only in the pitch as "what's next")
- Partner/support-person sharing (B8).
- Cycle health score (F3).
- Mood-pattern narrator (E4).
- Medication/birth control reminder log (G2).
- Radial/spiral cycle view (fall back to the heatmap, which is already MVP-tier).
- A large Know content library (fall back to the small curated set described in Phase 4).

## Demo narrative (what to actually show judges)

Updated for the new nav/branding — same underlying differentiators as v1, now shown through the v2 surface:

1. **Open on the landing page** — let the GSAP sequence run for a few seconds; this is the first impression and where the "Awwwards-grade" ambition actually gets judged. Don't rush past it.
2. **Sign up / log in, land on the dashboard** — show the monochrome phase-ring live.
3. **Show the privacy architecture concretely** — open dev tools/network tab live with sync off, show no health data in transit; show an exported backup file as unreadable raw text. More convincing than describing it in slides.
4. **Switch to the Tracking pill** — show the creative heatmap cycle view, log a day, show Insights.
5. **Switch to RedDot.ai** — ask it something using real logged data, then open the past-chats list and resume an earlier conversation to prove history/resume actually works, not just that the first message worked.
6. **Show report upload → analysis → discard confirmation** within RedDot.ai — the single most differentiating feature; give it real screen time.
7. **Quick pass through Know** — shows product completeness/breadth without needing to read an article aloud.
8. **Close on "why this matters now"** — the FTC/Flo history, the post-Roe context, from 01_PROJECT_BRIEF.md — this is what makes the privacy architecture feel necessary rather than decorative, and is a strong note to end on rather than open on.

## Explicit non-goals for MVP (don't let scope creep in during build)

- No native mobile app — web-responsive only (the landing page's scroll sequence must still work on mobile per current scrollytelling practice, but this is "responsive web," not "native app").
- No payment/subscription system of any kind.
- No multi-language support.
- No admin dashboard/backoffice.
- No incremental sync conflict resolution — full-blob overwrite sync is fine, including for chat sync (see 04_DATA_MODEL.md's note on this).
- No AI-generated or dynamically-sourced Know content for MVP — hand-written/curated only (see Phase 4).
