# 02 — Feature Spec

> **v2 update:** the AI assistant (E1) is now branded **RedDot.ai** and gains a new MVP-tier requirement — persistent, encrypted past-chat history with resume (E1 acceptance criteria updated below; new feature E5 added for this explicitly). A new **H. Know (Education Hub)** category has been added for the educational content section. Everything else is unchanged from v1.

Each feature is tagged **[MVP]**, **[V1.1]** (build right after MVP if time allows), or **[STRETCH]** (mention in pitch, build only if way ahead of schedule). See 10_MVP_BUILD_PLAN.md for the actual build order — this doc is the full feature universe, that doc is the sequencing.

---

## A. Accounts & Onboarding

### A1. Sign up / log in **[MVP]**
- Email + password (use Auth.js or similar — don't hand-roll auth).
- Password is also the source for the local-data encryption key (see 09_SECURITY_AND_PRIVACY.md) — this must be explained to the user at signup, not buried.
- Acceptance: a new user can create an account and land in onboarding within 2 screens.

### A2. Onboarding flow **[MVP]**
- Explain the privacy model in plain language (1 short screen, not a wall of legal text).
- Ask: last period start date, typical cycle length (with an explicit "I'm not sure / irregular" option — this matters, see PCOS-aware note in C2).
- Ask: sync preference (local-only vs cloud sync) — explained with the trade-off, not hidden in settings.
- Acceptance: by the end of onboarding, the app has enough data to show a first cycle prediction, and the user has made an informed sync choice.

### A3. Password reset flow **[MVP]**
- Must show the data-loss warning (see 09_SECURITY_AND_PRIVACY.md) before proceeding if the user has unsynced local data.
- Acceptance: a user attempting password reset sees a clear warning and an "export your data first" shortcut before continuing.

---

## B. Privacy & Data Controls

### B1. Local-first encrypted storage **[MVP]**
- All cycle/mood/symptom/journal entries write to IndexedDB by default, encrypted client-side.
- Acceptance: with sync off, inspecting network traffic shows no health data leaving the browser.

### B2. Optional cloud sync toggle **[MVP]**
- Off by default. When on, encrypted blobs sync to Neon.
- Acceptance: toggling on/off is reversible and clearly described before the user enables it.

### B3. Export data (encrypted backup file) **[MVP]**
- One click → downloads an encrypted JSON file.
- Acceptance: file is unreadable without the account password; re-importable.

### B4. Import data (restore backup) **[MVP]**
- Acceptance: importing a valid backup on a fresh browser/account restores all entries correctly.

### B5. "Last backup" indicator **[MVP]**
- Persistent, ambient UI element (not a popup) showing last export date, or "Never backed up."
- Acceptance: visible from the home/dashboard screen at all times without navigating away.

### B6. Panic wipe **[V1.1]**
- One tap, with a confirm step, deletes all local + synced data immediately.
- Acceptance: after wipe, no trace of health data remains in IndexedDB or, if synced, in Neon for that user.

### B7. Privacy page **[MVP]**
- Plain-language page: what we store, what we don't, no third-party analytics/ad SDKs, what happens to uploaded reports.
- Acceptance: a non-technical reader can understand the privacy model in under a minute.

### B8. Partner/support-person share link **[STRETCH]**
- Read-only, revocable, opt-in link sharing a summary view (not raw logs) with a chosen person.
- Acceptance: link can be revoked instantly; revoked links 404.

---

## C. Cycle Tracking Core

### C1. Period logging **[MVP]**
- Log start/end date, flow intensity (light/medium/heavy/spotting).
- Acceptance: a logged period updates the cycle history and next-prediction immediately.

### C2. Phase awareness & irregular-cycle mode **[MVP]**
- Calculate and display current phase: Menstrual, Follicular, Ovulation, Luteal.
- If cycle length varies significantly across logged cycles, switch prediction model to a wider confidence range rather than a false-precise date, and visually communicate "irregular" rather than presenting a single confident date. This is the explicit fix for the PCOS/irregular-cycle gap found in competitor research.
- Acceptance: a user with 3+ wildly different cycle lengths sees a range-based prediction and a note explaining why, not a falsely confident single date.

### C3. Symptom logging **[MVP]**
- Quick-tap chips (cramps, headache, acne, bloating, fatigue, breast tenderness, nausea, back pain, etc.) — not a long form.
- Acceptance: logging a day's symptoms takes under 15 seconds for a returning user.

### C4. Creative cycle history view **[MVP]**
- **v2 update:** replaces a plain calendar grid with something more distinctive, per the brief — direction: a GitHub-contribution-style heatmap (each day a cell, color intensity on the monochrome red ramp showing flow/symptom load, laid out across months) as the MVP-safe build, with a radial/spiral year view as a stretch-tier upgrade if time allows. A standard month-grid calendar can exist as a secondary toggle view, but isn't the default. See 06_PAGES_AND_FLOWS.md's "Tracking section" detail for the full spec.
- Shows past periods, predicted next period, fertile window — same underlying data as a calendar would, presented more distinctively.
- Acceptance: tapping any day/cell shows that day's full log (symptoms, mood, notes); the heatmap's color intensity visibly corresponds to logged flow/symptom data, not a placeholder gradient.

### C5. Phase-ring visualization **[MVP]**
- The signature visual device (see 07_DESIGN_SYSTEM.md v2): a continuous gradient-ramp ring (not four flat-colored segments) showing current phase and day-within-phase via the monochrome red ramp. This is the primary "home screen" visual, not buried in a stats tab, and also the hero visual on the landing page.
- Acceptance: present and functioning on the dashboard; visually consistent with the v2 design system's monochrome phase ramp; phase is also identifiable via text label, not color alone.

---

## D. Mood & Holistic Tracking

### D1. Daily mood check-in **[MVP]**
- Fast, low-friction (slider or emoji-based), one tap to log.
- Acceptance: completing a check-in takes under 10 seconds.

### D2. Sleep / energy / appetite / exercise quick-logs **[MVP]**
- Simple scaled inputs (e.g., 1–5), optional per day.
- Acceptance: skippable without breaking the streak/flow; not mandatory.

### D3. Journal/notes field **[MVP]**
- Free text per day, encrypted like everything else.
- Acceptance: text persists, encrypts, and is retrievable on reload.

### D4. Phase-correlated insights **[V1.1]**
- Surfaces real patterns: "You tend to log lower energy on day 2 of your luteal phase" — generated from the user's own logged history, not generic copy.
- Acceptance: insight only appears once there's enough data to support it (e.g., 2+ full cycles logged); never fabricated from insufficient data.

---

## E. AI Layer (Groq)

### E1. Conversational health assistant — "RedDot.ai" **[MVP]**
- Chat interface; answers questions using the user's recent logged data as context (last ~30 days pulled from decrypted in-memory state client-side, sent to Groq for that single request).
- Must never produce a diagnosis; must include a standing disclaimer in its system prompt (see 08_AI_PROMPTS_AND_LOGIC.md).
- Acceptance: asking "why am I tired this week" returns an answer referencing the user's actual logged symptoms/sleep, not a generic response.

### E5. RedDot.ai past-chat history & resume **[MVP — added in v2]**
- A list of previous conversations, each resumable; new conversations can also be started fresh.
- Stored encrypted client-side (IndexedDB), synced as ciphertext if cloud sync is on — same architecture as every other data type, not a separate server-side store (see 04_DATA_MODEL.md, 08_AI_PROMPTS_AND_LOGIC.md).
- Acceptance: closing the app and reopening it shows the same past-chat list; opening a past chat restores its full message history and allows continuing it with context intact.

### E2. Daily/weekly AI insight card **[V1.1]**
- Short, phase-aware, personalized text generated from recent data, shown on the dashboard.
- Acceptance: different users with different data get genuinely different insight text, not templated copy with names swapped in.

### E3. Report/lab analysis upload (a mode within RedDot.ai) **[MVP]**
- User uploads a PDF/image of a blood test or hormone panel.
- Server-side: extract text (OCR if image), send to Groq with a strict "informational only, never diagnostic" system prompt, return a plain-language summary + flagged out-of-typical-range values + suggested questions for a doctor.
- File is processed in memory only and discarded immediately after — never written to disk, never stored. UI shows a literal "processed and discarded at [timestamp]" confirmation.
- Mandatory disclaimer + checkbox acknowledgment before the upload control is even shown.
- Acceptance: uploading a sample report returns a plain-language summary within a reasonable time, and the UI proves (visibly) the file was discarded.

### E4. Mood-pattern narrator **[STRETCH]**
- Turns weeks of mood/symptom logs into a plain-English trend summary instead of a chart alone.
- Acceptance: summary correctly reflects the direction of trends present in the underlying logged data.

---

## F. Engagement (Healthy Version)

### F1. Logging streaks **[V1.1]**
- Framed as consistency, not points/competition. "You've logged 6 days in a row," not leaderboards.
- Acceptance: streak counter increments correctly and resets appropriately on a missed day, without shaming copy.

### F2. Gentle reminders/notifications **[V1.1]**
- Opt-in only. "Period likely starting in 2 days," "you usually feel cramps around now."
- Acceptance: fully disableable; off by default until explicitly enabled.

### F3. Cycle health score **[STRETCH]**
- Simple, explainable score (regularity + symptom load + logging consistency) — not a black-box number.
- Acceptance: the score's breakdown is visible/explained, never just a bare number.

---

## G. Health Extras

### G1. Symptom pattern flags **[V1.1]**
- E.g., "you've logged unusually heavy flow 3 cycles running — consider mentioning this at your next checkup." Pattern detection framed as a prompt to seek care, never a diagnosis.
- Acceptance: only triggers on a real detected pattern across multiple logged cycles, never on a single data point.

### G2. Medication/birth control reminder log **[STRETCH]**
- Simple recurring reminder + log of doses taken.
- Acceptance: reminders fire correctly and logging a dose is a single tap.

---

## H. Know (Education Hub) — added in v2

### H1. Know hub — browsable education content **[MVP]**
- A static-content section, separate from the personalized Tracking/RedDot.ai surfaces: phase explainers, general menstrual health articles, common-condition overviews (e.g., PCOS basics), myth-busting content.
- Organized by phase (using the same monochrome visual ramp as the rest of the product) and by topic.
- Content is curated/hand-written for MVP, not AI-generated or dynamically sourced — see 10_MVP_BUILD_PLAN.md for scope.
- Same non-diagnostic framing rules apply here as everywhere else (09_SECURITY_AND_PRIVACY.md) — informational content, not medical authority; encourage consulting a doctor for anything personal.
- Acceptance: hub is browsable by phase and by topic; each article opens a clean reading view; no content makes a diagnostic or prescriptive claim.

### H2. Know article detail view **[MVP]**
- Clean, editorial reading layout (the one place in the product where a calmer, more content-forward visual register is appropriate even within the v2 red/white/black system).
- Acceptance: article renders legibly at all supported widths; includes a visible non-diagnostic disclaimer where relevant (e.g., on condition-overview articles).

---

## Feature summary table

| Code | Feature | Tier |
|---|---|---|
| A1 | Sign up / log in | MVP |
| A2 | Onboarding flow | MVP |
| A3 | Password reset + data-loss warning | MVP |
| B1 | Local-first encrypted storage | MVP |
| B2 | Cloud sync toggle | MVP |
| B3 | Export backup | MVP |
| B4 | Import backup | MVP |
| B5 | Last-backup indicator | MVP |
| B6 | Panic wipe | V1.1 |
| B7 | Privacy page | MVP |
| B8 | Partner share link | STRETCH |
| C1 | Period logging | MVP |
| C2 | Phase awareness + irregular-cycle mode | MVP |
| C3 | Symptom logging | MVP |
| C4 | Creative cycle history view (heatmap/spiral) | MVP |
| C5 | Phase-ring visualization (monochrome ramp) | MVP |
| D1 | Mood check-in | MVP |
| D2 | Sleep/energy/appetite/exercise logs | MVP |
| D3 | Journal/notes | MVP |
| D4 | Phase-correlated insights | V1.1 |
| E1 | RedDot.ai conversational assistant | MVP |
| E2 | AI daily/weekly insight card | V1.1 |
| E3 | Report/lab analysis upload (RedDot.ai mode) | MVP |
| E4 | Mood-pattern narrator | STRETCH |
| E5 | RedDot.ai past-chat history & resume | MVP |
| F1 | Logging streaks | V1.1 |
| F2 | Gentle reminders | V1.1 |
| F3 | Cycle health score | STRETCH |
| G1 | Symptom pattern flags | V1.1 |
| G2 | Medication reminder log | STRETCH |
| H1 | Know hub (education content) | MVP |
| H2 | Know article detail view | MVP |
