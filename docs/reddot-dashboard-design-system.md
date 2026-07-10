# RedDot — Tracking Dashboard
### Extends `reddot-design-system.md` and `reddot-app-shell-design-system.md` — read both first.

## 1. The ring is not a widget, it's "the Core"
This is the most important line in this file. The main spec (§1.4) already named the radial phase ring as one of the three fixed scales of the signature motif — cursor scale, instrument scale, image scale. The dashboard ring *is* the instrument scale. It must use the **exact same gradient stops, stroke width, and easing** as the hero sidebar's ring on the marketing page — not a similar-looking recreation. If a build agent styles this independently, the brand's one recurring idea quietly forks into two different rings that happen to look alike, which defeats the entire point of having a signature. Pull the styling from the same shared component/token, don't hand-author it twice.
- Current state: gradient samples correctly at `#E01028` — good, keep the value.
- Add: on load, the stroke draws in from `0` to the current day's progress via `stroke-dashoffset` tween (the `stroke-fill` pattern already catalogued in the main spec's §11) — right now it's implied static from the screenshot; confirm it's animating, since a ring that doesn't draw in undersells the one moment on this page that's supposed to feel alive.

## 2. Heading
"Good afternoon" + "SECURE LOCAL SANDBOX" eyebrow — keep this copy exactly, it's warm without being saccharine and the mono eyebrow is already correctly on-brand. Fix only the typeface: this should render in Display (Bricolage Grotesque), not the current default sans. Same rule for every H1 in the app.

## 3. Quick-action cards (Log Today / Cycle View / Insights)
Currently plain bordered boxes with generic icons — functional, undersells the brand. Bring them in line with the Trust Boundary card treatment from the landing page:
- `bg-[--void-900] border border-[--void-border] rounded-xl`, hard-shadow signal-red on hover (§6 of the app-shell doc).
- Icon containers: small `w-9 h-9 rounded-full border border-[--void-border]` circle behind each Lucide icon, matching the circle treatment used for the landing page's inline icon clusters, rather than a bare icon floating in space.
- Keep the copy exactly as-is ("Log Today / Symptoms, mood, daily logs," etc.) — it's already plain, active-voice, specific. No rewrite needed here.

## 4. REDDOT.AI ENGINE insight callout
Currently: a mono red label with a sparkle icon, then a bare paragraph of generated text sitting directly on the page background — no card chrome distinguishes "the AI said this" from "the product said this," which matters for a health product where that distinction is a trust signal, not a style choice.
- Wrap it in the disclosure-strip pattern already defined for the AI page (`border-l-2 border-signal-500 bg-black/20 px-4 py-3`) — reuse the exact component, don't invent a second variant.
- Loading state: while the insight is generating, show the pulsing 8px Core-dot (the same one used for the AI chat's thinking state, §3 of `reddot-ai-chat-design-system.md`) instead of a generic skeleton bar — one more place the signature motif does real work instead of decorative repetition.
- Keep the actual generated copy's tone as shown ("As you start your menstrual phase, you might notice...") — it's appropriately hedged, specific, and closes with a "consider chatting with a healthcare provider" nudge rather than a diagnosis. Don't let a redesign pass touch this language; it's a clinical-tone decision, not a visual one.

## 5. Footer compliance row
"LAST BACKUP: JUL 8, 2026" / "Non-diagnostic tool. Consult your physician for medical advice." — keep verbatim, already correctly mono/muted. This is the same visual pattern as the landing page's Section 2 bottom text row (`WE DON'T JUST STORE DATA` / `PRIVACY © 2026`) — confirm it uses the identical component rather than a one-off, for the same reason as §1 above.

## 6. Cycle View & Insights (not visible in the screenshots — spec ahead of build)
- Any chart: primary series in `--signal-500`, secondary/comparison series in `--ink-500`, gridlines in `--void-border`. No other colors enter a chart on this page — no default charting-library blue, ever.
- Empty state (no data logged yet): dimmed Core-dot, one sentence naming what's missing, one button that starts the fix. Per house writing rules, this is an invitation to act, not a mood — "No cycles logged yet. Log today's entry to start your first insight." + a "Log Today" button, not an illustration of a sad face or an empty box.
- Heatmap / trend chart interactions should use the same hard-shadow hover as every other card in the system — don't let a charting library's default hover states (drop shadows, tooltips with default styling) leak through unstyled.
