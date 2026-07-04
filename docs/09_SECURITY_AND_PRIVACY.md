# 09 — Security, Privacy & Legal

## Threat model (what this architecture is, and isn't, defending against)

**Defends well against:**
- A compromised or subpoenaed database (Neon) yielding readable health data — synced data is ciphertext the operator cannot decrypt.
- Third-party ad/analytics SDKs harvesting health data — there are none in this product, by design (see Product Principles below).
- A user's device being lost/stolen and IndexedDB being inspected — data is encrypted at rest.

**Does NOT fully defend against:**
- A compromised user device while the app is actively open (data is plaintext in memory during use — this is true of essentially any app and is an accepted, normal limitation).
- Legal compulsion directed at the user themselves, rather than the data operator (no architecture can prevent someone from being asked to unlock their own device).
- The Groq API's own data handling during the brief window a request is being processed (see the disclosure note in 03_ARCHITECTURE.md — this should be linked to Groq's actual data retention policy in the Privacy page rather than the product making claims on Groq's behalf).
- A user who chooses cloud sync but loses/forgets their password (see password-reset trade-off below) — this is a usability/recovery limitation, not a security flaw, but it should be communicated honestly.

State this honestly if asked in a demo Q&A. Overclaiming ("fully unhackable," "zero-knowledge end-to-end always") would be both inaccurate and risky to claim publicly about a health product — be precise about what's actually true.

## Encryption summary (full detail in 04_DATA_MODEL.md)

- Key derived from the account password via PBKDF2 (SHA-256, 100,000+ iterations, per-user salt).
- AES-GCM 256-bit for all encrypted entries, random IV per record.
- Sync blobs to Neon are encrypted client-side before transmission; the server only ever stores/transmits ciphertext.

## The password-reset trade-off (must be communicated, not hidden)

Because the encryption key is derived from the account password (a deliberate simplicity choice for MVP — see prior project decisions), **resetting the password makes previously encrypted local/synced data unreadable with the new password.** This is a real, known limitation, not a bug to quietly patch around under time pressure. It's handled product-side via:

- A clear warning shown before password reset proceeds, if local data exists (06_PAGES_AND_FLOWS.md, Password Reset Flow).
- The export/backup feature existing specifically so this scenario has a real escape hatch.
- Honest copy: "Resetting your password will make your current encrypted data unreadable. Export a backup first if you want to keep it." — not vague, not buried in fine print.

If there's ever time for a V2 improvement: re-encrypting the data with a new key at the moment of reset, while the old key is still in memory during an active session, would close this gap. Document it as a known follow-up rather than silently promising it's already solved.

## Mandatory legal/safety disclaimers — where each one must appear

| Disclaimer | Must appear |
|---|---|
| "Not a substitute for professional medical advice; not a diagnosis" | AI Assistant first-use modal (#28), every report analysis result (E3 output), Report Upload consent modal (#26), Privacy page |
| "Your report file is processed in memory and discarded immediately after analysis — never stored" | Report Upload page (before upload), Report Upload consent modal (#26), Report Analysis result screen (discard confirmation #27) |
| "Cloud sync sends encrypted data we cannot read; the AI assistant and report analysis features send relevant data to Groq's API to generate a response" | Privacy page (B7) — this is the one place plaintext-to-third-party honesty must be unambiguous, per the note in 03_ARCHITECTURE.md |
| "Resetting your password will make existing local data unreadable" | Password reset flow, before submission |
| "If you are experiencing a medical emergency, contact emergency services or a healthcare provider immediately" | AI Assistant first-use modal, report analysis result screen footer |

## Product principles (state these on the Privacy page explicitly, as commitments)

- No third-party advertising SDKs.
- No third-party analytics SDKs that track individual user behavior for advertising/profiling purposes.
- No selling or sharing of health data with third parties, ever.
- Local-first by default; cloud sync is opt-in, not opt-out.
- Full data export and full data deletion are always available and always actually work (don't ship a "delete account" that silently retains data — if this is the claim, the delete-account implementation must actually cascade-delete everything in Neon, per the schema's `ON DELETE CASCADE` constraints in 04_DATA_MODEL.md).

## Regulatory framing (informational note, not legal advice)

This product is not currently positioned as a HIPAA-covered entity (HIPAA generally applies to healthcare providers, insurers, and their business associates, not general consumer wellness apps) — but the architecture is deliberately stricter than most consumer health apps' actual practices regardless, which is the honest selling point. If this project were ever taken past hackathon stage toward a real product, a real privacy policy reviewed by an actual lawyer (not this document) would be needed before launch, particularly regarding state-level health data privacy laws (e.g., Washington's My Health My Data Act and similar laws emerging in other US states) and GDPR if serving EU users. This document and the in-app copy are a good-faith, hackathon-stage approximation, not a substitute for real legal review.
