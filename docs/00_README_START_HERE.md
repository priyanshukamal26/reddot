# Project Docs — Start Here

This folder is the full specification for the project. Read in this order if you're an agent/IDE picking this up cold:

1. **00_README_START_HERE.md** — this file
2. **01_PROJECT_BRIEF.md** — what we're building, why, for whom, hackathon context
3. **02_FEATURE_SPEC.md** — every feature, MVP-scoped vs stretch, with acceptance criteria
4. **03_ARCHITECTURE.md** — system design, data flow, what's plaintext vs ciphertext where
5. **04_DATA_MODEL.md** — database schema (Neon/Postgres), IndexedDB schema, encryption details
6. **05_TECH_STACK.md** — every tool/service used, why, free-tier limits, setup order
7. **06_PAGES_AND_FLOWS.md** — every page, popup, modal, and the user flows connecting them
8. **07_DESIGN_SYSTEM.md** — visual identity, tokens, component rules
9. **08_AI_PROMPTS_AND_LOGIC.md** — every Groq call: system prompts, inputs, outputs, guardrails
10. **09_SECURITY_AND_PRIVACY.md** — encryption scheme, legal disclaimers, threat model
11. **10_MVP_BUILD_PLAN.md** — what to build first, in what order, cut lines for hackathon time
12. **11_STITCH_PROMPT.md** — ready-to-paste prompt(s) for Stitch to generate mockups

## Project at a glance

> **v2 update (see each doc's revision note for full detail):** visual direction shifted to a bold red/white/black palette with GSAP/Lenis-driven landing page motion, aiming for Awwwards-caliber craft on the marketing surface while keeping the in-app product fast and disciplined. Post-login navigation is now a pill nav with three named sections — **Tracking**, **RedDot.ai**, **Know** — plus a Profile popup, replacing the original five-item tab bar. The AI assistant is now branded **RedDot.ai** and gains MVP-tier persistent chat history (encrypted client-side, same architecture as everything else — no new trust boundary). A new **Know** education-hub section was added. The privacy architecture, data model, encryption scheme, AI safety guardrails, and core feature scope are otherwise unchanged from v1.

- **Name:** **RedDot**. The AI chatbot/report-analysis feature is branded **RedDot.ai** within the product — see 01_PROJECT_BRIEF.md and 11_STITCH_PROMPT.md for the exact rule on when each form is used (short version: "RedDot" for the logo/wordmark/general product references, "RedDot.ai" only for the AI feature specifically).
- **One-liner:** A menstrual health tracker that's local-first and encrypted by default, with an AI layer (RedDot.ai, powered by Groq) that does things competitors structurally can't — like interpreting lab reports and finding real cross-signal patterns in your mood, sleep, and cycle data — wrapped in a bold, motion-rich frontend built to stand out visually.
- **Built for:** HACKHAZARDS '26
- **Stack:** Next.js → Vercel · Neon (Postgres, ciphertext only) · Groq API (Llama 3.3 70B) · IndexedDB (client storage) · Web Crypto API (encryption) · Lenis + GSAP/ScrollTrigger/SplitText/DrawSVG (landing page motion, free as of April 2025)
- **Core differentiators:** (1) local-first + encrypted architecture, not just a privacy policy promise, (2) RedDot.ai's report/lab analysis and persistent, privately-stored chat history, (3) real cross-signal correlation (mood × sleep × cycle phase), not horoscope-style generic insights, (4) a landing page built to genuinely compete on frontend craft, not just function.

## How to use these docs if you're an AI coding agent

- Treat **03_ARCHITECTURE.md** and **04_DATA_MODEL.md** as the source of truth for anything touching data — don't invent a different storage approach mid-build.
- Treat **07_DESIGN_SYSTEM.md** as the source of truth for anything visual — colors, type, spacing come from there, not from defaults.
- **10_MVP_BUILD_PLAN.md** tells you what order to build in and what to explicitly skip. If a feature in 02_FEATURE_SPEC.md isn't in the MVP build plan's "build now" list, don't build it yet — flag it instead.
- If something in these docs seems to conflict, **03_ARCHITECTURE.md and 09_SECURITY_AND_PRIVACY.md win** — the privacy architecture is the product's core promise and shouldn't be quietly weakened to save build time.
