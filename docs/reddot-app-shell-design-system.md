# RedDot — App Shell & Auth
### Extends `reddot-design-system.md` — read that first. This file only specifies what's different inside the logged-in app.

## 0. What's already working
Checked pixel colors directly against the three app screens (dashboard ring, login button, chat bubble) — all sample to exactly `#E01028`. The brand token made it into the real product correctly. **Don't touch color values in this pass.** What's missing is everything the color sits inside: type, motif reuse, component chrome, and copy consistency. That's the actual scope here.

## 1. One deliberate deviation from the landing page: no Void/Paper alternation
The landing page alternates light and dark sections for narrative pacing — that's right for a one-time scroll story. The app is used daily for data entry and reading personal health information; alternating backgrounds there would fight muscle memory instead of building it. **The entire authenticated app stays Void (`#0A0A0A`) throughout.** No Paper sections inside `/dashboard/*`, `/login`, `/signup`. State this explicitly in the build so nobody "fixes" it back toward the marketing pattern later.

## 2. Global carryover checklist
Confirm these are active on every authenticated route, not just the marketing site:
- Custom cursor (§4.1 of the main spec) — currently unconfirmed from screenshots; verify the cursor provider wraps the authenticated route tree, not just the public one.
- Ambient grain (§4.2) — same check.
- Display/body/mono type roles (Bricolage Grotesque / Inter / JetBrains Mono) — the dashboard's "Good afternoon" and Know Hub's "Know Hub" headings currently read as a default system sans, not the display face. Every H1/H2 in the app should use Display, same as the marketing page.
- Hard-shadow signature on hover for buttons and cards (§3 of the main spec).

## 3. App nav (Tracking / RedDot.ai / Know)
Current: a generic solid-fill segmented pill control. Keep the three-tab structure — it's the right information architecture — but bring it in line with the brand:
- Tab labels set in `font-mono uppercase tracking-widest text-xs`, not the current default-weight sans.
- Active tab: instead of a fully solid red pill (which reads as a generic app default), use a thin `1px` signal-red border with a soft `10%` red fill — quieter, more consistent with the pill treatment already established on the landing page's Trust Boundary section.
- Add one small addition tying the app to "The Core" motif established on the marketing site: an 8px dot next to the logo wordmark that isn't just a static brand mark — it lives in the current cycle-phase's color state (deep saturated red on menstrual days, brightening toward the pale bloom tone near ovulation, per the same phase-color mapping used for `phase-*.png`). It's a two-second detail, but it makes the logo itself a live status indicator instead of a static icon, and it's the cheapest possible way to make the signature motif feel like it belongs to the whole product, not just the landing page.

## 4. Account dropdown
Current: avatar circle, email, "Settings," "Cloud sync: On" (red pill), "Last backup" timestamp, "Log out." Structurally fine. Two changes:
- **Rename "Cloud sync" to "Encrypted Backup."** The word "cloud" on its own, right after a product whose entire pitch is "no cloud servers reading your logs," undercuts the trust message at the exact moment someone is checking their account settings. Pair it with a small lock icon. If the backup genuinely is end-to-end encrypted (which the rest of the copy implies), say so here — this is a place to reinforce the promise, not just report a status.
- Mono labels for "Settings," "Encrypted Backup," "Last backup," matching the rest of the app's label treatment. "Log out" stays in signal-red, active-voice, as-is — it's already correct.

## 5. Auth pages (`/login`, `/signup`)
Current state is functional but empty — a centered form on flat black with no brand presence beyond the wordmark. This is the single cheapest upgrade in the whole app: it's one screen, low interaction complexity, high visual payoff.
- Add `core-orb.png`, heavily dimmed (12–15% opacity) and blurred (`blur-3xl`), positioned off-center in the background, very slowly breathing scale (`1 → 1.03 → 1`, ~8s loop, `ease: "signal"`). It should read as ambient atmosphere, not a competing focal point — the form stays the clear foreground.
- **Unify the tagline.** The login screen currently reads "Menstrual health, private by design." while the hero reads "Your cycle, private by design." Pick one canonical line — recommend keeping the hero's "Your cycle, private by design." everywhere it's user-visible, and reserving "Menstrual health" phrasing for metadata/SEO only (page `<title>`, meta description) where the more literal, searchable phrasing earns its place. A brand line should say the same thing everywhere a person can see it.
- Form fields, button, and links are already in good shape — solid signal-red "Sign in" button, working "Forgot password?" / "Sign up" links. Don't over-design a login form; it's not the place for the risk-taking.

## 6. Component tokens quick-reference (for building any new app screen)
| Element | Spec |
|---|---|
| Card | `bg-[--void-900] border border-[--void-border] rounded-xl` |
| Card hover | hard-shadow `4px 4px 0px rgba(224,16,40,0.35)` |
| Mono label | `font-mono text-[10px] uppercase tracking-widest text-[--ink-500]` |
| Primary button | `bg-[--signal-500] hover:bg-[--signal-600]`, hard-shadow on hover |
| Ghost button | `border border-[--void-border] text-[--paper-50]` |
| Callout / disclosure strip | `border-l-2 border-signal-500 bg-black/20 px-4 py-3 font-mono text-xs` (this pattern already exists on the landing page's AI disclosure line — reuse it verbatim for the account dropdown's backup notice, empty states, and any other "important small print" moment in the app) |

## 7. Empty & error states
None were visible in the screenshots, but the app will have them (no logs yet, no chat history, search with no results). Per house writing rules: an empty state is an invitation to act, not a mood — name what's missing and give one clear next action, in the interface's voice, not a person's. A dimmed Core-dot plus one sentence plus one button is the house pattern; don't design a new empty-state treatment per screen.
