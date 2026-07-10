# RedDot — RedDot.ai Chat
### Extends `reddot-design-system.md` and `reddot-app-shell-design-system.md` — read both first.

## 1. The gap that matters most in this whole overhaul
The landing page's Section 4 (§8 of the main spec) shows a chat mockup with browser-chrome dots, a `REDDOT.AI ASSISTANT` label bar, and a `Secure Socket` badge — it's the product's own advertisement for what talking to RedDot.ai feels like. The real `/dashboard/ai` page currently doesn't look like that mockup at all; it's a generic two-pane chat layout (sidebar + bubbles) that could belong to any chat product. That's a broken promise between the marketing page and the product, and it's the highest-priority fix in this entire app pass — closing that gap should happen before any of the smaller polish items below.

## 2. Chat panel chrome
Rebuild the main chat panel using the exact mockup component from the landing page, not a re-creation:
- Top bar: browser-chrome dots (decorative, left), `REDDOT.AI ASSISTANT` mono label (center), `Secure Socket` badge in signal-red (right) — pull this as a shared component so the marketing mockup and the live product are provably the same code, not two things that happen to match today and drift apart later.
- Panel: `bg-[--void-950] border border-[--void-border] rounded-xl`.

## 3. Message bubbles
- User bubble: solid `--signal-500` fill, white text — already correct in the current build, don't change it.
- Assistant response: currently a plain bordered gray box with unlabeled text. Change to `bg-[--void-900] border border-[--void-border]`, with a small 8px Core-dot "avatar" (same dot as the cursor and the nav's live-phase indicator, §3 of the app-shell doc) plus a `RedDot.ai` mono label above the response — right now a response has no visual author attribution beyond position on the screen, which is a small but real clarity gap for a product whose whole pitch is "know exactly what's happening with your data."
- Thinking/loading state: replace any generic three-dot typing indicator with the same 8px Core-dot, breathing scale `1 → 1.15 → 1` on a ~1.2s loop (GSAP, `ease: "signal"`). It resolves into the static dot-plus-label treatment once the response streams in. This is the single best use of the signature motif in the whole app — it turns "the AI is thinking" into a literal, on-brand visual rather than a generic UI convention borrowed from every other chat product.

## 4. Sidebar (chat history)
- Current: solid dark-red fill on the active chat row — a fine, ordinary chat-app pattern, but the fill approach doesn't match anything else in the system (every other "active" state in this product is either a thin colored border or a mono-label color change, never a solid fill block). Swap to: `border-l-2 border-signal-500` on the active row, transparent background, matching the disclosure-strip and card-hover language used everywhere else.
- Timestamps ("Jul 8," "Jul 7"): set in mono, `text-[--ink-500]`, smaller than the chat title — currently they're default-weight and roughly the same visual size as the title, competing with it rather than supporting it.
- "+ New chat" button: keep solid signal-red, keep the copy exactly as-is (it's already a correct, active-voice label — don't change it to "Start conversation" or similar). Optional: swap the plain `+` glyph for the same circle-plus treatment used on the landing hero's "View Details" control, for one more small point of visual continuity.

## 5. Input bar
- Keep `Ask RedDot.ai…` placeholder copy exactly as-is — plain, on-voice, no change needed.
- Border: transparent/void-border by default, transitions to `--signal-500` on focus. Currently unclear from the screenshot whether a focus state exists at all — confirm one does; this also satisfies the accessibility floor (visible focus) carried over from the main spec.

## 6. Disclaimer line
"Informational only — not medical advice. Always consult a healthcare provider." — keep verbatim. Restyle to `font-mono text-xs text-[--ink-500]`, consistent with every other piece of compliance copy across the app (dashboard footer, Know Hub subhead). Right now it's plausible this line uses a slightly different weight/size than its counterparts elsewhere — audit all compliance copy in one pass and make sure it's one component used everywhere, not several similar-looking ones.
