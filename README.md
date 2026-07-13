# RedDot — Privacy-First Menstrual Health Tracker & Community

RedDot is a local-first, zero-knowledge menstrual health tracking and community platform. It is built to address real-world privacy concerns surrounding sensitive reproductive health telemetry by enforcing strict cryptographic boundaries. By keeping data encrypted client-side, RedDot ensures that users retain absolute sovereignty over their health logs, shielding them from third-party tracking, advertising profiling, and database breaches.

Plaintext data—including cycle dates, symptoms, mood details, chat histories, and community replies—never crosses the network.

---

## 🔒 Security Architecture & Cryptographic Verification

RedDot isolates all sensitive user data inside the client-side browser sandbox. The backend infrastructure functions purely as an optional, zero-knowledge backup and synchronization system.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Browser Sandbox (IndexedDB/WebCrypto)
    participant Server as Sync Server (Next.js Node runtime)
    participant Database as Database (Neon Postgres)

    User->>Browser: Input credentials & log data
    Note over Browser: PBKDF2 Key Derivation (Password + Local Salt)<br/>Generates AES-GCM-256 Symmetric Key
    Browser->>Browser: Encrypt plaintext log payload via AES-GCM-256
    Browser->>Browser: Save ciphertext to local IndexedDB
    Note over Browser: If Cloud Sync is enabled
    Browser->>Server: Transmit encrypted ciphertext & auth token
    Note over Server: Server validates JWT session (payload remains encrypted)
    Server->>Database: Write ciphertext record to table
    Note over Database: Data stored encrypted at rest (plaintext keys never transmit)
```

### Cryptographic Details
* **Key Derivation (PBKDF2)**: Symmetric encryption keys are derived inside the browser sandbox using PBKDF2-HMAC-SHA256 from the user's password and a unique cryptographic salt stored in local metadata.
* **Symmetric Encryption (AES-GCM-256)**: All user inputs (daily symptoms, mood logs, journal texts, and AI chat threads) are encrypted using AES-GCM-256 via the browser's Web Crypto API (`SubtleCrypto`).
* **Sovereign Cloud Synchronization**: Users can toggle encrypted backup. The sync process uploads only ciphertext payloads and initialization vectors (IVs). The host database never stores or has access to decryption keys.
* **In-Memory Session Isolation**: The derived decryption key is cached only in `sessionStorage` during active sessions. It is permanently cleared upon logging out or closing the browser tab.

---

## 🛠️ System Modules & Features

### 1. Cycle Tracking & Phase Prediction
* **Daily Logging**: Track period dates, flow intensity, mood scales, sleep hours, exercise metrics, and physical symptom chips.
* **Phase Estimation**: Calculates and visualizes the menstrual cycle's four distinct phases (Menstrual, Follicular, Ovulation, Luteal).
* **Irregular-Cycle Prediction**: Automatically adjusts prediction algorithms when log variances are detected, outputting logical confidence ranges instead of false-precise dates.
* **Symptom Heatmaps**: A chronological tracking grid showing symptom density and cycle patterns over time.
* **Log Date Guard**: Prevents logging data for future dates to maintain database integrity.

### 2. RedDot.ai — Secure AI Assistant
* **Contextual Health Assistant**: Queries the user's recent, decrypted local logs in-memory to provide relevant, private cycle observations.
* **Structured Information Output**: Formats recommendations and observations using structured markdown categories and bolded list points for readability.
* **Local-First Chat History**: Past conversation threads are encrypted client-side and saved in local storage. Features include past-chat deletion and automatic title generation based on the initial question.
* **Lab Report Analyzer**: Uploads and processes blood tests or hormone panels in-memory. The text is parsed, summarized, and instantly deleted from server memory, showing a verified deletion timestamp.

### 3. RedConnect — Pseudonymous Social Hub
* **Pseudonymous Board**: A secure forum for queries, suggestions, and health experiences.
* **Global Search**: Instantly filters posts and usernames across Global, Saved, and Personal scopes using optimized database queries, featuring loading spinners and clean empty states.
* **Interactivity**: Support for nested replies, likes, and saved bookmarks synced to user accounts.

### 4. Know Hub
* **Educational Library**: Medical disclaimed articles and guides organized by cycle phases, allowing users to read about physiological changes matching their current cycle status.

---

## 💻 Tech Stack

* **Core Framework**: Next.js 15+ (App Router, Turbopack, React Server Components)
* **Styling & Layout**: Tailwind CSS v4, PostCSS, and Vanilla CSS
* **Animations**: GSAP (GreenSock) & Lenis (Smooth Scroll)
* **Storage**: IndexedDB (local database) & Neon PostgreSQL (encrypted backup)
* **Inference**: Groq (Llama 3.3 70B API)
* **Encryption**: Web Crypto API (SubtleCrypto)

---

## 📂 Project Directory Structure

```
├── docs/                      # Technical specifications & design references
├── public/                    # Static assets & compiled images
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── dashboard/         # Dashboard pages, logs, and educational resources
│   │   ├── login/ & signup/   # Authentication forms
│   │   ├── api/               # Serverless API routes (sync, RedConnect, AI telemetry)
│   ├── components/            # React UI components
│   │   ├── ai/                # Chat panels & report uploads
│   │   ├── layout/            # Visual layout shells & global footer
│   │   ├── nav/               # Top navbar & profile controls
│   │   ├── tracking/          # Cycle calendar renderers & phase visualizations
│   ├── context/               # AuthContext managing PBKDF2 key generation
│   ├── lib/                   # Utility libraries & cryptography wrappers
│   │   ├── crypto.ts          # Web Crypto AES-GCM and PBKDF2 helper functions
│   │   ├── cycle.ts           # Cycle calculations & phase predictions
│   │   ├── data.ts            # IndexedDB read/write routines
```

---

## 🚀 Installation & Local Deployment

### 1. Prerequisites
* **Node.js**: `v18.x` or higher
* **npm** or **yarn**

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# PostgreSQL Connection (Optional - defaults to client-side IndexedDB sandbox if empty)
DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-32-byte-hex-string"
NEXTAUTH_URL="http://localhost:3000"

# Groq API Key
GROQ_API_KEY="gsk_..."
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application locally.

### 5. Seed Test Data
1. Sign up or log into a test account.
2. Go to **Settings** or click the profile dropdown menu.
3. Select **Generate 90-Day Demo History** to populate dummy logs directly into your browser's IndexedDB.

---

## ⚡ Production Verification

To build and compile the application for deployment:

```bash
# Compile and optimize for production
npm run build

# Start production server
npm run start
```

---

## ⚖️ Non-Diagnostic Compliance Notice

RedDot and RedDot.ai are strictly informational resources. They do not provide diagnostic advice, medical treatments, or prescriptive care. Users must never substitute RedDot.ai outputs for professional medical evaluations. All encryption structures and data handling policies are outlined transparently in our security documentation.
