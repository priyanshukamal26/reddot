# 01 — Project Brief

## What this is

A menstrual health web app that combines:
1. **Cycle, symptom, and mood tracking** — the table-stakes core every period app has.
2. **A local-first, encrypted-by-default privacy architecture** — not a policy promise, a structural one.
3. **An AI layer powered by Groq** that does things the existing market doesn't do well: plain-language lab/blood report interpretation, and real cross-signal correlation between mood, sleep, symptoms, and cycle phase.

## Why this, why now

Research into the existing market (Flo, Clue, Stardust, Natural Cycles, Apple Health, Glow) surfaced a consistent pattern:

- **Privacy fear is the #1 complaint category** across the category, ahead of bugs or pricing. Flo settled with the FTC in 2021 over sharing reproductive health data with Meta/Google/Flurry, and a related class action settled for $59.5M in 2025.
- Even the "safe" alternative, Clue, is GDPR-compliant but still **cloud-based** — compliant with EU law doesn't mean immune to a US subpoena. The only apps that are structurally safe (Euki, Drip, Floriva) are on-device-first by architecture.
- Feature-wise, **no major app does AI report interpretation or genuine cross-signal correlation.** Clue has no AI assistant at all. Most apps show charts, not insight.
- Apps with irregular cycles / PCOS consistently report bad predictions because most tools assume a clean 28-day cycle.

This project's bet: **privacy-by-architecture + genuinely useful AI** is a real, defensible gap, not just a feature checklist.

## Target user

Anyone who menstruates and wants to track their cycle, but specifically resonates with:
- Distrust of existing apps after the privacy reporting of the last few years
- Irregular cycles that existing apps predict badly (PCOS, perimenopause, post-partum, just naturally irregular)
- Wanting more than a calendar — wanting to actually understand their body's patterns
- Comfort with a little more setup (an account, an encryption passphrase note) in exchange for real privacy guarantees

## Hackathon context

- **Event:** HACKHAZARDS '26, a large, fully digital, community-run global hackathon (NAMESPACE), structured for quality over 48-hour-sprint speed — there's a longer build window than a typical hackathon, which means polish and a coherent demo narrative matter more than usual.
- **Implication for scope:** judges will see a lot of "AI wrapper" submissions. The privacy architecture is what makes this submission distinct — it should be demoed explicitly, not buried in a settings page. The demo narrative should be: *show the encrypted local storage working, then show the AI doing something competitors can't.*
- **Likely judging angles:** technical depth, real-world relevance/impact, design quality, use of sponsor tech (Groq is very likely a sponsor or partner tool — leaning into it visibly is good strategy).

## Naming (locked)

The product name is **RedDot**.

- **"RedDot"** is the name of the app itself — used for the logo, wordmark, landing page title, app store/repo name (if relevant), and every general reference to the product as a whole.
- **"RedDot.ai"** is used specifically and only for the AI chatbot/report-analysis feature within the app — the nav pill segment for it, the chat screen header, and any copy that's specifically describing that AI surface (e.g., "ask RedDot.ai," "RedDot.ai found a pattern in your last three cycles"). It is not a separate company or product, just the naming convention for that one feature area, the way a feature might be called "X Copilot" inside a larger product named "X."
- **Do not use "RedDot.ai" as the app's name anywhere else** — not in the logo, not in the landing page hero, not in general marketing copy. If a sentence is talking about the product broadly ("RedDot keeps your data on your device"), it's "RedDot." If a sentence is talking specifically about the AI feature ("ask RedDot.ai why you're tired this week"), it's "RedDot.ai."

This naming rule is referenced and applied consistently in 06_PAGES_AND_FLOWS.md (nav structure), 08_AI_PROMPTS_AND_LOGIC.md (the AI feature's branding), and 11_STITCH_PROMPT.md (explicit instruction to whatever tool generates the mockups). If any future doc update introduces new copy or screens, follow this same split rather than defaulting to ".ai" out of habit.

## What this is NOT

- Not a diagnostic tool. No feature should ever output a diagnosis, a definitive medical claim, or replace a doctor. This is a hard constraint, not a nice-to-have — see 09_SECURITY_AND_PRIVACY.md.
- Not a social/community app. No public profiles, no feed, no sharing-by-default. Any sharing (e.g., partner view) is explicit, opt-in, and revocable.
- Not ad-supported, not selling data, no third-party analytics SDKs. This is a stated product principle, not just a legal compliance note — it should be visible to users.
