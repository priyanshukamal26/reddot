# RedDot — "The Signal" Design & Motion System
### Landing page redesign specification — v2

This file is the single source of truth for the RedDot landing-page rebuild. Hand it to your build agent together with the generated media listed in §15. Every value below is a decision, not a suggestion — if something has to change for technical reasons, say what changed and why.

**Grounding:** RedDot is a local-first menstrual/cycle tracker. Its entire pitch is one sentence: *your data never leaves your device unencrypted.* Every design decision below either (a) makes that promise legible, or (b) makes the cycle itself legible. Nothing is decoration for its own sake.

---

## 1. Creative Direction

### 1.1 Palette — sampled, not guessed
Colors were extracted directly from the current live build via pixel-frequency analysis (not eyeballed), so the new system is a continuation of the existing brand, not a repaint:

| Token | Hex | Source | Use |
|---|---|---|---|
| `--void-950` | `#0A0A0A` | sampled (dominant bg cluster) | primary dark section background |
| `--void-900` | `#141414` | sampled | elevated dark surface (cards) |
| `--void-800` | `#1E1E1E` | interpolated | hover / active dark surface |
| `--void-border` | `#2A2A2A` | sampled | borders/dividers on dark |
| `--paper-50` | `#F8F8F8` | sampled | primary light background / text-on-dark |
| `--paper-100` | `#EFEFEF` | interpolated | subtle card fill on light sections |
| `--signal-600` | `#C10E22` | interpolated (pressed state) | button active/pressed |
| **`--signal-500`** | **`#E01028`** | **sampled — exact brand red** | **primary brand red, all CTAs, active states** |
| `--signal-400` | `#F4867E` | sampled | mid-gradient stop, secondary accent |
| `--signal-100` | `#FCD4D0` | sampled | palest gradient bloom, blush highlights |
| `--ink-700` | `#7C7878` | sampled | muted body text on dark |
| `--ink-500` | `#ACA8A8` | sampled | labels / secondary text on dark |
| `--ink-300` | `#D8D4D4` | sampled | faint dividers on dark |
| `--paper-ink-900` | `#111111` | matches existing | headings on light sections |
| `--paper-ink-600` | `#4A4646` | interpolated | body text on light sections |

Notes on what the sampling found: the brand red is warmer and slightly pink-shifted (`#E01028`, not a pure `255,0,0` red), and every neutral in the current build has a faint warm cast rather than true cold gray. Keep that warmth — it's what stops the palette from reading as generic "dark-mode SaaS." **No purple, no blue, no green anywhere.**

### 1.2 Type — three roles, not one font doing everything
- **Display — [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)** (variable, weights 400–800). Used for every headline, the mega-watermark, and the logotype. It's a free Google Font with an irregular, slightly humanist grotesk character — distinct from the Inter/Helvetica-adjacent look almost every other product site uses, but still legible at large sizes and technical enough not to feel decorative.
- **Body — Inter** (300–500). Kept from the current build. At paragraph sizes a distinctive face becomes a liability; Inter's job is to disappear.
- **Mono — JetBrains Mono** (400–500). Kept from the current build. Every eyebrow, label, stat, nav item, and data readout. This is the "instrument panel" layer — it's what makes the site feel like a piece of security tooling instead of a wellness app.

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer utilities {
  .text-mega {
    font-family: var(--font-display);
    font-size: 24vw;
    line-height: 0.72;
    letter-spacing: -0.04em;
  }
}
```

### 1.3 Layout & rhythm — Void / Paper alternation
The current build is black-on-black for its entire length, so nothing pops and every section blurs into the next. The fix borrowed from the reference pattern: **alternate dark ("Void") and light ("Paper") sections**, bookended in Void so the brand still reads as dark-first.

```
┌─────────────────────────┐
│  01  HERO          VOID │  ← full-bleed, brand-defining, dark
├─────────────────────────┤
│  02  TRUST         PAPER│  ← the technical proof, clean & clinical
├─────────────────────────┤
│  03  SPECTRUM      VOID │  ← the intimate data, immersive & dark
├─────────────────────────┤
│  04  INTELLIGENCE  PAPER│  ← product demo, staged like a device shot
├─────────────────────────┤
│  05  FINAL CTA      VOID│  ← close where you opened
└─────────────────────────┘
```
Void = privacy, depth, the vault. Paper = clarity, proof, the audit. Red is the only thread allowed to cross both without changing meaning — it always means *signal, brand, alive*.

### 1.4 Signature — "The Core"
One idea gets all the boldness; everything else stays disciplined. The signature is **a single orb** — half data-node, half eclipsed moon, literally a rendering of the word "RedDot" — that recurs at three scales:
1. **Cursor scale (8px):** a live red dot that never stops moving, the smallest possible instance of the brand mark.
2. **Instrument scale (existing UI):** the radial phase-progress ring already in the current build, promoted from a one-off widget to a recurring instrument (hero, nav, loading state).
3. **Image scale:** five generated renders of the *same object* in different lighting states — one hero "Core" and four phase variants (§9, §15).
Because it's the same object at every scale, decisions that would otherwise look like separate gimmicks (custom cursor, phase carousel, hero art) read as one coherent idea. This is the one aesthetic risk this spec takes deliberately — everything else is intentionally quiet around it.

### 1.5 Why this isn't the generic "dark + one accent" default
Dark background with a single bright accent is one of the most common templated AI-design outputs, so it's worth stating plainly why this isn't that: the red is the brand's own sampled hex, not a placeholder; the numbering (§1.6) is wired to real scroll position instead of being decorative; the display face is a deliberate pairing, not Inter-for-everything; and the signature motif is derived from the product's literal name rather than bolted on. Where this spec repeats the reference pattern's structure (chaptered sections, numbered eyebrows, a two-column pinned carousel), it does so because RedDot's content is genuinely sequential (a cycle has phases in a fixed order) — not because numbering looks nice.

### 1.6 Numbering is functional, not decorative
Every `01–05` eyebrow in this spec is wired to a fixed vertical **scroll rail** (§5.3) that doubles as navigation. If you strip that rail out, strip the numbers too — they only earn their place because they're clickable, active-state wayfinding.

---

## 2. Tech Stack

```json
{
  "dependencies": {
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "vite": "^6.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "@tailwindcss/vite": "^4.1.14",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2"
  }
}
```

**Why GSAP over Framer Motion for this rebuild:** as of the GSAP 3.13 release (2025), the entire plugin suite — `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `MorphSVG`, `DrawSVG` — is 100% free for commercial use (Webflow's acquisition of GreenSock removed the old Club GreenSock paywall). That means this spec can use `ScrollSmoother` for buttery inertia scrolling natively in the same library that drives every scroll animation, instead of pairing a separate smooth-scroll library (e.g. Lenis) with GSAP and hand-syncing their tickers. One dependency family, one ticker, fewer sync bugs for a build agent to trip over. *(If `ScrollSmoother`'s wrapper markup requirement — `#smooth-wrapper` / `#smooth-content` — conflicts with how routing or other libraries are set up, `lenis` + a manual `ScrollTrigger.scrollerProxy` sync is the documented fallback.)*

```tsx
// registration, once, at app entry
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
```

---

## 3. Global Tokens

- **Spacing:** 8px base unit, unchanged from current build.
- **Radius:** `6px` buttons/inputs, `12px` cards, `9999px` pills/circles.
- **Signature ease:** the current build's `cubic-bezier(0.16, 1, 0.3, 1)` is kept as the house curve. Register it once so every GSAP tween can reference it by name:
  ```tsx
  import { CustomEase } from "gsap/CustomEase";
  gsap.registerPlugin(CustomEase);
  CustomEase.create("signal", "M0,0 C0.16,1 0.3,1 1,1");
  // usage: gsap.to(el, { y: 0, duration: 1.2, ease: "signal" })
  ```
  Closest built-in fallback if `CustomEase` is unavailable: `power4.out`.
- **Hard shadow (signature button treatment):** kept and extended from the current build. On Paper sections, offset shadow is black; on Void sections / red buttons, the offset shadow is red. `4px 4px 0px rgba(224,16,40,0.35)` on Void, `4px 4px 0px rgba(17,17,17,0.5)` on Paper.
- **Breakpoints:** Tailwind defaults — `sm 640 / md 768 / lg 1024 / xl 1280`.

---

## 4. Global Systems (apply site-wide)

### 4.1 Custom cursor — "the smallest Core"
- Desktop pointer devices only (`@media (pointer: fine)`); native cursor hidden via `cursor: none`. Falls back to the native cursor entirely on touch/coarse pointers — do not attempt to fake it on mobile.
- Two-part comet: an 8px solid `--signal-500` dot with tight lag (GSAP `quickTo`, ~0.15s, `power3`), and a 36px, 1px-stroke ring trailing looser (~0.35s lag) behind it.
- Ring color adapts to section: `--signal-500` at 40% opacity on Void, `--paper-ink-900` at 30% opacity on Paper. **The inner dot is always red** — it's the one constant, the brand anchor.
- On hover over any interactive element: ring scales to 60px and fills to 10% tint; on the phase-carousel image specifically, a small mono-font tag (`VIEW`) appears beside it.
- Keyboard-only users never see the custom cursor logic engage; standard visible focus rings (`outline: 2px solid var(--signal-500); outline-offset: 3px`) must remain on every focusable element regardless of cursor styling.

### 4.2 Ambient grain
- Fixed, full-viewport, `pointer-events-none`, sits above content and below the cursor layer.
- A small tiled SVG `feTurbulence` noise pattern, opacity 3–4%, `mix-blend-mode: overlay`, background-position nudged on a ~120ms interval for a subtle film-grain flicker (classic technique — do not overdo the opacity, this should be nearly subliminal).
- Slightly stronger on Void sections (4%) than Paper (2%) to keep light sections feeling clean.

### 4.3 Scroll-progress rail
- Fixed to the right viewport edge, `md:flex hidden`, vertical stack of `01–05` mono labels connected by a thin track.
- One `ScrollTrigger` per section toggles that section's rail item to "active" (scale 1.1, color `--signal-500`, track fill rises to meet it). Clicking a number scrolls to that section via `ScrollSmoother.scrollTo()`.
- This is what makes the `01/02/03…` eyebrows throughout the page load-bearing rather than decorative (§1.6).

### 4.4 Reduced motion & performance floor
- Wrap every GSAP timeline construction in a `matchMedia` / `prefers-reduced-motion` check; when reduced motion is requested, disable parallax, the cursor comet, ambient grain movement, and the DecryptReveal turbulence (swap it for a plain 300ms opacity crossfade), and keep only essential state-change feedback.
- Hero video: `preload="metadata"`, lazy-mount after the 2800ms delay (already the pattern in the current build), poster frame = a still export of `core-orb.png`.
- All animated properties should be `transform`/`opacity` where possible — GSAP handles this natively, avoid animating layout properties.

---

## 5. Section 1 — Hero, "The Signal" · **VOID**

Container: `relative w-full min-h-screen flex flex-col overflow-hidden bg-[--void-950]`

**1A. Header / logotype**
Reuse the existing wordmark treatment — "RED" (paper-50) + "DOT" (signal-500), set in Display/700, with the "O" in DOT subtly treated as a small filled circle (a quiet nod to the Core motif, not a redesign of the mark). On load: `clip-path: inset(0 100% 0 0)` animates to `inset(0 0 0 0)` over 0.9s, `ease: "signal"`, with the "DOT" segment's circle pulsing in 0.1s after the wipe completes (`scale 0 → 1`, `back.out`).

**1B. Sub-nav bar** — `flex justify-between items-start mt-8`, `text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase`
- Left (15%): three lines — "LOCAL" / "FIRST" / "TRACKER"
- Arrow separator (`ArrowRight`, lucide, 14px, strokeWidth 1, `text-ink-500`)
- Center (flex-1 mobile / 30% desktop): "Tracking the full story of your cycle through local-first encryption, on-device intelligence and total control."
- Arrow separator
- Right (15%, hidden mobile): nav links — **Trust Model / Cycle Phases / RedDot.ai / Pricing / Sign In** (each a real in-page anchor, not filler)
- Hamburger: identical mechanism to the reference (two lines → X), `duration-300`

**1C. Mobile menu overlay** — same slide-in pattern as reference, `bg-[--void-950] border-b border-[--void-border]`, same five links, `md:hidden`.

**1D. Background** — two layers:
1. `hero-signal-bloom.mp4` (§15), `absolute inset-0 w-full h-full object-cover opacity-70`, mounts after 2800ms exactly as the current build's video does.
2. A `.text-mega` watermark glyph — a single giant "•" in `--paper-50` at 4% opacity, positioned behind the left content block, bleeding off the left edge. This is the mega-text utility's one and only job on the page — a colossal, near-invisible instance of the Core, textural rather than legible.

**1E. Left content** — `px-10 md:px-16 mt-20 sm:mt-28 md:mt-32 w-[340px] z-10`
- Eyebrow: `01` + `w-16 h-[1.5px] bg-signal-500/30` (note: red, not the reference's neutral gray — this is the one eyebrow line allowed to carry brand color, since it's the page's opening statement)
- Headline (Display/500, `text-[3.2rem] md:text-[4.8rem] leading-[0.95] tracking-tight`), two lines:
  - Line 1, `--paper-50`: **"Your cycle,"**
  - Line 2, gradient `--signal-500 → --signal-400 → --signal-100` left-to-right: **"private by design."**
  - Reveal on load via `SplitText` (type: "lines"), each line masked and translated up from `y: 120%` with `stagger: 0.12, ease: "signal"`, starting after the logo wipe completes.
- Description (`text-[13px] md:text-[14px] text-ink-700 w-[260px] leading-[1.6]`): "RedDot is a local-first cycle tracker. No cloud servers reading your logs, no data brokers selling your history — just fully encrypted, on-device intelligence that answers to you and no one else."
- CTA row: **"Create Secure Account"** (primary, `bg-signal-500`, sliding paper-colored panel on hover exactly as the reference's leaf-icon button, but the icon swaps to a small line-art **lock** that un-shackles/opens on hover — rotates open 20°, translates up 2px) + **"Explore the Trust Model"** (secondary, outline, scrolls to §6).

**1F. Right sidebar (hidden mobile)** — `w-[200px] mt-12 md:mt-20`
- Label: `LIVE PHASE READING` (mono, bold, tracking-widest)
- Subtext: "Follicular Phase" / "Day 4 of 9 · energy rising" (`text-ink-500`)
- Stats: **Encryption** → `AES-256-GCM` · **Storage** → `100% Local`
- The existing radial progress ring (gradient `--signal-500 → --paper-50`) is relocated here as the "instrument-scale" Core (§1.4), stroke-dashoffset animates in via `ScrollTrigger` the first time it enters view, from full offset to the correct day-4-of-9 value.
- "View Details" — circle + `Plus`, same hover-to-filled mechanism as reference.

**1G. Scroll cue** — bottom-left, `hidden md:flex`, identical mechanism to reference ("Scroll to explore" + pause-icon circle), fade-up at `delay: 1.2`.

---

## 6. Section 2 — Absolute Trust Boundary · **PAPER**

Container: `relative w-full min-h-screen bg-[--paper-50] text-[--paper-ink-900] pt-24 md:pt-32 z-20`

**2A. Label:** `[ 02 ] Absolute Trust Boundary` — "02" in `--paper-ink-600`, rest bold uppercase black.

**2B. Heading** (Display/500, `text-[2.2rem] md:text-[3.4rem] leading-[1.1]`, max-width 1000px, center, `whileInView` from `y:40,opacity:0`):
> "Every symptom, every note, every log — encrypted on your device before it ever reaches a server."

**2C. Marquee ribbon** (new — connective tissue, not present in current build): a single-line, edge-to-edge, slightly rotated (`-1deg`) infinite horizontal ticker directly under the heading: `AES-256-GCM  •  ZERO-KNOWLEDGE  •  LOCAL-FIRST  •  NO TRACKERS  •  OPEN SOURCE  •` repeating, `font-mono text-xs tracking-widest text-[--paper-ink-600] border-y border-black/10 py-3`, driven by a plain `gsap.to(x: "-50%", duration: 40, ease: "none", repeat: -1)` on a doubled track. Pauses on hover.

**2D. Action pills** (5, unchanged structure from reference, restyled for Paper):
1. `Smartphone` — Local-First
2. `EyeOff` — Zero-Knowledge
3. `Lock` — AES-256-GCM
4. `Ban` — No Trackers
5. `Github` — Open Source
`rounded-full border border-black/15 text-[11px] font-medium uppercase tracking-wider bg-white`. Hover: `border-black bg-black text-white`.

**2E. Three cards** (content kept from the current build — it's already specific and good, just restyled onto Paper: `bg-white border border-black/10 rounded-xl`):
1. **Secure Browser Sandbox** — `Decrypted` tag — "Plaintext cycle data, mood scores, and symptoms exist exclusively in your browser memory during active sessions." — footer: `Local Web Crypto API`
2. **AES-GCM-256 Barrier** — `Zero-Knowledge` tag — "Before writing to local disk or syncing, payload fields are encrypted with your password-derived key. No unencrypted logs leave this boundary." — footer: `Plaintext Locked`
3. **Opaque Database** — `Cloud Storage / Ciphertext` tag — "Neon PostgreSQL only stores base64-encoded encrypted blobs and initialization vectors. If subpoenaed, we hand over unreadable noise." — footer: `Cloud Database`

**2F. Spacer:** `min-h-[220px] md:min-h-[450px]` — room for `core-orb.png` to bleed up from Section 3.

**2G. Bottom text row:** "WE DON'T JUST STORE DATA." (left) / "PRIVACY © 2026" (right), mono, uppercase, `text-[--paper-ink-600]`, hidden mobile.

---

## 7. Section 3 — The Cycle Spectrum · **VOID**

Container: `relative w-full bg-[--void-950] text-[--paper-50] z-30`

**3A. Overlapping hero art** — `core-orb.png` (§15), `absolute left-1/2 -translate-x-1/2 w-[160vw] md:w-[1100px] pointer-events-none z-0`, animates `whileInView` from `y:"-65%",opacity:0"` to `y:"-78%",opacity:1`, `duration:1.4, ease:"signal"`. **This layer is a transparent PNG — no blend mode.**

**3B. Heading area** — `px-8 md:px-16 pt-32 md:pt-48`
- Left, Display/500, `text-[1.8rem] md:text-[3.4rem] leading-[1.15]`:
  > "Charted from thousands of private signals [icon cluster: `Activity` `Sparkles` `ShieldCheck`, each in a `w-10 h-10 md:w-14 md:h-14 rounded-full border border-[--void-border] bg-black` circle, hover → white bg/black icon] & turned into patterns only you can see."
- Right — tagline: "WE DON'T JUST LOG SYMPTOMS / WE PROTECT YOUR STORY" (mono, `text-ink-500`) + three pills: **Private · Accurate · Empowering** (`border-[--void-border] text-ink-300`, hover → white/black).

**3C. Two-column panel** — separated by `h-px bg-[--void-border]`. **This section pins.**
- `ScrollTrigger`: `trigger: panelRef, start: "top top", end: "+=2400", pin: true, scrub: 1`. As the user scrolls through the pinned range, `activeChapter` (rename: `activePhase`) advances `0→3` tied to scroll progress (`onUpdate: progress => setActivePhase(Math.floor(progress * 4))`), **in addition to** click-to-jump (clicking a phase in the right list also calls `ScrollSmoother.scrollTo()` to the matching scroll-progress point so the two controls never disagree).
- **Left panel (35%):** top divider glyph is **"• • •"** (three Core-dots, not asterisks — small on-brand swap) in `text-ink-500`. Center: `DecryptReveal` (§13) rendering `phase-{name}.png`, `mix-blend-lighten` — **these four images must have a flat #000000 background, or the blend mode will show a visible box.** Bottom: counter `01 / 04`.
- **Right panel (65%):** top bar — "Understand your body. Protect your data." + animated "Phase 0X" label. Phase list, 4 items, content **kept from the current build**:
  1. **Menstrual Phase** — "Peak saturation. Focuses on energy conservation, rest, and protective logs." — `PHASE-SIGNAL`
  2. **Follicular Phase** — "Energy starts rising. Data service traces gradual metric shifts." — `PHASE-RISE`
  3. **Ovulation Phase** — "Peak lightness. Cycle predictions show key markers clearly." — `PHASE-PEAK`
  4. **Luteal Phase** — "Charcoal descending values. AI prepares your pre-period patterns." — `PHASE-FADE`
  Active item: white + `ArrowUpRight`. Inactive: `text-[#444] hover:text-[#999]`.

**3D. Footer strip:** "DECODING YOUR BODY'S PATTERNS" — mono, uppercase, `text-ink-500`.

---

## 8. Section 4 — On-Demand Intelligence · **PAPER**

Container: `bg-[--paper-50] text-[--paper-ink-900] py-24 md:py-32`

Staged like a device shot — light background makes the dark chat UI mockup read as a discrete "product," the way Apple stages a black phone on a white table.

- Icon (`MessageSquare` in a `--signal-500` rounded square) + heading: **"On-Demand Intelligence"**
- Description: "Ask RedDot.ai anything about your cycle. Upload a lab report, flag an anomaly, or ask why a metric moved — the assistant reasons over your encrypted data only for the length of that one question."
- Disclosure strip (kept near-verbatim, it's already precise): "🔒 Disclosed transparency: plaintext leaves the sandbox over secure HTTPS *only* for the duration of the request to fetch answers. Nothing is saved on the AI servers." — `bg-black/5 border-l-2 border-signal-500 px-4 py-3 font-mono text-xs`
- Chat mockup card: `bg-[--void-950] rounded-xl border border-[--void-border] shadow-2xl`, browser-chrome dots top-left, `REDDOT.AI ASSISTANT` label, `Secure Socket` badge (`--signal-500`), sample bubble: "Can you explain why my energy levels dropped on day 24 of this cycle?" Card lifts in on `whileInView` (`y: 40 → 0`, slight `rotateX` tilt settling to 0 for a "device being set down" feel).

---

## 9. Section 5 — Final CTA + Footer · **VOID**

Container: `bg-[--void-950] text-[--paper-50] py-32 text-center`

- Heading (Display/500, `text-[2.4rem] md:text-[3.6rem]`): **"Ready for a better standard?"**
- Subtext: "Get absolute privacy and high-fidelity cycle tracking today."
- Buttons: **"Sign Up (Key Notice Required)"** (primary, signal-500, hard-shadow red) / **"Sign In"** (ghost)
- Footer (small, `text-ink-500`, kept verbatim): "RedDot is an open-source demonstration for HackHazards '26. © 2026 RedDot Team. Encryptable only with your secret password."

---

## 10. Component: `DecryptReveal`

Replaces the reference's `SandTransitionImage`. Same turbulence-based dissolve mechanic, rebuilt on GSAP (no Framer Motion dependency) and re-themed: instead of a "sand" effect, the noise reads as **static resolving into signal** — an image decrypting into view. This is the component-level payoff of the security narrative: even the *transitions* look like decryption.

```tsx
function DecryptReveal({ src, alt, className }: Props) {
  const [displayedSrc, setDisplayedSrc] = useState(src);
  const filterId = useId();
  const proxy = useRef({ progress: 0 });
  // primitive refs: turbulenceRef, displaceRef, offsetRef, blurRef, colorMatrixRef

  useEffect(() => {
    if (src === displayedSrc) return;
    const tl = gsap.timeline({
      onComplete: () => setDisplayedSrc(src),
    });
    // Phase 1 — exit (450ms): static consumes the outgoing image
    tl.to(proxy.current, {
      progress: 1,
      duration: 0.45,
      ease: "power3.in", // approximates the reference's cubic exit, Math.pow(t,3)
      onUpdate: () => applyFilter("exit", proxy.current.progress),
    });
    // Phase 2 — enter (450ms): static resolves into the incoming image
    tl.set(proxy.current, { progress: 0 })
      .to(proxy.current, {
        progress: 1,
        duration: 0.45,
        ease: "power4.out", // approximates the reference's quartic enter, 1-(1-t)^4
        onUpdate: () => applyFilter("enter", proxy.current.progress),
      });
  }, [src]);

  // applyFilter writes directly to the SVG primitive attrs each tick:
  //   feDisplacementMap.scale        : 0 → 150
  //   feOffset.dy                    : enter -80→0 / exit 0→120
  //   feOffset.dx                    : ±30 → 0 (slight lateral drift)
  //   feGaussianBlur.stdDeviation    : 0 → 6
  //   feColorMatrix alpha row        : 1 - progress * 1.2 (clamped 0-1)
  // feTurbulence stays constant: type="fractalNoise" baseFrequency={1.8} numOctaves={4}

  return (
    <div className={className}>
      <svg width="0" height="0"><defs>{/* filter #{filterId}, primitives above */}</defs></svg>
      <img
        src={displayedSrc}
        alt={alt}
        style={{ filter: `url(#${filterId})` }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
```

Total duration 900ms, matching the reference exactly, but restructured as two sequential 450ms GSAP tweens (mirroring the reference's `AnimatePresence mode="wait"`, which does not overlap exit and enter) instead of a `requestAnimationFrame` loop keyed to Framer's `usePresence()`. Under `prefers-reduced-motion`, skip the filter entirely and crossfade opacity over 300ms.

---

## 11. Motion Pattern Catalog

Reference names for every recurring GSAP pattern used across the page — keep the count small and reuse these rather than inventing new one-off animations per section (see §1.5 on restraint):

| Pattern | Where | Mechanism |
|---|---|---|
| `text-reveal` | Every headline | `SplitText` (lines or words) → mask + `y` stagger, `ease: "signal"` |
| `pinned-scrub` | §7 phase panel | `ScrollTrigger` `pin:true, scrub:1`, drives `activePhase` state |
| `magnetic-cta` | Primary buttons | `quickTo` on `x`/`y`, capped to a small radius, resets on mouseleave |
| `cursor-comet` | Global | Two `quickTo` instances at different lag (§4.1) |
| `marquee` | §6 ribbon | `gsap.to(x:"-50%", repeat:-1, ease:"none")` on a doubled track |
| `bleed-reveal` | `core-orb.png`, §7 | `ScrollTrigger` scrub, `y` + `opacity` |
| `stroke-fill` | Phase ring, §5F | `stroke-dashoffset` tween on first viewport entry |
| `count-in` | Any stat/number | `ScrollTrigger` triggers a `textContent` tween via a plain-object proxy |
| `load-sequence` | App boot | One master timeline: logo wipe → dot pulse → headline `text-reveal` → sidebar stagger. Optional: a brief "DECRYPTING…" preloader (mono, scrambled-character resolve using `ScrambleTextPlugin`, now free) before the sequence starts. |

---

## 12. Responsive Behavior

- All pinned/scrubbed `ScrollTrigger` instances (§7) are **disabled below `md`** — on mobile, the phase panel becomes a normal scrolling stack (auto-advance every 3.5s + tap-to-select, same as the current build's `setInterval` behavior), not a pinned scrub. Pinning tall interactive panels on small viewports is a common source of scroll-jank and is not worth the complexity.
- Scroll-rail (§4.3), right sidebar (§5F), and marquee ribbon (§6) are `hidden` below `md`.
- Custom cursor (§4.1) never activates on coarse pointers — no fallback needed, the native cursor is the fallback.
- Hero headline drops to `text-[3rem]`, mega-watermark glyph drops to `text-[40vw]` and is more heavily cropped, below `md`.

---

## 13. Accessibility Floor

- Every focusable element has a visible focus ring independent of the custom cursor (§4.1).
- `prefers-reduced-motion` disables: parallax, cursor comet, ambient grain motion, marquee auto-scroll (pauses statically), and the `DecryptReveal` turbulence filter (§10 fallback).
- Color contrast: body text on Paper is `--paper-ink-600` (`#4A4646`) on `#F8F8F8` — passes AA at 14px+. Body text on Void is `--ink-700` (`#7C7878`) on `#0A0A0A` — verify AA at the actual font sizes used; bump to `--ink-500` if a given instance fails.
- All decorative imagery (`core-orb.png`, `phase-*.png`) gets empty `alt=""`; the phase name itself is conveyed in real text in the right-hand list, not the image.

---

## 14. Copy Voice

Plain verbs, sentence case, no filler. A button says exactly what happens when pressed ("Create Secure Account," not "Get Started"). Nothing in this spec should read as more clever than clear — if a line of copy doesn't help someone understand what RedDot does or decide what to click next, cut it.

---

## 15. Asset Manifest

Full generation prompts for these live in the accompanying chat message, not this file. This table is the technical contract the code must satisfy.

| File | Type | Dimensions | Background | Used in | Notes |
|---|---|---|---|---|---|
| `hero-signal-bloom.mp4` | video, loop, muted | 1920×1080 min (16:9) | n/a | §5D | 6–10s seamless loop, `object-cover` |
| `core-orb.png` | image | ~2400×2400 | **transparent (alpha)** | §5D watermark base / §7A hero bleed | Must have generous negative space around the orb for the `y:-65%→-78%` translate to work |
| `phase-menstrual.png` | image | ~2000×2000 (square) | **flat `#000000`, no vignette** | §7C left panel | `mix-blend-lighten` applied in code — any non-pure-black background pixel will show as a visible box |
| `phase-follicular.png` | image | ~2000×2000 | **flat `#000000`** | §7C left panel | same constraint as above |
| `phase-ovulation.png` | image | ~2000×2000 | **flat `#000000`** | §7C left panel | same constraint as above |
| `phase-luteal.png` | image | ~2000×2000 | **flat `#000000`** | §7C left panel | same constraint as above |

