# 06 — Pages, Popups & Flows (v2: Pill Nav + RedDot.ai + Know)

> **Revision note:** the page inventory and most flows are unchanged in substance from v1. What changed: (1) the post-login navigation model, now a pill-shaped nav with three named sections — **Tracking**, **RedDot.ai**, **Know** — plus a Profile button with a popup, replacing the old five-item tab bar; (2) the AI Assistant is now a named product within the product, **RedDot.ai**, with persistent chat history/resume; (3) the landing page section is rewritten around the GSAP/Lenis motion spec from 07_DESIGN_SYSTEM.md v2; (4) a new **Know** section (education/info hub) replaces the old standalone Insights-only framing — analytics/insights content now lives inside Tracking, and Know is purely educational content.

## Page inventory

### Public (pre-login)

| # | Page | Purpose |
|---|---|---|
| 1 | **Landing page** | The Awwwards-grade showpiece. Privacy + AI as the two pillars, delivered through scroll-driven motion. See detailed spec below. |
| 2 | **Privacy page** | Plain-language explanation of the data model (feature B7). Linked from landing page nav/footer and from the app's settings. |
| 3 | **Login** | Email + password. |
| 4 | **Sign up** | Email + password + the "your password is also your encryption key" explainer (short, can't be skipped). |
| 5 | **Forgot password** | Triggers reset flow; see Password Reset Flow below. |

### Onboarding (first-run, post-signup)

| # | Page/step | Purpose |
|---|---|---|
| 6 | **Onboarding: privacy model intro** | One screen, plain language, "your data stays on your device unless you choose otherwise." |
| 7 | **Onboarding: cycle basics** | Last period start date, typical cycle length, explicit "irregular / not sure" option. |
| 8 | **Onboarding: sync choice** | Local-only vs cloud sync, explained with the trade-off (not a dark-pattern default toward sync). |
| 9 | **Onboarding: complete / first insight** | Shows the first phase-ring prediction immediately — the "aha" moment before dropping into the dashboard. Protected by AuthGuard to gracefully redirect to login if session expires during setup. |

### Core app (post-login) — organized under the new pill nav

The post-login app is organized into three pill-nav destinations plus the profile popup. Each is detailed in its own subsection below.

| # | Page | Lives under | Purpose |
|---|---|---|---|
| 10 | **Dashboard / Home** | (default landing screen after login, sits "before" the three pills) | Hero section contains the Phase-ring alongside an AI-generated daily biological insight report. Below it: today's quick-log checklist, cycle heatmap, and summary stats. |
| 11 | **Daily log** | Tracking | Mood, symptoms, sleep/energy/appetite/exercise, journal. |
| 12 | **Cycle Tracker view** | Tracking | The creative calendar/contribution-graph-style cycle history — see "Tracking" detail below. |
| 13 | **Day detail** | Tracking | Read view of a specific day's full log (popup/slide-up panel). |
| 14 | **Cycle Insights & analytics** | Tracking | Trend charts, phase-correlated patterns (D4), cycle health score (F3, stretch) — analytics now live inside Tracking, not a separate nav item. |
| 15 | **RedDot.ai (chat)** | RedDot.ai | Conversational AI interface, E1, with persistent past-chat history and resume — see "RedDot.ai" detail below. |
| 16 | **Report upload & analysis** | RedDot.ai | Upload flow, disclaimer/consent step, results view. Lives inside RedDot.ai since it's the same underlying AI surface, accessed as a distinct mode/tab within that section. |
| 16a | **RedConnect** | RedConnect | A mini Reddit-like social platform where women can share queries, experiences, suggestions, and general posts under username tags. Global database search, likes, saves, and comments. |
| 17 | **Know — hub** | Know | Education/info home: phase explainers, articles, general menstrual health knowledge — see "Know" detail below. |
| 18 | **Know — article/topic detail** | Know | Individual article/explainer reading view. |
| 19 | **Settings — root** | Profile popup → Settings | Links out to the sub-settings pages below. |
| 20 | **Settings — privacy & data** | Profile popup → Settings | Sync toggle, export, import, panic wipe (V1.1), last-backup detail. |
| 21 | **Settings — account** | Profile popup → Settings | Email, password change (routes into Password Reset Flow if relevant), delete account. |
| 22 | **Settings — notifications** | Profile popup → Settings | Reminder toggles (F2), all off by default. |
| 23 | **Settings — partner sharing** | Profile popup → Settings | (Stretch, B8) manage share links. |

### Popups / modals (not full pages, but must be designed)

| # | Modal | Triggered from |
|---|---|---|
| 24 | **Profile popup** | Tapping the Profile button in the pill nav — see "Profile popup" detail below. This is a new modal in v2. |
| 25 | **Password-reset data-loss warning** | Forgot-password flow, if local unsynced data exists. |
| 26 | **Export success / backup file saved** | After export completes. |
| 27 | **Import confirmation** ("this will merge/replace your data") | Before import completes. |
| 28 | **Panic wipe confirm** (type-to-confirm style, not a single accidental tap) | Settings → privacy & data. |
| 29 | **Report-upload consent/disclaimer** | Before the upload control becomes interactive in RedDot.ai's report mode. |
| 30 | **"File discarded" confirmation** | After report analysis completes — shows the literal discard timestamp. |
| 31 | **AI disclaimer (first use)** | First time opening RedDot.ai — one-time, dismissible, reappears in settings/help if needed. |

---

## The pill nav — structure & behavior

This is the primary post-login navigation device and should be designed as a real piece of UI craft, not just a styled `<nav>` — it's one of the first things a logged-in user sees on every screen.

**Composition (left to right):**
1. **Logo/wordmark** — the product name, small, left-aligned, outside the pill itself (the pill contains only the navigation destinations).
2. **The pill** — a single rounded (fully pill-shaped, this is the one place in the redesign where a full-round radius is correct, since it's explicitly requested and reads as a deliberate, modern nav pattern rather than "soft wellness app") container holding three tappable segments:
   - **Tracking**
   - **RedDot.ai**
   - **Know**
3. **Profile button** — circular, right-aligned, outside the pill (mirrors the logo on the opposite end) — shows the user's initial/avatar, opens the Profile popup on tap.

**Active state:** the active segment within the pill should fill with `signal` (the brand red) with `paper`/white text — this is one of the "spend the red" moments called out in 07_DESIGN_SYSTEM.md; it's a small element but used on every screen, so it's a strong recurring brand touch. Inactive segments sit on `ash`/`void` with muted text.

**Motion:** the active-state fill should slide/morph between segments when switching (a single animated element moving to the active position, not three independent fade transitions) — this is a well-known, satisfying pill-nav pattern and a good candidate for a small GSAP-powered flourish even on in-app screens, since it's fast and functional rather than decorative-only.

**Responsive behavior:** on mobile widths, the pill can either stay fixed at the top or move to a bottom position (bottom is generally more thumb-reachable for a daily-use app) — decide at build time, but keep the three-segment-plus-profile structure intact rather than collapsing into a hamburger menu; this nav is meant to be a visible, branded element, not hidden behind an icon.

## Profile popup (#24) — detail

Triggered by tapping the Profile button. Renders as a small anchored dropdown/popover (not a full-screen modal) directly below/near the profile button, consistent with familiar account-menu patterns. Contents, top to bottom:

1. **Identity header:** avatar/initial, name or email.
2. **If logged out:** Login and Sign up actions are shown here instead of the identity header — the same popup anchor point serves both logged-in and logged-out states, so the profile button is always the place to go for account actions regardless of auth state.
3. **If logged in:**
   - Link to Settings (root).
   - Quick toggle or link for sync status ("Cloud sync: On/Off") — a shortcut to the most-checked settings item, so users don't need to drill into full Settings for this alone.
   - Last-backup timestamp (mirrors the dashboard indicator, useful to have here too since this is a natural "account status" checkpoint).
   - Log out action, visually separated (e.g., below a divider) from the other items so it's not accidentally tapped.

## "Tracking" section — detail

This is the renamed/expanded home of cycle tracking + analytics (previously split across Dashboard/Calendar/Insights in v1's flat tab bar). Internally it can have its own sub-navigation (tabs or a segmented control) between:

- **Today** — the daily log entry point (#11).
- **Cycle view** — the creative calendar/history visualization (#12).
- **Insights** — trend charts and pattern analysis (#14), folded in here rather than being a top-level nav item.

**On the creative cycle-view specifically** (#12) — the brief asked for something more interesting than a plain calendar grid, in the spirit of a GitHub-contributions-style view but for cycle data. Worth designing as an actual alternative to a calendar, not just a calendar with a new paint job:

- **A contribution-graph-style heatmap**, where each cell is a day, color-intensity (using the monochrome red ramp from 07_DESIGN_SYSTEM.md) indicates flow intensity or symptom load, and the layout spans months in rows — gives an at-a-glance "shape" of a person's cycles over time the way a GitHub graph gives an at-a-glance shape of someone's coding activity.
- **A radial/spiral year view** as a more ambitious alternative — months wrap around a spiral or concentric rings, cycles visibly repeat as you move outward, phase color-position visible at a glance. More visually striking, harder to build — good stretch-tier ambition if time allows, with the heatmap as the safe MVP fallback.
- Either way, tapping any unit (day cell, or a point on the spiral) opens Day detail (#13) the same way a calendar date would.
- Standard month-grid calendar can still exist as a secondary/fallback view toggle for users who just want the familiar layout — but it shouldn't be the only or default option, per the brief's ask for something more creative.

## "RedDot.ai" section — detail

This is the AI layer, branded as its own named product surface. Internally organized as:

- **Chat** (#15) — the primary conversational interface. Context is drawn from the user's local/synced data. Responses are highly structured (using markdown categories, cards, and bold bullet points) rather than dense walls of prose.
- **Past chats** — a list/sidebar of previous conversations, each resumable. Includes chat deletion support to clear unwanted history, and automatic short title/heading generation (2-4 words summarizing the conversation) based on the first user query.
- **Report analysis** (#16) — the upload/disclaimer/processing/result flow, presented as a distinct mode/tab within RedDot.ai.

**Important architectural implication — read before building:** v1's AI logic doc (08_AI_PROMPTS_AND_LOGIC.md) explicitly avoided server-side chat persistence to keep plaintext health data off the server beyond a single request/response cycle. Adding "past chats with resume" means conversation history now needs to persist somewhere. To stay consistent with the project's core privacy promise, **chat history must be stored the same way every other piece of health data is stored: encrypted client-side, in IndexedDB, with the same optional ciphertext-only sync to Neon as everything else** — not as a new, separately-secured server-side store. This is detailed concretely in 04_DATA_MODEL.md and 08_AI_PROMPTS_AND_LOGIC.md's updated sections. Don't let "add chat history" quietly become "add a server-side database of health conversations" — that would directly contradict the architecture in 03_ARCHITECTURE.md.

## "RedConnect" section — detail

This is the social community layer, accessed as a primary destination. It allows users to browse and publish posts, nested comments, and save/bookmark discussions. Key features:
- **Global Search**: A search bar at the top allows dynamic filtering of posts and usernames in real-time from the backend database across all scopes, showing a custom loading spinner while fetching and friendly empty states.
- **Tabbed Browsing**: Easily toggle between Global (all posts), Saved (bookmarked posts), and Own (user's posts) feeds.

## "Know" section — detail

A genuinely new section vs. v1 — a static-content education hub, separate from the personalized/dynamic Tracking and RedDot.ai sections. Confirmed scope: phase explainers, general menstrual health articles/knowledge — not personalized to the user's own data (that's what RedDot.ai and Tracking's Insights are for).

- **Know — hub (#17):** a browsable/searchable index. Suggested organization: by cycle phase (Menstrual/Follicular/Ovulation/Luteal — using the same monochrome ramp visually, tying back to the design system even in a content section), and by topic (symptoms, nutrition, exercise, common conditions like PCOS, myth-busting, etc.).
- **Know — article detail (#18):** a clean reading view — this is the one place in the app where a more editorial, content-forward layout (closer to v1's original "warm instrument" feel, even within the v2 red/white/black palette) makes sense, since the job here is sustained reading, not quick interaction.
- **Content sourcing note:** for MVP, this can be a curated set of hand-written/short-form explainer content (doesn't need to be AI-generated or dynamically sourced) — see 10_MVP_BUILD_PLAN.md for how much of this to build before the hackathon deadline. Keep it factual and sourced; this is exactly the kind of content where overclaiming medical authority would be a problem, so the same non-diagnostic, "consult a doctor for anything specific to you" framing from 09_SECURITY_AND_PRIVACY.md applies here too, not just to the AI features.

---

## Landing page — detailed layout & motion spec (v2)

This replaces v1's static section list. The content goals (privacy pitch, four-phases walkthrough, AI pitch, comparison framing, final CTA) are unchanged — what's new is that this page is now built as a scroll-choreographed sequence per 07_DESIGN_SYSTEM.md's motion spec, using Lenis + GSAP ScrollTrigger + SplitText + DrawSVG.

**Section 1 — Hero (load sequence)**
- Full-bleed `void` background. Phase-ring rendered large, asymmetrically placed, drawn in via DrawSVG as part of the page-load timeline.
- Headline using SplitText to reveal word-by-word/line-by-line, large condensed-display type per the new type direction, timed to complete alongside the ring's draw-in.
- Headline content: must still say both things v1 required — a confident privacy claim and a confident intelligence claim in the same breath — now delivered as a short, punchy, poster-style line rather than a softer editorial line, per the v2 voice direction.
- Primary CTA ("Get started") rendered in `signal` red — the first "spend the red" moment on the page.
- Secondary CTA ("See how your data is protected") — lower-contrast, text-link style, not competing with the primary CTA's red.

**Section 2 — Privacy pitch (pinned scroll transition from hero)**
- ScrollTrigger-pinned moment: the hero's phase-ring shrinks/relocates as this section's content scrubs in, so the transition feels connected rather than a hard cut.
- Same concrete claims as v1 ("your data lives on your device by default," "no ads, no third-party trackers, nothing sold") — copy substance unchanged, presented now against bold `void`/`paper` blocking rather than soft cards.
- A simplified trust-boundary visual (not the full architecture table) — consider rendering this as a simple animated diagram (data flowing from device, stopping at an encrypted boundary before reaching a server icon) that draws in via ScrollTrigger-scrubbed SVG strokes.

**Section 3 — The four phases (scroll-snap or pinned panel)**
- Each phase revealed in sequence as the user scrolls, background shifting through the monochrome ramp (red → light → white-with-red-outline → dark) — this section is now also a direct demonstration of the new phase-color system, not just an explainer.
- This is the section most likely to use horizontal scroll-snap (per current scrollytelling practice favoring chapter-based scroll-snap sections) — four "chapters," one per phase.

**Section 4 — The AI pitch**
- Scroll-triggered reveal of mocked RedDot.ai chat snippet and report-analysis snippet, with SplitText animating the AI's response text in character-by-character as if being generated live.
- Copy constraint unchanged from v1: never imply diagnosis; "understand," "in plain language," "questions to bring to your doctor."
- This section should visibly use the RedDot.ai name/branding, matching what the user will actually see post-login — consistency between the marketing promise and the product reality matters for credibility.

**Section 5 — Why this, vs. existing apps**
- Calmer section by design (per the "tension/release" rhythm note in 07_DESIGN_SYSTEM.md) — simpler fade/slide reveals, no pinning. Copy substance unchanged from v1.

**Section 6 — Final CTA + footer**
- Clean, no further animation tricks — let the page land after five sections of motion.
- Footer: Privacy page link, HACKHAZARDS '26 credit line, contact/repo link if relevant.

---

## Daily Log Flow

Unchanged from v1 — still a single scrollable screen, not a wizard:
1. Top: date (defaults to today, can navigate to past days to log retroactively).
2. Period flag toggle + flow intensity (only shown if toggled on).
3. Symptom chips (multi-select, tap to toggle).
4. Mood slider/emoji row.
5. Sleep / energy / appetite / exercise — compact row of small scales, all optional, clearly skippable.
6. Journal text field (collapsed/expandable, not demanding attention by default).
7. Save (auto-saves on change is preferable if build time allows).

## Report Analysis Flow

Unchanged in substance from v1, now presented as a mode within RedDot.ai rather than a standalone top-level page:
1. **Entry state:** explanation + mandatory disclaimer/consent modal (#29) before the upload control is interactive.
2. **Upload state:** file picker / drag-drop area.
3. **Processing state:** the phase-ring reused as a "thinking" animation + honest status line.
4. **Result state:** plain-language summary, flagged values using the neutral highlight treatment (never red/green pass-fail — see 07_DESIGN_SYSTEM.md v2), suggested questions for a doctor, discard confirmation (#30) with timestamp.
5. **Error state:** clear, non-technical message, no silent failure.

## Password Reset Flow

Unchanged from v1:
1. User requests reset from Login page.
2. If unsynced local data exists → show modal #25 with an "export first" shortcut.
3. User exports first or proceeds anyway — informed choice either way.
4. Standard reset-via-email-link flow continues.

## Navigation model (superseded sections from v1)

- **Primary nav is now the pill nav** described above — Tracking / RedDot.ai / Know, plus the Profile popup. This replaces v1's five-item Dashboard/Calendar/Insights/AI Assistant/Settings tab bar entirely. Settings is now reached via Profile → Settings, not its own top-level pill.
- Day detail (#13) remains a slide-up panel/modal, not a full page nav — unchanged rationale from v1.
- Settings sub-pages (#20–23) remain real subpages with their own URL/back-navigation, reached through the Profile popup rather than a top-level nav item.
- All modals (#24–31) remain true overlays that preserve the user's place in the underlying page.

## Cross-connections

- Visual treatment of every page/state above → 07_DESIGN_SYSTEM.md (v2)
- Exact data shown in RedDot.ai's chat and report analysis screens, plus the chat-history storage approach → 08_AI_PROMPTS_AND_LOGIC.md and 04_DATA_MODEL.md
- What's actually buildable in MVP vs deferred (including how much of Know's content to write before the deadline, and which cycle-view style — heatmap vs spiral — to build first) → 10_MVP_BUILD_PLAN.md
