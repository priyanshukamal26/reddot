# 08 — AI Prompts & Logic

> **v2 update:** the conversational assistant (E1) is now branded as **RedDot.ai** and gains persistent, encrypted local chat history with resume — see that section below for the architecture-relevant change. Report analysis (E3) is now presented as a mode within RedDot.ai rather than a separate top-level feature, though its prompt logic is unchanged. All other prompts/logic below are unchanged from v1.

Every Groq call in the product, specified concretely enough to implement directly. All calls use the OpenAI-compatible Groq endpoint (`https://api.groq.com/openai/v1`), model `llama-3.3-70b-versatile` unless noted.

## Shared safety preamble

Every system prompt below must include this block, verbatim or near-verbatim. This is the single most important guardrail in the entire product — do not let any individual prompt skip it for brevity.

```
You are a wellness information assistant inside a menstrual health tracking app.
You are NOT a doctor and must never provide a diagnosis or tell the user they
"have" a medical condition. You can describe what is commonly associated with
the symptoms/data described, in plain, warm, non-alarming language, and you
should consistently encourage the user to discuss anything concerning with a
qualified healthcare provider. Never use definitive diagnostic language
("you have," "this is," "this means you"). Use exploratory, informational
language instead ("this can sometimes be associated with," "many people
experience this when," "this may be worth mentioning to a doctor").
If the input suggests a possible medical emergency (e.g., severe pain,
heavy bleeding described as dangerous, signs of a serious complication),
clearly and immediately recommend seeking medical care promptly, in addition
to anything else you say.
```

---

## E1 — Conversational health assistant (branded as "RedDot.ai")

> **v2 update:** this feature is now presented to the user as **RedDot.ai**, a named AI surface within the product, with persistent past-chat history and resume (see 06_PAGES_AND_FLOWS.md's "RedDot.ai section" detail). The model/prompt logic below is unchanged; what's new is the chat-history persistence approach in "Output handling" further down — read that section carefully, since it has a real architectural implication.

**Trigger:** user sends a message in the RedDot.ai chat screen.

**Context assembled client-side, sent per-request:**
- The user's message.
- Recent turns from the **current conversation thread** (pulled from decrypted local chat history — see Output handling below — not just the single latest message; include enough of the thread for the model to maintain context within that conversation).
- Last ~30 days of decrypted `DailyEntry` records (from the in-memory app state — see 04_DATA_MODEL.md for the shape), summarized into a compact text block rather than raw JSON dump, to save tokens (Groq free tier TPM budget is limited — see 05_TECH_STACK.md).
- Current `CurrentPhase` info (phase, day within phase, regular/irregular confidence).

**System prompt (in addition to the shared safety preamble above):**
```
You have access to this user's recent self-logged data, summarized below.
Use it to give specific, personalized answers — refer to their actual logged
symptoms, mood, sleep, or cycle phase when relevant, rather than generic
information. If the data doesn't contain enough information to answer
specifically, say so plainly and answer generally instead of guessing.
Keep responses conversational and concise — a few short paragraphs at most,
not an exhaustive report.

User's recent data summary:
{recent_data_summary}

Current cycle phase: {phase}, day {dayWithinPhase} of this phase
(cycle prediction confidence: {confidence})
```

**Example user-facing exchange (for design/demo reference, not literal hardcoded text):**
- User: "Why am I so tired this week?"
- Expected style of response: references the user's actual logged sleep/energy scores and current luteal-phase status if applicable, explains the common hormonal association in plain language, suggests a couple of practical things, and closes with an invitation to mention it to a doctor if it's persistent or severe — never "you are tired because you have X."

**Output handling — chat history persistence (v2, architecturally important):**

The product now supports past-chat history with resume, which means conversations must persist across sessions. To do this **without contradicting the project's core privacy architecture** (03_ARCHITECTURE.md), chat history follows the exact same rule as every other piece of health data in this product:

- Each message (user's and the assistant's) is encrypted client-side and written to a new `chats`/`chat_messages` object store in IndexedDB — same key derivation, same AES-GCM scheme as `entries`/`cycles` (see 04_DATA_MODEL.md for the added schema).
- If cloud sync is enabled, chat history syncs as ciphertext, exactly like cycle/mood data — the server never stores or sees plaintext conversation history at rest, only the live request/response pair during an active exchange.
- The server-side API route remains stateless per-request: it receives the message + thread context + data summary, calls Groq, streams back the response, and persists nothing itself. The client is what writes the exchange into encrypted local storage after receiving the response.
- **Do not build a server-side chats table in Neon that stores plaintext or even a separate-key-encrypted copy of conversations** — this would quietly create a second, differently-secured store of sensitive health conversations and undermine the single-architecture privacy promise. If sync is on, chat ciphertext blobs can live in the same `encrypted_blobs` table as everything else (see 04_DATA_MODEL.md), not a bespoke table with different handling.
- Practical effect for "load and resume an old chat": the client reads and decrypts the relevant thread from IndexedDB, reconstructs the conversation, and resumes sending new messages with that thread's history as context — same as above, just rehydrated from local storage instead of an in-memory session.

---

## E2 — Daily/weekly AI insight card (V1.1)

**Trigger:** generated on dashboard load (or on a schedule, e.g., once per day, cached client-side to avoid redundant calls) once the user has at least one logged cycle.

**Context:** similar recent-data summary as E1, but no user question — this is a proactive generation.

**System prompt (in addition to shared safety preamble):**
```
Generate a short (2-3 sentence) personalized insight card for this user's
dashboard, based on their recent logged data below. It should feel specific
to them, not generic. Reference their actual phase, symptoms, or mood
patterns if there's something genuinely notable; if there isn't anything
notable yet, give a short encouraging note about their tracking consistency
instead of inventing a pattern. Never fabricate a pattern that isn't
supported by the data provided. Warm, plain tone — no medical jargon.

User's recent data summary:
{recent_data_summary}
```

**Important constraint:** explicitly instructing the model not to fabricate a pattern when there isn't one is necessary — this is a known failure mode for "personalized insight" features (generic-feeling output dressed up as personalized). Acceptance criterion from 02_FEATURE_SPEC.md (D4) — different users' real data should produce genuinely different output — depends on this instruction being followed; spot-check this during testing.

---

## E3 — Report/lab analysis (a mode within RedDot.ai)

**Trigger:** user uploads a file on the Report Analysis mode/tab within RedDot.ai, after acknowledging the consent/disclaimer modal.

**Server-side pipeline:**
1. Receive file in the API route handler (in memory, never written to disk).
2. If PDF with extractable text: run `pdf-parse`. If image or scanned PDF: run Tesseract.js OCR.
3. Send extracted text to Groq with the system prompt below.
4. Return the structured response to the client.
5. Discard the file buffer and extracted text from memory; record only a non-PII timestamp event (see `report_analysis_events` table in 04_DATA_MODEL.md) so the client can show the discard confirmation.

**System prompt (in addition to shared safety preamble — this one needs to be the strictest in the product, since lab values carry the most potential for harm if misread as diagnostic):**
```
You will be given extracted text from a user-uploaded lab/blood test report.
Your job is to help the user understand it in plain language — NOT to
diagnose, NOT to tell them what condition they have, and NOT to tell them
what to do medically. Structure your response as:

1. A plain-language summary of what was tested (2-4 sentences).
2. A list of any values that fall outside the report's own stated reference
   range, described neutrally (e.g., "Your TSH level is above the reference
   range listed on this report"), WITHOUT saying what that means medically.
3. A short list of specific questions the user could ask their doctor about
   these results.
4. A closing reminder that this is informational only and not a substitute
   for a conversation with their healthcare provider.

If the extracted text is unclear, incomplete, or doesn't look like a lab
report at all, say so plainly and don't attempt to force an analysis.

Extracted report text:
{extracted_text}
```

**UI requirement tied to this prompt:** the result view (06_PAGES_AND_FLOWS.md, Report Analysis Flow, state 4) should render these four sections distinctly, and flagged values should use the neutral highlight treatment specified in 07_DESIGN_SYSTEM.md — never red/green pass-fail coloring.

---

## E4 — Mood-pattern narrator (stretch)

**Trigger:** user views the Insights page with enough history logged (2+ cycles).

**Context:** longer history window than E1/E2 (e.g., last 2-3 full cycles) summarized into trend-oriented data (averages, deltas) rather than raw daily entries, to keep the prompt compact.

**System prompt (in addition to shared safety preamble):**
```
Summarize the trend in this user's mood, sleep, and symptom data over their
last several logged cycles, in 3-4 plain-language sentences. Focus on real
directional patterns supported by the data (e.g., "your energy has tended
to dip mid-luteal-phase over your last three cycles"). Do not speculate
about causes outside the data provided. If the data is too sparse or
inconsistent to support a confident trend statement, say that plainly
instead of inventing one.

Trend data:
{trend_summary}
```

---

## General guardrails across all four

- **Token efficiency:** always summarize/aggregate data client-side before sending — never dump raw per-entry JSON for 30 days of logs into a prompt. This matters both for cost/rate-limit reasons (05_TECH_STACK.md) and for response quality (shorter, denser context produces better model focus).
- **No server-side conversation/result persistence beyond what's explicitly needed** (the discard-timestamp event for E3; nothing for E1/E2/E4 beyond the single request/response cycle).
- **Every response surface in the UI must carry the "informational, not medical advice" framing visibly** — not just in the system prompt, but as visible UI copy near the AI output (e.g., a small persistent label near the chat input, a closing line on every report analysis result). The system prompt encourages the model to include this, but the UI shouldn't rely on the model remembering every time — bake it into the interface itself as a backstop.
