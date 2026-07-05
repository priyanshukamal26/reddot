# RedDot — Build Walkthrough

## Session 5: Know Hub, Article Views, Navigation Sync & Local DB Mock (2026-07-05)

### What was done

**Completed Phase 4 milestones** by building the searchable/filtered educational Know Hub, creating dynamic article detail pages, implementing dynamic PillNav state synchronization, and programming a transparent local persistent mock database fallback.

#### New files

| File | Purpose |
|------|---------|
| [articles.ts](file:///c:/Projects/reddot/src/lib/articles.ts) | Educational articles database (4 cycle phase guides + 4 general topics) |
| [page.tsx](file:///c:/Projects/reddot/src/app/dashboard/know/page.tsx) | Know Hub index page rendering searchable lists, category tabs, and topic filters |
| [page.tsx](file:///c:/Projects/reddot/src/app/dashboard/know/[slug]/page.tsx) | Article detail page rendering responsive editorial typography, medical disclaimer box, and recommendations |

#### Modified files

| File | Changes |
|------|---------|
| [layout.tsx](file:///c:/Projects/reddot/src/app/dashboard/layout.tsx) | Integrated `usePathname` to keep active nav section state dynamically in sync with current route |
| [neon.ts](file:///c:/Projects/reddot/src/lib/neon.ts) | Integrated transparent mock SQL executor (`mockSql` saving to `mock_db.json`) when `DATABASE_URL` is omitted, allowing out-of-the-box local sandbox runs |

#### Verification
All 23 routes compile successfully with zero TypeScript compilation errors and production builds successfully:
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/ai/chat
├ ƒ /api/ai/report
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/auth/salt
├ ƒ /api/auth/signup
├ ƒ /api/sync/pull
├ ƒ /api/sync/push
├ ƒ /api/user/meta
├ ○ /dashboard
├ ○ /dashboard/ai
├ ○ /dashboard/cycle
├ ○ /dashboard/insights
├ ○ /dashboard/know
├ ƒ /dashboard/know/[slug]
├ ○ /dashboard/log
├ ○ /dashboard/report
├ ○ /dashboard/settings
├ ○ /login
├ ○ /onboarding
├ ○ /privacy
└ ○ /signup
```

---

## Session 4: Neon Sync, AI Chat, Report OCR & Recharts Insights (2026-07-05)

### What was done

**Completed Phase 0–3 MVP milestones** by establishing serverless Neon database cloud sync, Credentials-based Auth.js integration, Groq API chat, lab report OCR parsing, and a Recharts insights dashboard.

#### Added dependencies
- `@neondatabase/serverless` (Postgres client)
- `next-auth@5.0.0-beta.28` (Credentials Provider integration)
- `bcryptjs` / `@types/bcryptjs` (server password hashing)
- `recharts` (trends timeline)
- `pdf-parse` (PDF text extractor)
- `tesseract.js` (Image OCR engine)

#### New database and sync endpoints
- **Database Schema**: Setup `users`, `user_meta`, `encrypted_blobs`, and `report_analysis_events` tables in Neon Postgres (`src/scripts/migrate.js`).
- **Authentication Routes**: Added `/api/auth/signup` (credential validation and server-side password hashing) and `/api/auth/salt` (retrieves the unique PBKDF2 salt for login key derivation on new devices).
- **Sync Endpoints**: Added `/api/sync/push` (receives and stores encrypted JSON db bundles) and `/api/sync/pull` (serves the synced ciphertext to the client).
- **Auto-Sync Hook**: Wired client data writes (`saveEntry`, `saveCycle`, `saveChat`) in `src/lib/data.ts` to automatically push encrypted backup bundles to Neon in the background if cloud sync is enabled.

#### RedDot.ai chat completions & lab OCR
- **Chat Endpoint (`/api/ai/chat`)**: Integrates the Groq Llama 3.3 model using the verbatim prompts, safety preamble, and personalized context (the last 30 days of logged data and cycle phase status).
- **Lab report analysis (`/api/ai/report`)**: Parses uploaded reports in-memory using `pdf-parse` (for text PDFs) or `tesseract.js` (for image OCR). Highlights outliers, suggests questions for doctors, and enforces a strict zero-store security policy with active memory discard verification.
- **AI Chat Page (`/dashboard/ai`)**: Connects the chat UI component to IndexedDB-persisted chat history threads.
- **Lab Report Page (`/dashboard/report`)**: Renders file upload, consent dialog, and ephemeral processing results.

#### Recharts Insights timeline
- **Insights Page (`/dashboard/insights`)**: Visualizes user statistics and timelines for mood, sleep, energy, and symptom frequencies using Recharts, guarded against static hydration issues.
- **Settings Page (`/dashboard/settings`)**: Integrates backup exports/imports and sync toggles.

#### Verification
All 22 routes compile successfully with zero TypeScript compilation errors and production builds successfully:
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ƒ /api/ai/chat
├ ƒ /api/ai/report
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/auth/salt
├ ƒ /api/auth/signup
├ ƒ /api/sync/pull
├ ƒ /api/sync/push
├ ƒ /api/user/meta
├ ○ /dashboard
├ ○ /dashboard/ai
├ ○ /dashboard/cycle
├ ○ /dashboard/insights
├ ○ /dashboard/log
├ ○ /dashboard/report
├ ○ /dashboard/settings
├ ○ /login
├ ○ /onboarding
├ ○ /privacy
└ ○ /signup
```

---

## Session 3: Aesthetic Overhaul (2026-07-05)

### What was done

**Delivered a premium, Awwwards-grade visual overhaul** across the pre-login marketing surface and the in-app dashboard per the v2 Design System (`docs/07_DESIGN_SYSTEM.md`).

#### Added dependencies
- `gsap` (ScrollTrigger, animation sequences, timeline choreography)
- `lucide-react` (premium clean stroke icons)

#### Stylesheets & layout
- **`globals.css`**: Configured custom slow-floating keyframes for ambient blobs, custom scrollbars, a space-grid overlay utility, and glassmorphic panel styling.

#### Rebuilt public landing page (`src/app/page.tsx`)
- **Hero Section**: Massive bold typography, an animated vector PhaseRing drawing in on load, floating glowing gradients, and clear signal-red CTAs.
- **Trust Boundary Section**: An interactive visual grid tracing user sandbox data, client-side encryption borders, and encrypted Postgres cloud storage.
- **Cycle Spectrum**: Multi-column showcase of the monochrome red phase ramp (`phase-signal`, `phase-rise`, `phase-peak`, `phase-fade`).
- **AI Simulator Panel**: Glassmorphic chatbot preview showing active turns and user prompt queries.

#### Redesigned dashboard (`src/app/dashboard/page.tsx`)
- Re-themed cards to use semi-transparent `glass-panel` backdrops with micro-borders.
- Added glowing ambient spotlights and pulsing state indicators.
- Upgraded quick-action blocks to use Lucide React icons (`PenLine`, `Calendar`) and hover transitions.
- Styled metrics and prediction texts using precise monospace layouts.

---

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

---

## Session 1: Initial Build (2026-07-04)

### What was done

**Step 1: Full spec reading pass** — Read all 11 documentation files (00–10) in order. Verified comprehension of the two core differentiators (local-first encrypted architecture + RedDot.ai AI features), navigation model (pill nav: Tracking / RedDot.ai / Know + Profile popup), naming rule (RedDot for the product, RedDot.ai only for the AI feature), and the trust-boundary table.

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
| Neon/Auth | ⬜ | Not yet created/wired |

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