# RedDot — Build Walkthrough

## Completed: Initial Build Session (2026-07-04)

### What was done

**Step 1: Full spec reading pass** — Read all 11 documentation files (00–10) in order. Verified comprehension of the two core differentiators (local-first encrypted architecture + RedDot.ai AI features), navigation model (pill nav: Tracking / RedDot.ai / Know + Profile popup), naming rule (RedDot for the product, RedDot.ai only for the AI feature), and the trust-boundary table.

> [!NOTE]
> `11_STITCH_PROMPT.md` referenced in the user's instructions doesn't exist — only 11 files (00–10) are present. No action needed.

**Step 2: Created `project_track.md`** — Living build log at project root with all phases from 10_MVP_BUILD_PLAN.md, timestamped history, decisions log, and doc sync notes.

**Step 3: Phase 0 — Foundation (mostly complete)**

| Item | Status | Details |
|------|--------|---------|
| Next.js scaffold | ✅ | Next.js 16 + TypeScript + Tailwind v4, App Router, src dir |
| Design tokens | ✅ | All v2 tokens from 07_DESIGN_SYSTEM.md configured in globals.css |
| Fonts | ✅ | Inter (body) + JetBrains Mono (data) via next/font/google |
| Encryption layer | ✅ | [crypto.ts](file:///c:/Projects/reddot/src/lib/crypto.ts) — PBKDF2 100k iterations + AES-GCM-256, Web Crypto only |
| Data types | ✅ | [types.ts](file:///c:/Projects/reddot/src/lib/types.ts) — all shapes from 04_DATA_MODEL.md |
| IndexedDB wrapper | ✅ | [db.ts](file:///c:/Projects/reddot/src/lib/db.ts) — 4 stores: entries, cycles, meta, chats |
| Data service | ✅ | [data.ts](file:///c:/Projects/reddot/src/lib/data.ts) — encrypt→store / load→decrypt bridge |
| Cycle logic | ✅ | [cycle.ts](file:///c:/Projects/reddot/src/lib/cycle.ts) — phase calc + irregular-cycle prediction |
| Pill nav | ✅ | [PillNav.tsx](file:///c:/Projects/reddot/src/components/nav/PillNav.tsx) — sliding signal-red indicator |
| Profile popup | ✅ | [ProfilePopup.tsx](file:///c:/Projects/reddot/src/components/nav/ProfilePopup.tsx) |
| App shell | ✅ | [AppShell.tsx](file:///c:/Projects/reddot/src/components/layout/AppShell.tsx) |
| Neon tables | ⬜ | Not yet created — needs Neon project |
| Auth.js | ⬜ | Not yet wired — needs Neon connection string |

**Phase 1 — Core Tracking (UI built, data wiring pending)**

| Item | Status | Details |
|------|--------|---------|
| Onboarding | ✅ | [onboarding/page.tsx](file:///c:/Projects/reddot/src/app/onboarding/page.tsx) — 4-step flow |
| Dashboard | ✅ | [dashboard/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/page.tsx) — PhaseRing + actions |
| Phase ring | ✅ | [PhaseRing.tsx](file:///c:/Projects/reddot/src/components/tracking/PhaseRing.tsx) — canvas gradient ring |
| Daily log | ✅ | [dashboard/log/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/log/page.tsx) — <15s target |
| Cycle heatmap | ✅ | [CycleHeatmap.tsx](file:///c:/Projects/reddot/src/components/tracking/CycleHeatmap.tsx) — GitHub-style |
| Day detail | ✅ | [DayDetail.tsx](file:///c:/Projects/reddot/src/components/tracking/DayDetail.tsx) — slide-up panel |
| Cycle view page | ✅ | [dashboard/cycle/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/cycle/page.tsx) |
| Insights tab | ⬜ | Not yet built |

**Phase 2 — Privacy (partially built)**

| Item | Status |
|------|--------|
| Privacy page (B7) | ✅ — [privacy/page.tsx](file:///c:/Projects/reddot/src/app/privacy/page.tsx) |
| Export/Import | ⬜ |
| Sync | ⬜ |
| Password reset | ⬜ |

**Phase 3 — AI (UI shell built)**

| Item | Status |
|------|--------|
| Chat UI component | ✅ — [ChatPageContent.tsx](file:///c:/Projects/reddot/src/components/ai/ChatPageContent.tsx) |
| Groq integration | ⬜ |
| Chat history persistence | ⬜ |
| Report analysis | ⬜ |

**Auth pages**

| Page | File |
|------|------|
| Login | [login/page.tsx](file:///c:/Projects/reddot/src/app/login/page.tsx) |
| Signup | [signup/page.tsx](file:///c:/Projects/reddot/src/app/signup/page.tsx) |

### Build verification

All 8 routes build clean with `npm run build`:
```
Route (app)
├ ○ /
├ ○ /dashboard
├ ○ /dashboard/cycle
├ ○ /dashboard/log
├ ○ /login
├ ○ /onboarding
├ ○ /privacy
└ ○ /signup
```

### What's next

1. **Wire data flow end-to-end** — connect onboarding → data service → IndexedDB → dashboard (the screens exist, they need to read/write real data through the encryption layer)
2. **Neon + Auth.js** — create Neon project, migrate tables, wire Auth.js credentials provider
3. **Insights tab** — trend charts using Recharts
4. **Export/Import** — the functions exist in data.ts, need UI triggers
5. **Groq API integration** — wire the chat endpoint with the exact system prompts from 08_AI_PROMPTS_AND_LOGIC.md
6. **Landing page** — GSAP/Lenis scroll sequence (Phase 5, parallelizable)