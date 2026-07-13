![NAMESPACE THIS PROJECT IS A SUBMISSION FOR HACKHAZARDS 2026](public/assets/images/hh26_main_poster.png)

# 🚀 Project Title
**RedDot** — A local-first, zero-knowledge menstrual health tracker and community platform securing reproductive telemetry through client-side cryptography.

---

# 📌 Problem & Domain
Most popular menstrual tracking applications treat highly sensitive reproductive health logs as commercial assets. These platforms store user logs in plaintext on centralized servers, frequently sharing or selling them to advertising networks for profiling. Furthermore, in regions with restrictive health regulations, plaintext reproductive logs have transitioned from simple tracking utilities into significant legal liabilities for users.

### Themes Selected:
- [ ] Human Experience & Productivity
- [ ] Climate & Sustainability Systems
- [x] HealthTech & Bio Platforms
- [ ] Learning & Knowledge Systems
- [ ] Work, Finance & Digital Economy
- [ ] Infrastructure, Mobility & Smart Systems
- [ ] Trust, Identity & Security
- [ ] Media, Social & Interactive Platforms
- [ ] Public Systems, Governance and Civic Tech
- [ ] Developer Tools & Software Infrastructure

---

# 🎯 Objective
What problem does your project solve, and who does it serve?

* **The Target Users**: Individuals tracking their menstrual cycles, symptom histories, and hormonal panels who require high-fidelity health predictions without sacrificing their personal privacy.
* **The Pain Point**: The monetization and legal exposure of cycle calendars, mood logs, and clinical panel details on standard tracking systems that lack cryptographic boundaries.
* **The Value Your Solution Provides**: Enforces absolute reproductive data sovereignty. By executing PBKDF2-HMAC-SHA256 key derivation and AES-GCM-256 encryption in the browser sandbox, RedDot ensures all health telemetry remains completely unreadable to third parties—including the host server and database.

---

# 🧠 Team & Approach

### Team Name: **Supernova**

### Team Members:
* **Priyanshu Kamal**: [GitHub Profile](https://github.com/priyanshukamal26) / [LinkedIn Profile](https://www.linkedin.com/in/priyanshukamal/) / FullStack Developer
* **Shambhavi Nayak**: [GitHub Profile](https://github.com/Sham28-learner) / [LinkedIn Profile](https://www.linkedin.com/in/shambhavi-nayak/) / FullStack Developer

### Our Approach:
* **Why we chose this problem**: Reproductive health telemetry is among the most intimate forms of personal data. Restoring absolute user autonomy by shifting from policy-based promises to client-side cryptographic constraints is a crucial step in defending health privacy.
* **Key challenges addressed**:
  1. **Consistent Cryptographic Serialization**: Seamlessly encrypting and decrypting complex object trees (cycles, daily logs, and chat histories) to and from local IndexedDB without blocking the browser thread.
  2. **Stateless AI Telemetry**: Designing an AI assistant (RedDot.ai) that queries decrypted local data in-memory without storing logs on the host server.
  3. **Stacking Context Isolation**: Correcting CSS layout properties to ensure high-security overlay modals (like daily logging and comment drawers) stack on top of global layout elements.
* **Breakthroughs**: Completing an onboarding flow that generates a matching `DailyEntry` alongside the `Cycle` record, ensuring local database calculations remain fully consistent and preventing auto-deletion of onboarding data.

---

# 🛠️ Tech Stack

### Core Technologies Used:
* **Frontend**: Next.js 15+ (App Router, Turbopack, React Server Components)
* **Backend**: Serverless API routes (Next.js Node runtime)
* **Database**: Neon serverless PostgreSQL (for encrypted sync backup)
* **APIs**: Groq API (Llama-3.3-70B model)
* **Hosting / Client DB**: Local IndexedDB wrapper (primary client-side database)

### Additional Technologies Selected:
- [x] AI / ML
- [ ] Web3 / Blockchain
- [ ] Cyber Security
- [ ] Cloud
- [ ] Developer Tools & Software Infrastructure

---

# ✨ Key Features

### 1. Client-Side Cryptographic Boundaries
All daily logs, symptom selections, mood entries, and past AI chat histories are encrypted using **AES-GCM-256** and **PBKDF2-HMAC-SHA256** inside the browser sandbox before being committed to IndexedDB or Neon.

### 2. RedDot.ai Assistant & Lab Report Analyzer
An on-demand private health assistant that reads your local, decrypted telemetry to offer structured insights. Features a private PDF/image lab report analyzer that extracts data in-memory and immediately deletes files, displaying a verified timestamp of deletion.

### 3. RedConnect pseudonymous Social Hub
A secure, integrated social forum for pseudonymous health discussions. Includes a global search bar, likes, bookmarks, and nested threaded replies.

### 4. Irregular-Cycle Predictions
Automatically adjusts prediction algorithms when log variances are detected, outputting logical confidence ranges instead of false-precise dates.

---

# 📽️ Demo & Deliverables
* **Demo Video Link**: `https://drive.google.com/drive/folders/1-yFzY_ziEZwBkSSFRS0eBZFHKH6VUuHr?usp=sharing`
* **Deployment Link**: `https://reddot-xi.vercel.app/`
* **Pitch Deck / PPT**: `https://drive.google.com/drive/folders/18ynmyxPb38t5rQUPK1DysQJsYQkmBLi0?usp=sharing`

---

# ✅ Tasks & Bonus Checklist
- [x] All team members completed the mandatory social task
- [x] Bonus Task 1 – Badge sharing
- [x] Bonus Task 2 – Blog/article

---

# 🧪 How to Run the Project

### Requirements:
* **Node.js**: `v18.x` or higher
* **npm** or **yarn**
* **Groq API Key** (for RedDot.ai features)
* **Neon PostgreSQL Connection String** (Optional - defaults to local IndexedDB sandbox if empty)

### Environment Setup:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your-32-byte-hex-string"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_..."
```

### Local Setup:
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Build the production package and launch the server:
   ```bash
   npm run build
   npm run start
   ```
3. Open `http://localhost:3000` to access the application. Go to **Settings** and click **Generate 90-Day Demo History** to seed logs.

---

# 🧬 Future Scope
* **Sovereign Partner Share Links**: Secure, revocable read-only summary sharing using unique key exchanges.
* **Offline-First Cryptographic Queue**: Full offline caching of logs with automatic sync on reconnection.
* **Clinical Care Prompt Alerts**: Symptom patterns (e.g. heavy flow) automatically trigger care prompts.

---

# 📎 Resources / Credits
* **Web Cryptography API**: Supported by modern browser runtimes for AES-GCM and PBKDF2.
* **Groq Llama-3.3**: Used for stateless inference.
* **Neon Serverless Postgres**: Encrypted remote relational database.
* **Next.js & React**: Core application components.

---

# 🏁 Final Words
Building RedDot during HackHazards '26 challenged us to rethink privacy from the browser sandbox up. Overcoming challenges with asynchronous client-side database synchronization and ensuring absolute confidentiality taught us that secure architectures are highly compatible with beautiful user experiences. Special thanks to the judges and team members!
