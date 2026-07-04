# 05 — Tech Stack

> **v2 update:** added the GSAP/Lenis motion stack for the landing page's scroll-driven animation sequence (07_DESIGN_SYSTEM.md, 06_PAGES_AND_FLOWS.md). Everything else is unchanged from v1.

Everything here is free at hackathon scale. Where a service has a "free tier limit that matters," it's called out.

## Frontend
- **Framework:** Next.js (App Router), React, TypeScript.
- **Hosting:** Vercel (free tier — generous enough for a hackathon demo's traffic; auto-deploys from GitHub).
- **Styling:** Tailwind CSS, configured with the design tokens from 07_DESIGN_SYSTEM.md (don't use default Tailwind palette — extend the theme with the named colors; v2 tokens are `void`/`paper`/`signal`/`signal-deep`/`ash`/`fog`/`error` plus the four phase-ramp tokens).
- **Charts:** Recharts (free, good enough for cycle/mood trend visualizations).
- **State management:** React state + Context is enough for this scope; don't introduce Redux/Zustand unless RedDot.ai's chat state genuinely needs it.
- **Motion (landing page only — added in v2):**
  - **Lenis** — smooth-scroll layer underneath everything else on the marketing site. Free, OSS.
  - **GSAP + ScrollTrigger** — scroll-driven choreography (pinning, scrubbing, staggers). GSAP was acquired by Webflow and made fully free in April 2025, including plugins that used to require a paid Club GreenSock membership.
  - **GSAP SplitText** — headline word/character reveals. Now free (see above) — no club membership needed.
  - **GSAP DrawSVG** — the phase-ring's stroke-draw-in animation. Now free (see above).
  - **Scope discipline:** this stack loads only on the public landing page route, not on the authenticated in-app routes — the dashboard/tracking/RedDot.ai/Know screens should stay light and fast, per 07_DESIGN_SYSTEM.md's note that the showpiece motion is a landing-page device, not an everywhere device. Use Next.js route-level code splitting (e.g., dynamic import, or simply not importing these libraries in any authenticated-route component) to keep them out of the in-app bundle.

## Backend
- **API layer:** Next.js API routes (App Router `route.ts` handlers) — no separate backend service needed for MVP. Keeps deployment simple (one Vercel project).
- **If a heavier background job is ever needed** (e.g., OCR taking too long for a serverless function's timeout): Render free tier as a small Node/Express service. Not needed for MVP; flag this as a fallback, not a starting point.

## Database
- **Neon** (serverless Postgres, free tier). Stores auth metadata + encrypted blobs only (see 04_DATA_MODEL.md). Free tier's storage/compute limits are far beyond what a hackathon demo needs.

## Auth
- **Auth.js (NextAuth)**, email/password credentials provider. Free, self-hosted within the Next.js app, no external service dependency. (OAuth providers like Google can be added later if useful, but email/password is enough for MVP and keeps the "your password derives your encryption key" story simple.)

## AI
- **Groq API**, free tier, no credit card required.
  - Model for the assistant + insights: **Llama 3.3 70B Versatile** — best quality available on Groq's free tier for conversational/analytical tasks.
  - Free tier limits to know (current as of mid-2026): roughly 30 requests/minute, 6,000 tokens/minute, and a per-day request cap that varies by model (low thousands). This is **fine for a hackathon demo** (a handful of judges/users testing it live) but would need the paid Developer tier for real production traffic. Mention this honestly if asked — it's a normal, expected hackathon constraint, not a flaw to hide.
  - Keep system prompts efficient (08_AI_PROMPTS_AND_LOGIC.md) to avoid burning the per-minute token budget on a single request during a live demo.

## OCR / document text extraction (for report analysis, E3)
- **PDFs with selectable text:** `pdf-parse` (Node library) — fast, no OCR needed, free.
- **Scanned PDFs/images:** Tesseract.js — free, runs server-side in the API route (or could run client-side, but the project decision was server-side processing, so run it in the Next.js API route, in memory, and discard immediately after — see 03_ARCHITECTURE.md).

## Encryption
- **Web Crypto API** — built into all modern browsers, zero dependency, zero cost. Used for PBKDF2 key derivation and AES-GCM encrypt/decrypt. No third-party crypto library needed; the native API is preferred (smaller surface area, no supply-chain risk from an extra dependency for something this sensitive).

## Local storage
- **IndexedDB**, accessed via a small wrapper library like `idb` (lightweight, just a Promise-based convenience layer over the native API — not adding real complexity).

## Dev/deploy summary

| Layer | Tool | Cost |
|---|---|---|
| Frontend hosting | Vercel | Free |
| Backend | Next.js API routes (on Vercel) | Free |
| Database | Neon (Postgres) | Free |
| Auth | Auth.js | Free (OSS) |
| AI | Groq API | Free tier |
| OCR | Tesseract.js / pdf-parse | Free (OSS) |
| Encryption | Web Crypto API | Free (browser-native) |
| Local storage | IndexedDB (+ `idb` wrapper) | Free (browser-native) |
| Charts | Recharts | Free (OSS) |
| Smooth scroll (landing only) | Lenis | Free (OSS) |
| Scroll choreography (landing only) | GSAP + ScrollTrigger, SplitText, DrawSVG | Free (made free by Webflow, April 2025) |

## Setup order (practical sequence)

1. `create-next-app` with TypeScript + Tailwind.
2. Push to GitHub, connect to Vercel for auto-deploy (do this early — deploying an empty shell on day one avoids deployment surprises later).
3. Create a Neon project, get the connection string, add it to Vercel env vars.
4. Set up Auth.js with the credentials provider against the Neon `users` table.
5. Build the encryption + IndexedDB layer (this underpins almost everything else — build it before most UI screens).
6. Build core cycle/mood logging screens against the encryption + IndexedDB layer.
7. Get a Groq API key, wire up the RedDot.ai assistant endpoint + encrypted local chat-history storage.
8. Build the report-analysis endpoint (OCR + Groq), as a mode within RedDot.ai.
9. Build sync (Neon ciphertext push/pull) — additive, not load-bearing for the demo's core story.
10. **Build the landing page last, as its own focused effort** (added in v2): the GSAP/Lenis sequence is a substantial, self-contained piece of work distinct from the rest of the app's engineering, and it has no dependency on the backend being finished. It can be built in parallel by a teammate once the design system (07_DESIGN_SYSTEM.md v2) is locked, or saved for the end once the product itself works — either way, don't let landing-page polish block core product functionality from being demoable.
