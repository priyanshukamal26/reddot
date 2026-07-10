# RedDot — Know Hub
### Extends `reddot-design-system.md` and `reddot-app-shell-design-system.md` — read both first.

## 1. The obvious win nobody's cashed in yet
Four of these article cards are literally tagged "Menstrual Phase," "Follicular Phase," "Ovulation Phase," "Luteal Phase" — and the product already has four generated images (`phase-menstrual.png`, `phase-follicular.png`, `phase-ovulation.png`, `phase-luteal.png`) built for exactly this concept, currently only used once each inside the landing page's carousel. Right now these Know Hub cards are text-only. Give each phase-tagged article its matching orb image as a thumbnail. This is close to free — the assets already exist — and it does more to make Know Hub feel like part of the same product as the landing page than any amount of type or spacing work would.
- Thumbnail: tight crop of the phase orb, `aspect-[4/3]` or square, `object-cover`, top of the card. No `mix-blend-lighten` needed here since the card sits on a flat void background already matching the image's own background — a plain `object-cover` will look correct without extra blend-mode handling.
- **Reserve this treatment for the four phase articles only.** Non-phase content ("Nutrition," "General Topics," "Common Conditions") should use a small Lucide icon instead, not a generic stock photo or a re-tinted orb. Applying the orb motif everywhere would dilute the one thing that currently makes it mean something — it should only appear where it's actually about a phase.

## 2. Tag pills
Currently the active/first-visible cards show a solid red-outlined "Menstrual Phase" pill, while others show up in a washed-out gray pill ("Follicular Phase") that reads as disabled or lower-priority content — worth checking whether that's intentional (e.g., signaling "not the current phase") or an unstyled default state. If it's meant to signal "not your current phase," say so more clearly (a small "current phase" indicator dot is more legible than a color downgrade that could just as easily read as broken styling). If it's not intentional, every phase tag should carry the same signal-red-bordered pill regardless of which phase the reader is currently in — the article's relevance to the reader isn't about the pill's prominence.

## 3. Heading & eyebrow
"EDUCATIONAL MODULES" mono eyebrow with a heart icon, "Know Hub" display heading — the mono eyebrow treatment is already correct and on-brand, keep it. Swap the heart icon for a small Core-dot bullet (identical to the one already used in the landing header's "REDDOT" wordmark) rather than a generic Lucide heart — a heart icon could belong to any wellness product; the dot is specifically this one. "Know Hub" heading: render in Display (Bricolage Grotesque), same fix as every other H1 in the app.

## 4. Search & filters
- Search bar: currently a plain bordered input with a search icon — restyle border/focus treatment to match the input-focus rule from `reddot-ai-chat-design-system.md` (`--void-border` default, `--signal-500` on focus), so every text input in the app behaves identically.
- Filter pills ("All Articles / Cycle Phases / General Topics," "Topics: All / Cycle Basics / Common Conditions / Daily Tracking / Nutrition"): active state currently solid red fill (matches the nav tab's current pattern from the app shell, which this doc already recommends softening to a thin border + light fill). Apply the same fix here for consistency — one pill treatment, used everywhere a pill appears in the app, not a slightly different one per screen.

## 5. Card hover & layout
- Hard-shadow signal-red hover, same as every other card in the system (§6 of the app-shell doc).
- "Read Article →" link: keep copy and arrow exactly as-is, already correct active-voice pattern. Just confirm the arrow icon is the same `ArrowUpRight`/`ArrowRight` family used elsewhere (landing's chapter list, sub-nav separators) rather than a differently-weighted default icon.
- Reading time ("3 min read" with a clock icon): mono, `--ink-500`, matching every other small-metadata treatment in the app.

## 6. Empty state (search with no results)
Same house pattern as the rest of the app (§7 of the app-shell doc): dimmed Core-dot, one sentence, one action — "No articles match that search. Try a different term, or browse by phase instead." plus a button that clears the search and returns to the unfiltered grid.
