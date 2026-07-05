# RedDot — Build Walkthrough

## Session 2: Data Flow Wiring (2026-07-05)

### What was done

**Wired data flow end-to-end** — turned static screens into a working local-first encrypted product by connecting all UI screens to the data service → encryption layer → IndexedDB pipeline.

#### New files

| File | Purpose |
|------|---------|
| [auth-context.tsx](file:///c:/Projects/reddot/src/context/auth-context.tsx) | React context managing password-derived `CryptoKey` in memory. Provides `signup()`, `login()`, `logout()`, `refreshMeta()` |
| [providers.tsx](file:///c:/Projects/reddot/src/app/providers.tsx) | Client component wrapper — bridges server-component root layout to client-side `AuthProvider` |
| [AuthGuard.tsx](file:///c:/Projects/reddot/src/components/auth/AuthGuard.tsx) | Route protection: redirects to `/login` if unauthenticated, to `/onboarding` if not onboarded |
| [layout.tsx](file:///c:/Projects/reddot/src/app/dashboard/layout.tsx) | Dashboard layout — wraps all `/dashboard/*` routes with AuthGuard + AppShell (nav + profile) |

#### Modified files

| File | Changes |
|------|---------|
| [layout.tsx](file:///c:/Projects/reddot/src/app/layout.tsx) | Wrapped children with `<Providers>` |
| [signup/page.tsx](file:///c:/Projects/reddot/src/app/signup/page.tsx) | Calls `signup()` → derives key → saves salt → redirects to `/onboarding` |
| [login/page.tsx](file:///c:/Projects/reddot/src/app/login/page.tsx) | Calls `login()` → loads salt → derives key → redirects to `/dashboard` |
| [onboarding/page.tsx](file:///c:/Projects/reddot/src/app/onboarding/page.tsx) | Saves first `Cycle` record + sets `onboarding_done` in meta → redirects to dashboard |
| [dashboard/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/page.tsx) | Reads real cycles via `loadAllCycles()` → calculates phase → drives PhaseRing + prediction |
| [dashboard/log/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/log/page.tsx) | Saves real entries via `saveEntry()`, loads existing for editing, auto-creates Cycle on new period |
| [dashboard/cycle/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/cycle/page.tsx) | Reads real entries via `loadAllEntries()` → transforms for heatmap, loads entry detail on click |

#### Data flow architecture

```
Signup → password → PBKDF2(password, salt) → CryptoKey [in-memory only]

Onboarding → Cycle + AppMeta → encrypt → IndexedDB
Daily log  → DailyEntry      → encrypt → IndexedDB
Dashboard  → IndexedDB → decrypt → calculateCycleStats() → PhaseRing
Cycle view → IndexedDB → decrypt → heatmap + day detail
Login      → loadMeta().salt → deriveKey() → resume session
```

---

## Session 1: Initial Build (2026-07-04)

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
| Auth context | ✅ | [auth-context.tsx](file:///c:/Projects/reddot/src/context/auth-context.tsx) — local-first auth via PBKDF2 |
| Neon tables | ⬜ | Not yet created — needs Neon project |
| Auth.js | ⬜ | Not yet wired — needs Neon connection string |

**Phase 1 — Core Tracking (fully wired)**

| Item | Status | Details |
|------|--------|---------|
| Onboarding | ✅ | [onboarding/page.tsx](file:///c:/Projects/reddot/src/app/onboarding/page.tsx) — 4-step flow, saves real data |
| Dashboard | ✅ | [dashboard/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/page.tsx) — real PhaseRing + prediction |
| Phase ring | ✅ | [PhaseRing.tsx](file:///c:/Projects/reddot/src/components/tracking/PhaseRing.tsx) — canvas gradient ring |
| Daily log | ✅ | [dashboard/log/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/log/page.tsx) — real encrypted save + edit |
| Cycle heatmap | ✅ | [CycleHeatmap.tsx](file:///c:/Projects/reddot/src/components/tracking/CycleHeatmap.tsx) — real entry data |
| Day detail | ✅ | [DayDetail.tsx](file:///c:/Projects/reddot/src/components/tracking/DayDetail.tsx) — real entry display |
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
| Login | [login/page.tsx](file:///c:/Projects/reddot/src/app/login/page.tsx) — wired to auth context |
| Signup | [signup/page.tsx](file:///c:/Projects/reddot/src/app/signup/page.tsx) — wired to auth context |

### Build verification

All 9 routes build clean with `npm run build`:
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /dashboard/cycle
├ ○ /dashboard/log
├ ○ /login
├ ○ /onboarding
├ ○ /privacy
└ ○ /signup
```

### What's next

1. **Neon + Auth.js** — create Neon project, migrate tables, wire Auth.js credentials provider (needs connection string from user)
2. **Groq API integration** — wire the chat endpoint with the exact system prompts from 08_AI_PROMPTS_AND_LOGIC.md, connect chat UI shell (needs API key)
3. **Insights tab** — trend charts using Recharts within Tracking
4. **Export/Import UI** — functions exist in data.ts, need button triggers
5. **Landing page** — GSAP/Lenis scroll sequence (Phase 5, parallelizable)