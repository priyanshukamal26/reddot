# RedDot — Menstrual Cycle Tracker & Community (Private by Design)

> **Absolute Privacy. Premium Aesthetics. Zero-Knowledge Intelligence.**

RedDot is an Awwwards-grade, local-first menstrual health tracker and community platform built to bridge client-side zero-knowledge cryptography with top-tier visual craft. Engineered with a striking custom dark interface, scroll-driven canvas animations, and secure on-demand AI telemetry analysis, RedDot guarantees your intimate data remains yours.

All health metrics, symptoms, moods, and discussion comments logged into RedDot are encrypted in your browser, stored locally in IndexedDB, and remain completely unreadable by third parties—including the host server and database.

---

## 📖 Table of Contents
1. [🔒 The Privacy Model & Security Architecture](#-the-privacy-model--security-architecture)
2. [✨ Features & Modules](#-features--modules)
   - [RedDot.ai Conversational Assistant](#reddotai-conversational-assistant)
   - [RedConnect Social & Discussions Hub](#redconnect-social--discussions-hub)
   - [Animated Phase Ring & Heatmaps](#animated-phase-ring--heatmaps)
   - [Searchable Know Hub](#searchable-know-hub)
3. [🎨 Design System & Micro-Animations](#-design-system--micro-animations)
4. [🛠️ Technology Stack](#-technology-stack)
5. [📂 Directory Layout](#-directory-layout)
6. [🚀 Getting Started](#-getting-started)
7. [⚡ Build & Verification](#-build--verification)
8. [⚖️ Compliance & Compliance Notice](#-compliance--compliance-notice)

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
1. **PBKDF2 Key Derivation**: Symmetric keys are derived locally in-browser using `PBKDF2-HMAC-SHA256` from the user's password, utilizing unique local salts.
2. **AES-GCM-256 Encryption**: Every data payload (cycle dates, symptoms, mood details, flow metrics, past chat histories) is encrypted locally using the Web Crypto API (`SubtleCrypto.encrypt()`) before being written to IndexedDB.
3. **Zero-Knowledge Cloud Sync**: Synchronization is entirely optional. When turned on, only the encrypted ciphertext payload and IV (Initialization Vector) are transmitted. The database only holds encrypted strings; plaintext keys never cross the network.
4. **Session Key Isolation**: Encryption keys are cached temporarily in isolated `sessionStorage` during a logged-in session and cleared immediately upon logout or window closure.

---

## ✨ Features & Modules

### RedDot.ai Conversational Assistant
An on-demand private health assistant that reads your local, decrypted telemetry to offer personalized advice.
* **Structured Response Layout**: The assistant responds in a highly readable cards-and-points layout, complete with markdown category headers, bold highlights, and bulleted lists rather than walls of prose.
* **Local-First Chat History**: Past conversations are encrypted client-side using `AES-GCM-256` and saved to IndexedDB, supporting sync, resume, and chat deletion to prevent list clutter.
* **Automatic Title Summarization**: When starting a chat, a secondary, lightweight prompt summarizes your first question into a short, descriptive 2-4 word heading.
* **Medical Lab Report OCR Scanner**: Upload PDF or image lab reports (blood panels, hormones). Text is parsed in-memory, summarized, and instantly discarded—with a visible deletion timestamp.

### RedConnect Social & Discussions Hub
A mini Reddit-style platform designed for pseudonymous, private discussions.
* **Global Search Bar**: Search posts and usernames in real-time from the database across Saved, Own, and Global scopes, with instant loading feedback and empty states.
* **Tabbed Navigation & Interactivity**: Easily switch feeds, publish posts with categories (`query`, `experience`, `suggestion`, `general`), like discussions, bookmark posts, and participate in nested threaded replies.

### Animated Phase Ring & Heatmaps
* **Animated Phase Ring**: A continuous gradient-ramp ring dynamically drawn on a canvas using GSAP, sweeping from Menstrual (Signal Red) → Follicular (Muted Grey) → Ovulation (White Glow) → Luteal (Crimson Black).
* **GitHub-Style Contribution Heatmap**: A contribution calendar where each cell represents a logged day. Color intensity maps to flow and symptom severity over time.

### Searchable Know Hub
An educational database of articles and guides, complete with a search bar and active indicators matching your current cycle phase.

---

## 🎨 Design System & Micro-Animations

RedDot uses a high-fidelity visual palette tailored for smooth interaction:
* **The "Void" Dark Theme**: Dark-mode primary layout (`#0A0A0A` background) paired with brand signal-red (`#E51D38`).
* **The "Core Dot" Motif**: A breathing status dot representing system status, loading states, custom cursor focal points, and user avatars.
* **Smooth Scrolling**: Lenis integration for comfortable page navigation.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15+ (App Router, Turbopack, React Server Components)
* **Styling**: Tailwind CSS v4, Vanilla CSS variables, and PostCSS
* **Motion**: GSAP (GreenSock Animation Platform) and Lenis (Smooth Scroll)
* **Storage**: IndexedDB (Local DB) with Neon PostgreSQL (remote sync)
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
* **Node.js**: `v18.x` or higher
* **npm** or **yarn**

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

## ⚖️ Compliance & Compliance Notice

RedDot.ai is strictly an informational tool. It does not provide medical advice, diagnosis, or treatment. It is not intended to replace professional medical evaluations. All encryption metrics and data storage boundaries are explicitly disclosed in our transparency guidelines.
