<p align="center">
  <img src="https://img.shields.io/badge/⚖️-Nyayadarsi-1a237e?style=for-the-badge&labelColor=0a0e3d" alt="Nyayadarsi" />
</p>

<h1 align="center">Nyayadarsi — AI-Powered Procurement Justice</h1>
<h3 align="center">न्यायदर्शी — One who sees justice</h3>

<p align="center">
  <em>AI that makes government procurement corruption visible at the moment it is attempted — before any money moves.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PAN_IIT-AI_for_Bharat-FF6F00?style=flat-square" alt="PAN IIT" />
  <img src="https://img.shields.io/badge/Theme_3-CRPF_Tender_Evaluation-1a237e?style=flat-square" alt="Theme 3" />
  <img src="https://img.shields.io/badge/Team-Coding_Aghoris-6366f1?style=flat-square" alt="Team" />
  <img src="https://img.shields.io/badge/Finale-May_16_2026-10b981?style=flat-square" alt="Finale" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Python_3.13-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
</p>

---

## 📌 The Problem

Indian government procurement corruption enters at **five specific points**. Nyayadarsi closes all five.

| # | Corruption Point | How It Works | Nyayadarsi's Response |
|---|------------------|--------------|----------------------|
| 1 | **L1 Trap** | Tender criteria engineered so only one vendor qualifies | Real-time **Integrity Alerts** before tender publication |
| 2 | **Document Fraud** | Forged certificates pass manual evaluation | AI-powered **document verification** with GREEN/YELLOW/RED verdicts |
| 3 | **Cartel Bidding** | Shell companies simulate competition with near-identical bids | **Collusion Risk Engine** — bid clustering, CA fingerprint, address overlap |
| 4 | **Ghost Work** | Bills cleared for work never completed | **GPS-verified** daily uploads with AI progress estimation |
| 5 | **Payment Extortion** | Commissions extracted at every payment stage | **72-hour auto-release** — zero officer timing discretion |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend Layer (Next.js 14 + Tailwind CSS)"]
        D1["📋 Dashboard 1<br/>Gov Officer<br/>Create Tender"]
        D2["🛡️ Dashboard 2<br/>Evaluation Officer<br/>Review Bids"]
        D3["🏗️ Dashboard 3<br/>Builder<br/>Progress Monitoring"]
    end

    subgraph API["🌐 FastAPI Backend (Python 3.13)"]
        direction TB
        subgraph Routes["API Routes (16 Endpoints)"]
            R1["tender.py<br/>Upload / Integrity / Status"]
            R2["evaluation.py<br/>Results / Yellow Queue / Decision"]
            R3["collusion.py<br/>Run Scan / Report"]
            R4["builder.py<br/>Upload / Milestones / GPS"]
            R5["payment.py<br/>72h Auto-Release"]
            R6["audit.py<br/>Trail / Export PDF"]
        end

        subgraph Engines["Core Engines"]
            AI["🤖 AI Engine<br/>Gemini 1.5 Flash<br/>Groq Llama 3 Fallback"]
            COL["🛡️ Collusion Engine<br/>Bid Clustering (scipy)<br/>CA Fingerprint<br/>Address / Ownership / DocQuality"]
            AUD["🔐 Audit System<br/>SHA-256 Logger<br/>PDF Exporter (ReportLab)"]
        end

        subgraph Utils["Utility Modules"]
            PDF["📄 PDF Reader<br/>pdfplumber + PyMuPDF"]
            GPS["📍 GPS Verifier<br/>Haversine Formula"]
            FH["📁 File Handler<br/>SHA-256 Validation"]
        end
    end

    subgraph Data["💾 Data Layer"]
        DB[("SQLite (WAL Mode)<br/>Append-Only Audit Log")]
        MOCK["📊 Demo Data<br/>JSON Mock Files"]
    end

    D1 -->|"POST /api/tender/upload"| R1
    D2 -->|"GET /api/evaluation"| R2
    D3 -->|"POST /api/builder/upload"| R4
    D2 -->|"POST /api/collusion/run"| R3
    D3 -->|"POST /api/payment/trigger"| R5
    D1 -->|"GET /api/audit/trail"| R6

    R1 --> AI
    R1 --> PDF
    R2 --> AUD
    R3 --> COL
    R4 --> GPS
    R4 --> FH
    R5 --> AUD
    R6 --> AUD

    AI --> DB
    COL --> DB
    AUD --> DB
    R2 --> MOCK

    style Frontend fill:#1a237e,stroke:#6366f1,color:#fff
    style API fill:#0f1555,stroke:#4338ca,color:#fff
    style Data fill:#0a0e3d,stroke:#818cf8,color:#fff
    style AI fill:#4338ca,stroke:#818cf8,color:#fff
    style COL fill:#e65100,stroke:#ff9800,color:#fff
    style AUD fill:#1b5e20,stroke:#4caf50,color:#fff
```

---

## 🔄 Core Workflows

### Flow 1 — Tender Upload → AI Extraction → Integrity Alerts

```mermaid
flowchart TD
    A["📤 Officer Uploads<br/>Tender PDF"] --> B["📄 pdf_reader.py<br/>Extract Text"]
    B --> C{"Text<br/>Extracted?"}
    C -->|No| D["❌ Error 422<br/>Scanned/Corrupted PDF"]
    C -->|Yes| E["🤖 criteria_extractor.py<br/>Send to Gemini 1.5 Flash"]
    E --> F{"Gemini<br/>Available?"}
    F -->|Yes| G["✅ Parse JSON<br/>Validate Schema"]
    F -->|No / Rate Limited| H["🔄 Fallback to<br/>Groq Llama 3"]
    H --> G
    G --> I["🚨 integrity_alert.py<br/>Run 3 Checks"]
    I --> J["Check 1: Brand/Model<br/>Name Detection"]
    I --> K["Check 2: Year Range<br/>Narrower than 5 Years?"]
    I --> L["Check 3: Threshold<br/>Above 3x Baseline?"]
    J & K & L --> M{"Any Alert<br/>Triggered?"}
    M -->|Yes| N["🔴 Integrity Alert<br/>Est. Qualifying Vendors ≤ 3"]
    M -->|No| O["🟢 Criteria Clean"]
    N & O --> P["🔐 sha256_logger.py<br/>Create Audit Record"]
    P --> Q["📊 Response:<br/>criteria[] + alerts[] + doc_hash"]

    style A fill:#1a237e,stroke:#6366f1,color:#fff
    style E fill:#4338ca,stroke:#818cf8,color:#fff
    style N fill:#c62828,stroke:#ef5350,color:#fff
    style O fill:#1b5e20,stroke:#4caf50,color:#fff
    style P fill:#1b5e20,stroke:#66bb6a,color:#fff
```

### Flow 2 — Bidder Evaluation → Officer Decision → Audit

```mermaid
flowchart TD
    A["📊 Load Evaluation<br/>Results (Mock JSON)"] --> B["🔍 Per-Criterion<br/>Verdict Assignment"]
    B --> C["🟢 GREEN<br/>Evidence meets threshold<br/>Full citation provided"]
    B --> D["🔴 RED<br/>Document missing or<br/>value falls short"]
    B --> E["🟡 YELLOW<br/>Ambiguity detected<br/>Needs human review"]

    E --> F["📋 Yellow Queue<br/>Sort: Blocker → Mandatory → Low Confidence"]
    F --> G["👤 Officer Reviews<br/>Sees ambiguity + source doc + confidence"]
    G --> H["✍️ Types Mandatory<br/>Reason (min 10 chars)"]
    H --> I{"Decision"}
    I -->|PASS| J["✅ Criterion Passed<br/>With Officer Justification"]
    I -->|FAIL| K["❌ Bidder Excluded<br/>With Full Citation Trail"]
    J & K --> L["🔐 sha256_logger.py<br/>officer_id + decision + SHA-256"]
    L --> M["🎯 Frontend Shows<br/>Green ✓ + Audit Hash"]

    style C fill:#1b5e20,stroke:#4caf50,color:#fff
    style D fill:#c62828,stroke:#ef5350,color:#fff
    style E fill:#e65100,stroke:#ff9800,color:#fff
    style L fill:#1b5e20,stroke:#66bb6a,color:#fff
```

### Flow 3 — Builder GPS Upload → Accept / Reject

```mermaid
flowchart TD
    A["📱 Builder Takes<br/>Geotagged Photo"] --> B["📍 Capture GPS<br/>Coordinates"]
    B --> C["📤 Submit to<br/>POST /api/builder/upload"]
    C --> D["🧮 gps_verifier.py<br/>Haversine Distance Calc"]
    D --> E{"Distance ≤<br/>100 meters?"}

    E -->|"✅ Yes"| F["📦 Store Upload<br/>+ Photo Metadata"]
    F --> G["🔐 Audit Log<br/>UPLOAD_ACCEPTED"]
    G --> H["✅ Response:<br/>accepted + distance + audit_hash"]

    E -->|"❌ No"| I["🔐 Audit Log<br/>UPLOAD_REJECTED_GPS"]
    I --> J["❌ HTTP 400<br/>Rejection Reason + Distance"]

    H --> K["📊 Update Milestone<br/>Progress Tracker"]
    K --> L{"AI Verified +<br/>Officer Confirmed?"}
    L -->|Yes| M["💰 Payment Auto-Release<br/>72 Hours, No Discretion"]
    L -->|No| N["🔒 Payment Locked<br/>Awaiting Verification"]

    style A fill:#1a237e,stroke:#6366f1,color:#fff
    style D fill:#4338ca,stroke:#818cf8,color:#fff
    style F fill:#1b5e20,stroke:#4caf50,color:#fff
    style J fill:#c62828,stroke:#ef5350,color:#fff
    style M fill:#1b5e20,stroke:#66bb6a,color:#fff
```

### Flow 4 — Collusion Risk Scan (5-Flag Analysis)

```mermaid
flowchart TD
    A["🛡️ Officer Triggers<br/>Collusion Scan"] --> B["📊 Input: Bid Amounts<br/>from All Bidders"]

    B --> C["📈 Flag 1: Bid Clustering<br/>scipy CV Calculation<br/>(REAL - Not Mocked)"]
    B --> D["🔍 Flag 2: CA Fingerprint<br/>Document Formatting<br/>Similarity Score"]
    B --> E["📍 Flag 3: Shared Address<br/>Registered Office<br/>Overlap Detection"]
    B --> F["🕸️ Flag 4: Ownership Network<br/>MCA Director Links<br/>(Phase 2 Stub)"]
    B --> G["📄 Flag 5: Doc Quality<br/>Asymmetry Detection<br/>DPI / OCR Variance"]

    C --> H{"CV < 5%?"}
    H -->|Yes| I["🔴 TRIGGERED<br/>0.3% chance by luck"]
    H -->|No| J["🟢 CLEAR"]

    D --> K{"Similarity > 80%?"}
    K -->|Yes| L["🔴 TRIGGERED<br/>Same CA firm suspected"]
    K -->|No| M["🟢 CLEAR"]

    I & J & L & M & E & F & G --> N["📋 5-Flag Report<br/>None auto-disqualify"]
    N --> O["👤 Senior Officer<br/>Reviews Evidence"]
    N --> P["🔐 Audit Log<br/>Collusion Scan Recorded"]

    style A fill:#e65100,stroke:#ff9800,color:#fff
    style C fill:#4338ca,stroke:#818cf8,color:#fff
    style I fill:#c62828,stroke:#ef5350,color:#fff
    style L fill:#c62828,stroke:#ef5350,color:#fff
    style J fill:#1b5e20,stroke:#4caf50,color:#fff
    style M fill:#1b5e20,stroke:#4caf50,color:#fff
```

### Flow 5 — Audit Trail → Court-Admissible PDF Export

```mermaid
flowchart TD
    A["⚖️ Disqualified Bidder<br/>Files Challenge in<br/>CAT / High Court"] --> B["📋 CRPF Requests<br/>Audit Trail for Entity"]
    B --> C["GET /api/audit/{'{entity_id}'}/trail<br/>Returns Chronological Chain"]
    C --> D["📜 Each Entry Contains:"]

    D --> E["🕐 Microsecond Timestamp (UTC)"]
    D --> F["🔐 SHA-256 Hash of Input"]
    D --> G["🔐 SHA-256 Hash of Output"]
    D --> H["🤖 AI Model Version Used"]
    D --> I["👤 Officer ID (if human decision)"]
    D --> J["📊 Confidence Score"]
    D --> K["📎 Verbatim Extracted Value + Citation"]

    E & F & G & H & I & J & K --> L["GET /api/audit/{'{entity_id}'}/export-pdf"]
    L --> M["📄 ReportLab Generates<br/>Court-Admissible PDF"]
    M --> N["✅ Every Hash<br/>Independently Verifiable"]
    N --> O["⚖️ Officer is Legally<br/>Untouchable — Full Evidence Chain"]

    style A fill:#c62828,stroke:#ef5350,color:#fff
    style M fill:#1a237e,stroke:#6366f1,color:#fff
    style N fill:#1b5e20,stroke:#4caf50,color:#fff
    style O fill:#1b5e20,stroke:#66bb6a,color:#fff
```

---

## 📁 Project Structure

```
nyayadarsi/
│
├── 📄 .env.example                    # Environment variable template
├── 📄 .gitignore                      # Git exclusions
├── 📄 README.md                       # This file
├── 📄 worktillnow.md                  # Team progress tracker
│
├── 🔧 backend/                        # FastAPI + Python 3.13
│   ├── __init__.py
│   ├── main.py                        # App entry — mounts routers, CORS, health check
│   ├── config.py                      # Loads .env — API keys, GPS coords, thresholds
│   ├── database.py                    # SQLite + WAL — 6 tables, init_db()
│   ├── requirements.txt               # Python dependencies
│   │
│   ├── 🤖 ai/                         # AI Pipeline
│   │   ├── gemini_client.py           # Gemini 1.5 Flash — rate-limit retry
│   │   ├── groq_client.py             # Groq Llama 3 — seamless fallback
│   │   ├── criteria_extractor.py      # Tender text → structured criteria JSON
│   │   ├── integrity_alert.py         # Rule-based alert engine (brand, year, threshold)
│   │   ├── value_extractor.py         # Document value extraction (Phase 2)
│   │   ├── financial_ontology.py      # "Annual Turnover" ↔ "Net Revenue" mapping
│   │   └── consistency_checker.py     # Cross-document financial verification
│   │
│   ├── 🛡️ collusion/                  # Collusion Risk Engine
│   │   ├── bid_clustering.py          # scipy CV analysis — REAL calculation
│   │   ├── ca_fingerprint.py          # Document formatting similarity
│   │   ├── address_flag.py            # Shared registered office detection
│   │   ├── ownership_network.py       # MCA director links (Phase 2 stub)
│   │   └── doc_quality.py             # Quality asymmetry detection
│   │
│   ├── 🔐 audit/                      # Cryptographic Audit System
│   │   ├── sha256_logger.py           # SHA-256 hashing, append-only INSERT
│   │   └── pdf_exporter.py            # Court-admissible PDF (ReportLab)
│   │
│   ├── 🌐 routes/                     # API Endpoints (16 total)
│   │   ├── tender.py                  # POST /upload, POST /integrity-check, GET /status
│   │   ├── evaluation.py              # GET /results, GET /yellow-queue, POST /officer-decision
│   │   ├── collusion.py               # POST /run, GET /report
│   │   ├── builder.py                 # POST /upload, GET /milestones, POST /verify-gps
│   │   ├── payment.py                 # POST /trigger (72h auto-release)
│   │   └── audit.py                   # GET /trail, GET /all, GET /export-pdf
│   │
│   ├── 🛠️ utils/                      # Utility Modules
│   │   ├── pdf_reader.py              # pdfplumber → PyMuPDF fallback
│   │   ├── gps_verifier.py            # Haversine formula — 100m threshold
│   │   └── file_handler.py            # Upload validation + SHA-256
│   │
│   └── 📋 models/                     # Pydantic Schemas
│       ├── tender.py                  # TenderCreate, TenderCriterion, IntegrityAlertResponse
│       ├── bidder.py                  # BidderProfile, DocumentUpload, BidderSubmission
│       ├── evaluation.py              # Verdict (GREEN/YELLOW/RED), CriterionResult
│       └── builder.py                 # BuilderUpload, GPSData, PaymentTrigger
│
├── 🎨 frontend/                       # Next.js 14 + Tailwind CSS
│   ├── package.json
│   ├── next.config.js                 # API proxy to FastAPI backend
│   ├── tailwind.config.js             # Custom palette, verdict colors, animations
│   ├── postcss.config.js
│   ├── .env.local                     # NEXT_PUBLIC_API_URL
│   │
│   ├── styles/
│   │   └── globals.css                # Glassmorphism, micro-animations, verdict badges
│   │
│   ├── pages/
│   │   ├── _app.js                    # Root wrapper — SEO meta, global styles
│   │   ├── index.js                   # Landing — animated logo, 3 dashboard cards
│   │   ├── gov.js                     # Dashboard 1 — tender upload, AI extraction, alerts
│   │   ├── evaluation.js              # Dashboard 2 — bidder verdicts, yellow queue, collusion
│   │   └── builder.js                 # Dashboard 3 — GPS upload, milestones, payments
│   │
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx             # Sidebar + top bar — used by all dashboards
│   │
│   └── lib/
│       ├── api.js                     # All fetch calls — consistent {data, error} shape
│       └── constants.js               # Branding, verdict colors, nav items, flag labels
│
├── 📊 demo/                           # Demo Data & Samples
│   ├── sample_tender_text.txt         # CRPF barracks tender with narrow criteria
│   └── mock_data/
│       ├── evaluation_results.json    # 4 bidders — GREEN, RED, YELLOW verdicts
│       ├── collusion_results.json     # 5 flags — bid clustering + CA fingerprint triggered
│       ├── bids.json                  # 4 bid amounts for clustering analysis
│       ├── milestones.json            # 5 construction milestones
│       └── audit_trail.json           # Sample audit entries with SHA-256 hashes
│
└── ⚙️ scripts/                        # Setup & Utilities
    ├── setup.bat                      # Windows one-click setup
    ├── seed_demo.py                   # Load mock data into SQLite
    └── test_gemini.py                 # Validate API key before demo
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+ (tested with 3.13)
- Node.js 18+
- Gemini API Key ([get free key](https://aistudio.google.com/app/apikey))

### 1. Clone & Configure

```bash
git clone https://github.com/SIBAM890/Nyayadarsi.git
cd Nyayadarsi

# Create .env from template
copy .env.example .env
# Edit .env → add your GEMINI_API_KEY
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows
pip install -r requirements.txt

# Initialize database + seed demo data
cd ..
python scripts/seed_demo.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run

```bash
# Terminal 1 — Backend (from project root)
cd Nyayadarsi
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

### 5. Verify

```bash
# Test API health
curl http://localhost:8000/api/health

# Test AI connection
python scripts/test_gemini.py
```

---

## 📡 API Reference

### Tender Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tender/upload` | Upload tender PDF → Gemini extracts criteria → integrity alerts |
| `POST` | `/api/tender/integrity-check` | Check a single criterion for alerts |
| `GET` | `/api/tender/{tender_id}/status` | Get tender evaluation progress |

### Bid Evaluation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/evaluation/{tender_id}/results` | All bidder evaluations (GREEN/YELLOW/RED) |
| `GET` | `/api/evaluation/{tender_id}/yellow-queue` | Pending YELLOW items, sorted by consequence |
| `POST` | `/api/evaluation/officer-decision` | Record officer PASS/FAIL with mandatory reason |

### Collusion Detection

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/collusion/run` | Run 5-flag collusion analysis (real scipy) |
| `GET` | `/api/collusion/{tender_id}/report` | Retrieve stored collusion report |

### Builder Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/builder/upload` | GPS-verified progress upload (rejects if >100m) |
| `GET` | `/api/builder/{contract_id}/milestones` | Milestone progress and payment status |
| `POST` | `/api/builder/verify-gps` | Standalone GPS distance check |

### Payment & Audit

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payment/trigger` | Trigger 72-hour auto-release payment |
| `GET` | `/api/audit/{entity_id}/trail` | Full audit chain for any entity |
| `GET` | `/api/audit/all` | All audit entries (limit 1000) |
| `GET` | `/api/audit/{entity_id}/export-pdf` | Court-admissible PDF download |

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **AI Primary** | Gemini 1.5 Flash | Free tier (1M tokens/day), data sovereignty compliant |
| **AI Fallback** | Groq + Llama 3 8B | Ultra-fast fallback when Gemini rate-limits |
| **Backend** | FastAPI + Python 3.13 | Async, auto-generated docs, Pydantic validation |
| **Database** | SQLite (WAL mode) | Zero-config, append-only audit capability |
| **PDF Processing** | pdfplumber + PyMuPDF | Digital PDFs + complex layout fallback |
| **Statistics** | scipy + numpy | Real bid clustering coefficient of variation |
| **Audit** | hashlib SHA-256 | Python stdlib — no external dependencies |
| **PDF Export** | ReportLab | Court-admissible document generation |
| **Frontend** | Next.js 14 + React 18 | SSR, API proxy, rapid development |
| **Styling** | Tailwind CSS 3 | Utility-first, custom design system |
| **GPS** | Haversine Formula | Real distance math — 5 lines, zero dependencies |

> **Data Sovereignty Rule:** GPT-4 and all non-Gemini cloud LLMs are excluded. Gemini operates in extractive mode only — it quotes verbatim from documents and never generates or guesses values. This is non-negotiable for CRPF deployment.

---

## ✅ What's Real vs Smart Mocked

### 🟢 Real (Working Code)

| Feature | Implementation |
|---------|---------------|
| Tender PDF → Criteria JSON | Gemini 1.5 Flash extraction pipeline |
| Integrity Alerts | Rule-based regex (brands, year ranges, threshold extremity) |
| SHA-256 Audit Logging | Python hashlib, append-only INSERT to SQLite |
| GPS Verification | Haversine formula, 100m threshold, server-side validation |
| Bid Clustering | scipy coefficient of variation, 5% threshold |
| Court-Admissible PDF | ReportLab with all hashes and timestamps |

### 🟡 Smart Mocks (Pre-computed Realistic Data)

| Feature | Implementation | Why Mocked |
|---------|---------------|------------|
| GREEN/YELLOW/RED Verdicts | Loaded from `evaluation_results.json` | Full document evaluation needs LayoutLMv3 (Phase 2) |
| CA Fingerprint | Pre-set 91% for known demo pairs | Real n-gram comparison needs document corpus |
| Ownership Network | Returns honest stub | MCA API requires NIC coordination |
| AI Progress Estimation | Hardcoded percentage | YOLOv8 site analysis is Phase 2 |

---

## 🔐 The Audit Trail

Every action generates an immutable record:

```
┌─────────────────────────────────────────────────────┐
│                    AUDIT RECORD                      │
├─────────────────────────────────────────────────────┤
│  Timestamp:        2025-04-28T10:15:30.456789Z      │
│  Action:           OFFICER_DECISION                  │
│  Entity:           CRPF-2025-CONST-001:BID_003       │
│  SHA-256 Input:    f8071d46e93ab123567890...          │
│  SHA-256 Output:   09182e57fa4bc234678901...          │
│  Model Version:    gemini-1.5-flash (if AI action)   │
│  Officer ID:       OFF_002 (if human decision)       │
│  Confidence:       0.61                              │
│  Verdict:          PASS                              │
└─────────────────────────────────────────────────────┘

→ Append-only. No UPDATE. No DELETE.
→ Every hash independently verifiable.
→ Export as court-admissible PDF for CAT/High Court proceedings.
```

---

## 🏛️ Three Dashboards

### Dashboard 1 — Government Officer (Create Tender)
- Upload existing tender PDF → Gemini AI extracts all eligibility criteria
- Real-time Integrity Alerts fire on narrow/restrictive criteria
- Manual criterion check with instant alert feedback
- Override requires mandatory documented justification

### Dashboard 2 — Evaluation Officer (Review Bids)
- Bidder list with overall GREEN/YELLOW/RED verdict badges
- Click any bidder → criterion-by-criterion breakdown with citations
- Yellow Queue shows pending items ranked by consequence
- Officer decision requires mandatory reasoning (min 10 chars)
- Collusion Risk Scan slide-in panel with 5 flags

### Dashboard 3 — Builder (Progress Monitoring)
- GPS-verified daily uploads (100m threshold, server-side validation)
- Milestone tracker with progress bars and payment status
- Payment auto-releases 72 hours after AI verify + officer confirm
- Contract details and overall progress statistics

---

## 👥 Team

**Coding Aghoris** — PAN IIT AI for Bharat Hackathon, Grand Finale 2026

| Team | Role |
|------|------|
| **Coding Aghoris** | Coder |

---

## 📜 License

Built for the PAN IIT AI for Bharat Hackathon. All rights reserved by Team Coding Aghoris.

---

<p align="center">
  <strong>Nyayadarsi — AI that sees justice</strong><br/>
  <strong>न्यायदर्शी</strong><br/><br/>
  <em>nyaya-darshi.vercel.app</em>
</p>
