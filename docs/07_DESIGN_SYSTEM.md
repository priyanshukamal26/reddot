# 07 — Design System (v2: Red / White / Black, Awwwards-Grade)

> **Revision note:** this replaces the original "calm aubergine instrument" direction. The product strategy (privacy architecture + AI intelligence as the two pillars) is unchanged — see 01–03, 08, 09 — only the visual expression changes here. This version is bolder, higher-contrast, and built explicitly to be a frontend showpiece, not just a usable health app.

## Design thesis

The brief shifted from "calm trusted instrument" to **a statement piece** — something that could plausibly land on Awwwards' front page, get screenshotted by other developers, and still function as a real daily-use health app underneath. That's a harder brief than either alone: pure "Awwwards showpiece" energy often means the kind of overwrought, illegible, slow-loading site that wins votes and loses users; pure "usable health app" energy is what every competitor already does, including the ones we're differentiating against.

The resolution: **the showpiece energy lives almost entirely on the marketing/landing surface** (motion, scale, typographic drama, scroll choreography), while **the in-app product surface stays disciplined, fast, and legible** — bold in palette, restrained in behavior. A judge or visitor experiences the landing page as a piece of craft; a daily user experiences the dashboard as a tool that gets out of their way. Both run on the same token system so they read as one product, not two.

The subject matter — blood, cycles, intensity, intimacy — actually supports a red/white/black palette better than the original soft-aubergine direction did. Red is the most honest color available for this subject: it's the color the entire category is too afraid to use directly (everyone reaches for pink or lavender as a euphemism). Using true, saturated red without apology is itself the design statement, and it's also what makes this avoid the three generic AI-design defaults: it isn't a cream/serif/terracotta palette, it isn't a near-black-plus-one-neon-accent palette (it's near-black plus a single, *unambiguous, thematically-justified* red, used at real volume rather than as a token accent), and it isn't broadsheet-hairline minimalism (it uses bold blocks of flat color and high-contrast type rather than rules and columns).

## Color tokens

| Token | Hex | Role |
|---|---|---|
| `void` | `#0A0A0A` | Primary dark background — true near-black, not warm-tinted. This is harder and colder than the old `ink` token on purpose. |
| `paper` | `#FAFAFA` | Primary light surface / off-white. Slightly warm-neutral white, not stark `#FFFFFF`, to avoid looking like default browser white. |
| `signal` | `#E0102A` | The one brand red. Used for primary CTAs, the menstrual phase (peak of the ramp), key highlights, hover states, the logo mark. This is the loudest color in the system and should be spent deliberately — see "Spend the red" below. |
| `signal-deep` | `#8C0A1C` | A darker red, used for pressed/active states of red elements, and as a secondary dark surface tint (e.g., a card on `void` that needs to feel "in the red zone" without using full `signal`). |
| `ash` | `#1C1C1C` | Secondary dark surface — cards/panels on `void` backgrounds. |
| `fog` | `#E3DEDD` | Secondary light surface — cards/panels on `paper` backgrounds. Slight red-grey undertone, not a neutral grey, to keep warmth tied to the red rather than going cold/corporate. |
| `error` | `#FF3B3B` | True error states only. Brighter/more orange-leaning than `signal` specifically so it's never confused with brand red or the menstrual-phase color in the report-analysis flagged-values UI. |

**Spend the red.** `signal` should appear with intention, not everywhere. A useful mental model: if `signal` is on screen, it should be on the single most important thing in that view — the primary CTA, the active nav pill, the current phase marker, the one stat that matters. Everything else stays `void`/`paper`/`ash`/`fog`/grayscale. A screen that's 40% red reads as a discount sale banner; a screen that's 90% black-and-white with one precise red moment reads as considered. This discipline is what keeps "bold palette" from becoming "loud, cheap palette."

## The phase system: monochrome ramp, not four hues

This is the one structural change with real downstream implications (calendar, phase-ring, insights all depend on this). Cycle phases are no longer four distinct hues — they're **four positions on a single red-to-black-to-white-to-red value ramp**, reinforcing the red/white/black constraint rather than breaking it for the sake of phase-coding.

| Phase | Token | Value | Position on the ramp |
|---|---|---|---|
| Menstrual | `phase-signal` | `#E0102A` (= `signal`) | Peak saturation — the loudest point in the cycle, and the only phase that uses full brand red |
| Follicular | `phase-rise` | `#D9C9C7` | Light, warm-grey-pink — energy rising, color lifting away from red toward white |
| Ovulation | `phase-peak` | `#FAFAFA` (= `paper`) with a 1.5px `signal` outline/ring treatment | Brightest point of the cycle — rendered as the lightest value, marked with a thin red ring rather than a fill, so it's still legible as "peak" rather than just "blank" |
| Luteal | `phase-fade` | `#4A3536` | Darkening, warm-charcoal — descending back toward black before the cycle returns to `phase-signal` |

This reads as a genuine gradient sweep — red → fades light → peaks white-with-red-edge → darkens → back to red — which is more conceptually honest to what a cycle actually is (a continuous process, not four discrete categories) than four arbitrary hues ever were. It's also a stronger Awwwards-style detail: the phase-ring becomes a real gradient arc, not four flat pie-slices.

**Accessibility requirement, given the monochrome approach:** because phases are now distinguished by value/lightness rather than hue, every phase indicator (ring segment, calendar dot, badge) must also carry a text label or icon — never rely on a user distinguishing `phase-rise` from `phase-fade` by shade alone at a glance. This is a stricter requirement than the old four-hue system, not a relaxed one — build it in from the start.

**Flagged lab values (report analysis):** continue using a neutral, non-alarming treatment — a soft `fog`/`ash` highlight with a `signal`-colored left border or icon, paired with text. Never use `error` or pass/fail red-green coding here; that still risks reading as a diagnosis.

## Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headlines | **A high-contrast, slightly aggressive display serif or grotesk** — direction: something like **Saans, Söhne Breit, or a condensed grotesk like Right Grotesk / Founders Grotesk Condensed** for landing-page scale headlines. The old Fraunces/Newsreader serif direction is dropped — it read as "warm editorial," and this brief wants "precise and a little confrontational." Pick one condensed/display grotesk and commit; it should look enormous and unapologetic at hero scale (think 120–200px+ on desktop hero text). |
| Body / UI | **Inter** (kept from v1 — still the right choice: neutral, legible, doesn't compete with the display face) | All interface text, forms, in-app body copy. |
| Data / mono | **JetBrains Mono** (kept from v1) | Dates, cycle-day counters, timestamps, "last backup" indicator, "file discarded at [time]" — still the right device for precision moments, and its mechanical character pairs even better with the new harder-edged palette than it did with the old warm one. |

Type scale for the landing page should be dramatic, not incremental — hero headline sizes should feel closer to a poster than a typical SaaS hero (large jumps between display/h1/body, not a smooth modular scale). In-app screens (dashboard, log, settings) should use a calmer, more standard scale — the drama is a landing-page device, not a daily-use-screen device.

## Layout principles

- **Full-bleed, high-contrast blocks** on the landing page — large flat fields of `void` or `signal` with type breaking across them, rather than centered cards in whitespace. This is the visual register shift from v1's "generous whitespace" approach.
- **In-app screens stay closer to v1's discipline**: clear hierarchy, breathing room, no clutter — the showpiece energy is a landing-page device, the product itself should still feel fast and uncluttered to actually use daily.
- **Sharp or barely-rounded corners** (0–6px radius) — a deliberate reversal from v1's soft 12–16px radius. Sharp edges read as precise/confident; soft edges read as gentle/wellness-app, which is exactly the register this version is moving away from.
- **Grid-breaking moments are allowed and encouraged on the landing page** — type that overlaps a section boundary, an image or the phase-ring breaking out of its container — but should still resolve to a clean, aligned grid in-app.

## The signature device: the Phase-Ring (updated)

Same structural role as v1 — reused across hero, dashboard, loading states, onboarding — but now rendered as a **continuous gradient arc** (per the monochrome ramp above) rather than four flat-colored segments, with a sharp, thin marker (not a soft dot) indicating current position. On the landing page hero specifically, this should be rendered large and could be done in actual canvas/WebGL or SVG with a GSAP-driven stroke-offset animation so it visibly "draws" or rotates as part of the page-load sequence — a good candidate for the single most memorable animated moment on the page (the "signature element" called for in frontend design practice).

## Motion & landing page animation spec

This section is new in v2 — the original spec didn't need this level of motion detail since the brief wasn't aiming for Awwwards. Current (2026) Awwwards-tier technique baseline, confirmed via research: Lenis is the dominant smooth-scroll library, the CSS view-timeline API now handles simple scroll animations without JS in stable browsers, GSAP ScrollTrigger 4.0 has improved mobile support and auto-pinning, and scroll-snap is gaining adoption for chapter-based narratives — and critically, mobile-first scrollytelling is now expected; desktop-only scroll experiences are considered out of date. Also worth knowing: GSAP was acquired by Webflow and made fully free in April 2025, including previously-paid plugins like SplitText, MorphSVG, and DrawSVG — so there's no cost barrier to using the premium plugin set.

**Stack to use:**
- **Lenis** for smooth-scroll (the de facto standard layer underneath everything else).
- **GSAP + ScrollTrigger** for scroll-driven choreography (pinning, scrubbing, staggers).
- **GSAP SplitText** for the headline character/word/line-reveal animations.
- **GSAP DrawSVG** for the phase-ring's "drawing in" stroke animation.
- All free, per the above — no budget conflict with the project's free-stack constraint.

**Landing page animation sequence (section by section):**

1. **Load sequence:** brief, confident, not gimmicky — SplitText reveals the hero headline word-by-word or line-by-line as the phase-ring draws itself in via DrawSVG, choreographed on one GSAP timeline so they complete together. Target under ~1.5s — this is a "confident entrance," not a skippable intro animation that annoys repeat visitors.
2. **Hero → privacy section transition:** ScrollTrigger-pinned moment where the phase-ring shrinks/moves from hero-center to a smaller persistent position (or dissolves) as the privacy-pitch content scrubs in — a connecting motion rather than a hard cut between sections.
3. **Phase walkthrough section:** horizontal scroll-snap or a pinned panel where the four phases reveal in sequence as the user scrolls, each one shifting the background through the monochrome ramp (red → light → white/red-outline → dark) — this directly visualizes the design system's core idea and doubles as a genuinely informative product-education moment.
4. **AI pitch section:** scroll-triggered reveal of the mocked assistant/report-analysis snippets, type characters animating in (SplitText) as if being "generated" live — a tasteful nod to AI generation without becoming a gimmick.
5. **Comparison/honesty section:** simpler — fade/slide reveals, intentionally calmer than the sections around it, so the page has rhythm (tension/release) rather than maximum intensity throughout. Constant intensity reads as exhausting, not impressive.
6. **Footer/final CTA:** a clean, confident closing — no further animation tricks needed here; let the page land.

**In-app motion (dashboard, log, settings, etc.):** stays close to v1's restraint — quick, functional micro-interactions (chip toggles, slider drags), no scroll-driven choreography. ScrollTrigger/Lenis/SplitText are landing-page tools; the daily-use app should feel snappy, not cinematic.

**Always:** respect `prefers-reduced-motion` — provide a reduced version of the landing page sequence (cross-fades instead of pins/scrubs) rather than disabling motion entirely, so the page still feels intentional for users who need reduced motion.

## Voice & copy principles

Mostly unchanged from v1, with one shift: copy on the landing page can be more declarative and confident in tone (short, punchy, poster-like lines for headlines) while in-app copy stays exactly as warm/plain/non-diagnostic as specified before.

- **Active voice, plain verbs** in-app — unchanged from v1.
- **Landing page headlines can be short, declarative, and bold** — this is where the "statement piece" energy is allowed into the copy itself, not just the visuals. E.g., a hero line built around a stark contrast ("private" vs "powerful," "yours" vs "theirs") fits this register well.
- **Never diagnostic language anywhere in the product** — unchanged, still absolute.
- **Privacy copy stays concrete, not reassuring fluff** — unchanged.

## Dark mode / light mode

`void` (near-black) remains the primary/hero/marketing surface — even more justified now, since red reads more dramatically against true black than it did against the old warm aubergine. `paper` (off-white) is the light-mode/in-app alternative. Both modes share the same red and the same monochrome phase ramp; only the base surface and `ash`/`fog` card tones flip.

## Accessibility floor (non-negotiable, regardless of aesthetic direction)

- Visible keyboard focus states on every interactive element — including landing-page interactive moments, not just the in-app product.
- Color is never the sole carrier of meaning — **stricter now** given the monochrome phase ramp (see note above); always pair with text/icon.
- Responsive and mobile-first for the landing page specifically — per current best practice, mobile-first scrollytelling is expected, not desktop-only — the scroll sequence above must have a working, non-broken mobile version, not just a graceful degradation.
- Contrast ratios meet WCAG AA at minimum. Check `signal` (`#E0102A`) on `void` (`#0A0A0A`) and on `paper` (`#FAFAFA`) explicitly — saturated red on near-black can under-contrast for small text; reserve small red text for short labels/numerals and use white/off-white for any longer red-adjacent copy.
- Performance is an accessibility/UX issue too: per current guidance, heavy scroll animation should animate `transform`/`opacity` (GPU-cheap) rather than layout properties, and any GSAP/Lenis setup should be conditionally loaded only on pages that use it rather than globally, to protect load performance on the in-app product pages that don't need it.
