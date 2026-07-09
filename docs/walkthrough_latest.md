# RedDot — Build Walkthrough

## Session 7: Landing Page Overhaul, Scroll Pinning Alignment, compressed ranges, and Scrolling Marquee (2026-07-09)

### What was done

**Rebuilt the public landing page and global styles** to adhere to the RedDot Design System v2 specification, aligning scrollytelling visual effects, scroll pinning vertical layout, scroll duration, copy editing, and animation seamlessness.

#### New files

| File | Purpose |
|------|---------|
| [DecryptReveal.tsx](file:///c:/Projects/reddot/src/components/layout/DecryptReveal.tsx) | SVG turbulence filter client component implementing static-resolving-to-signal phase image transition. |
| [copy-assets.js](file:///c:/Projects/reddot/src/scripts/copy-assets.js) | Asset synchronization helper script copying generated resources from `src/assets` to `public/assets` on prebuild. |
| [refactor-colors.js](file:///c:/Projects/reddot/src/scripts/refactor-colors.js) | Styling utility script mapping color tokens for the redesign overhaul. |
| [reddot-design-system.md](file:///c:/Projects/reddot/docs/reddot-design-system.md) | landing page redesign specification (Creative Direction, Motion Catalog, and Asset Manifest). |

#### Modified files

| File | Changes |
|------|---------|
| [page.tsx](file:///c:/Projects/reddot/src/app/page.tsx) | Removed layout conflicts on `core-orb` img; set ScrollTrigger start to `"top 15%"`; compressed pin scroll range to `+=1800`px; updated jump offsets; imported Activity/Sparkles/ShieldCheck Lucide icons; added `shrink-0` classes to marquee ribbon; edited Section 2 quotes, spacing, and spacer. |
| [globals.css](file:///c:/Projects/reddot/src/app/globals.css) | Added global `@keyframes marquee` rule for infinite horizontal scrolling translation. |

#### Verification
All 27 routes compile successfully with zero TypeScript compilation errors and production builds successfully:
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/ai/chat
├ ƒ /api/ai/insight
├ ƒ /api/ai/report
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/auth/reset-password
├ ƒ /api/auth/salt
├ ƒ /api/auth/signup
├ ƒ /api/sync/pull
├ ƒ /api/sync/push
├ ƒ /api/user/meta
├ ƒ /api/user/wipe
├ ○ /dashboard
├ ○ /dashboard/ai
├ ○ /dashboard/cycle
├ ○ /dashboard/insights
├ ○ /dashboard/know
├ ƒ /dashboard/know/[slug]
├ ○ /dashboard/log
├ ○ /dashboard/report
├ ○ /dashboard/settings
├ ○ /forgot-password
├ ○ /login
├ ○ /onboarding
├ ○ /privacy
└ ○ /signup
```

---

## Session 6: Session Persistence, Log Editing, Demo Data Seeder & Brand Consistency (2026-07-08)

### What was done

**Implemented key UX and reliability improvements** including sessionStorage-based encryption key retention to prevent logout on page refreshes, URL-based date parameter logging, a Settings-based 90-day cyclic history generator, reports link fixing, and consistent header navbar layouts.

#### Modified files

| File | Changes |
|------|---------|
| [crypto.ts](file:///c:/Projects/reddot/src/lib/crypto.ts) | Exported Web Crypto key import/export to Base64 helpers. |
| [auth-context.tsx](file:///c:/Projects/reddot/src/context/auth-context.tsx) | Implemented sessionStorage-based auth key persistence on login/signup and restoration on mount. |
| [ChatPageContent.tsx](file:///c:/Projects/reddot/src/components/ai/ChatPageContent.tsx) | Replaced raw anchor `<a>` link with Next.js `<Link>` to prevent full page reloads and state destruction. |
| [login/page.tsx](file:///c:/Projects/reddot/src/app/login/page.tsx) & [signup/page.tsx](file:///c:/Projects/reddot/src/app/signup/page.tsx) | Integrated fixed top navbar consistent with landing page. |
| [dashboard/log/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/log/page.tsx) | Supported query parameters `?date=YYYY-MM-DD` and added "Autofill Random Data" button. |
| [DayDetail.tsx](file:///c:/Projects/reddot/src/components/tracking/DayDetail.tsx) | Added editing redirect button routing to logs. |
| [dashboard/settings/page.tsx](file:///c:/Projects/reddot/src/app/dashboard/settings/page.tsx) | Added a "Generate 90-Day Demo History" seeder. |

---

## Session 5: Know Hub, Article Views, Navigation Sync, Local DB Mock, Login Sync Recovery & Resilient Decryption (2026-07-05)

### What was done

**Completed Phase 4 milestones, resolved login sync restore bug & added decryption resilience** by building the searchable/filtered educational Know Hub, creating dynamic article detail pages, implementing dynamic PillNav state synchronization, programming a transparent local persistent mock database fallback, wiring automatic cloud sync restores on successful logins, and building error-resilient decryption wrappers in the local data service to skip corrupted/unreadable records.

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
| [auth-context.tsx](file:///c:/Projects/reddot/src/context/auth-context.tsx) | Integrated automatic `pullAndSync()` invocation during user login when sync is enabled to restore browser IndexedDB records |
| [data.ts](file:///c:/Projects/reddot/src/lib/data.ts) | Added defensive try-catch decryption wrapping for all bulk read operations (entries, cycles, chats) to prevent corrupted records from crashing the dashboard |

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