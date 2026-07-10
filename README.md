RedDot is a privacy-architecture-first menstrual health web app. All health
data is encrypted client-side (AES-GCM-256, key derived from your password
via PBKDF2) and stored in IndexedDB. Cloud sync is optional and ciphertext-
only — the server can never read your data. The AI features (RedDot.ai)
provide conversational health assistance and plain-language lab report
interpretation, with a strict non-diagnostic safety framework. Built with
Next.js, Neon (Postgres), Groq API, and Web Crypto API. Designed with a
bold red/white/black palette aimed at Awwwards-level frontend craft on the
landing page and fast, disciplined UX in the daily-use product.

Stack: Next.js · Vercel · Neon · Groq · IndexedDB · Web Crypto API · GSAP/Lenis


-------------------------------------------------------------------
