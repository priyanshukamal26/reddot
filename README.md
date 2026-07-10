# RedDot — Menstrual Cycle Tracker (Private by Design)

RedDot is a local-first, privacy-architecture-first menstrual health and cycle tracking application. It bridges client-side zero-knowledge security with premium visual craft, interactive canvas animations, and secure on-demand AI telemetry analysis.

All health telemetry logged into RedDot is encrypted in the user's browser, stored locally, and remains completely unreadable by third parties—including the host server and database.

---

## 🔒 The Privacy Model & Security Architecture

RedDot is engineered around the principle of absolute cryptographic boundary controls.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Browser Sandbox (IndexedDB/WebCrypto)
    participant Server as Sync Server (Next.js Node runtime)
    participant Database as Database (Neon Postgres)

    User->>Browser: Enter Password & Log Data
    Note over Browser: PBKDF2 Key Derivation (Salt + Password)<br/>Generates AES-GCM-256 Symmetric Key
    Browser->>Browser: Encrypt Plaintext Log via AES-GCM-256
    Browser->>Browser: Write Ciphertext to Local IndexedDB
    Note over Browser: Cloud Sync Triggered (Optional)
    Browser->>Server: Send Ciphertext + Auth Token
    Note over Server: Server validates JWT session (cannot decrypt payload)
    Server->>Database: Write Ciphertext Row
    Note over Database: Data stored encrypted at rest
```

### Cryptographic Foundations
1. **PBKDF2 Key Derivation**: High-entropy symmetric keys are derived in-browser using PBKDF2-HMAC-SHA256, utilizing unique local salt configurations.
2. **AES-GCM-256 Encryption**: Every data payload (cycle dates, symptoms, mood details, flow metrics) is encrypted locally using the Web Crypto API (`SubtleCrypto.encrypt()`).
3. **Zero-Knowledge Cloud Sync**: Users can optionally turn on Cloud Backup. Synchronization only transmits the encrypted ciphertext payload. The database storage only holds encrypted strings; plaintext keys never cross the network boundary.
4. **Session Key Isolation**: Encryption keys are cached temporarily in isolated `sessionStorage` during a logged-in session and cleared immediately upon logout or window closure.

---

## ✨ Features & Design Language

RedDot adapts an Awwwards-grade visual style for an intimate daily utility.

- **The "Void" Dark Aesthetic**: Stays consistently dark throughout the authenticated application using a deep black (`#0A0A0A`) and brand signal-red (`#E01028`) palette.
- **The "Core Dot" Motif**: A breathing 8px indicator acts as status feedback, thinking indicators for the AI engine, custom cursor focal points, and user avatars.
- **Animated Phase Ring**: A continuous gradient-ramp ring dynamically drawn on a canvas, sweeping from Menstrual (Signal Red) → Follicular (Muted Grey) → Ovulation (White Glow) → Luteal (Crimson Black). Progress draws in smoothly on mount via GSAP.
- **RedDot.ai Assistant**: Conversational health logging, symptom pattern analysis, and lab report translation. Queries stream through single-use request tokens and are never persisted on the server.
- **Searchable Know Hub**: An educational dashboard of cycle guides and resources featuring active indicators matching the user's current cycle phase.

---

## 🛠️ Technology Stack

* **Frontend Framework**: Next.js 15+ (App Router, Turbopack, React Server Components)
* **Styling**: Tailwind CSS v4, Vanilla CSS variables, and PostCSS integrations
* **Motion & Custom Controls**: GSAP (GreenSock Animation Platform) and Lenis (Smooth Scroll)
* **Storage Layer**: IndexedDB (Local DB) with a PostgreSQL (Neon) remote ciphertext sync backup
* **AI Processing**: Groq Llama-3-70B API
* **Cryptography**: Web Crypto API (SubtleCrypto)

---

## 📂 Directory Layout

```
├── docs/                      # Architectural specs & design guides
├── public/                    # Compiled assets & static image resources
├── src/
│   ├── app/                   # App Router pages and API routes
│   │   ├── dashboard/         # Authenticated layouts, logs, metrics, & Know Hub
│   │   ├── login/ & signup/   # Auth pages wrapped in breathing core-orbs
│   │   ├── api/               # API endpoint route handlers (sync, auth, AI)
│   ├── components/            # UI components
│   │   ├── ai/                # Chat layout, browser chrome, & message panels
│   │   ├── layout/            # CoreDot, CursorAndGrain, & DecryptReveal
│   │   ├── nav/               # PillNav & ProfilePopup backup control
│   │   ├── tracking/          # PhaseRing canvas renderers & DayDetail panels
│   ├── context/               # AuthContext managing key generation/persistence
│   ├── lib/                   # Utility scripts
│   │   ├── articles.ts        # Know Hub guide catalog
│   │   ├── crypto.ts          # SubtleCrypto helper routines
│   │   ├── cycle.ts           # Menstrual calculators and predictions
│   │   ├── data.ts            # IndexedDB read/write wrappers
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database Settings (Optional - Omitting transparently falls back to local IndexedDB sandbox)
DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"

# NextAuth Token Configuration
NEXTAUTH_SECRET="your-generated-random-32-byte-hex-string"
NEXTAUTH_URL="http://localhost:3000"

# AI Inference Key
GROQ_API_KEY="gsk_..."
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Running Locally (Development Server)
Launch the Turbopack dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Seeding Demo Data
To explore the dashboard immediately with dummy records:
1. Log in or sign up.
2. Go to **Encrypted Backup** inside your profile dropdown, or navigate to Settings.
3. Click **Generate 90-Day Demo History** to seed logs into your browser's IndexedDB.

---

## ⚡ Build & Verification

To verify typescript safety and build a production-ready package:

```bash
# Formats and bundles code for deployment
npm run build

# Runs development web server over production build
npm run start
```

---

## ⚖️ Non-Diagnostic Compliance Notice

RedDot.ai is strictly an informational tool. It does not provide medical advice, diagnosis, or treatment. It is not intended to replace professional medical evaluations. All encryption metrics and data storage boundaries are explicitly disclosed in our transparency guidelines.
