# Nyayadarsi — Work Progress Tracker

### Last Updated: 1st May 2026, 4:09 PM IST
### Grand Finale: 16th May 2026 — Taj Yeshwantpur, Bengaluru
### Days Remaining: **15 days**

---

## ✅ COMPLETED (Day 1 — 1st May 2026)

### Backend — FastAPI (100% Foundation Done)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `backend/main.py` | FastAPI app, CORS, all routers mounted, `/api/health` | ✅ Done |
| 2 | `backend/config.py` | Loads `.env`, exposes all config vars | ✅ Done |
| 3 | `backend/database.py` | SQLite + WAL mode, 6 tables, `init_db()` | ✅ Done |
| 4 | `backend/__init__.py` | Package init | ✅ Done |

### AI Modules (100% Done)

| # | File | Purpose | Real/Mock | Status |
|---|------|---------|-----------|--------|
| 5 | `backend/ai/gemini_client.py` | Gemini 1.5 Flash wrapper, rate-limit retry | 🟢 REAL | ✅ Done |
| 6 | `backend/ai/groq_client.py` | Groq Llama 3 fallback, same interface | 🟢 REAL | ✅ Done |
| 7 | `backend/ai/criteria_extractor.py` | Tender text → structured criteria JSON via Gemini | 🟢 REAL | ✅ Done |
| 8 | `backend/ai/integrity_alert.py` | Rule-based: brand names, year ranges, threshold extremity | 🟢 REAL | ✅ Done |
| 9 | `backend/ai/value_extractor.py` | Document value extraction (Phase 2 stub) | 🟡 STUB | ✅ Done |
| 10 | `backend/ai/financial_ontology.py` | Synonym mapping for financial terms | 🟢 REAL | ✅ Done |
| 11 | `backend/ai/consistency_checker.py` | Cross-document financial consistency | 🟡 BASIC | ✅ Done |

### Collusion Engine (100% Done)

| # | File | Purpose | Real/Mock | Status |
|---|------|---------|-----------|--------|
| 12 | `backend/collusion/bid_clustering.py` | scipy CV calculation, 5% threshold | 🟢 REAL scipy | ✅ Done |
| 13 | `backend/collusion/ca_fingerprint.py` | Document formatting similarity | 🟡 Pre-computed | ✅ Done |
| 14 | `backend/collusion/address_flag.py` | Shared registered office detection | 🟢 REAL | ✅ Done |
| 15 | `backend/collusion/ownership_network.py` | MCA API — honest Phase 2 stub | 🟡 STUB | ✅ Done |
| 16 | `backend/collusion/doc_quality.py` | Document quality asymmetry detection | 🟢 REAL | ✅ Done |

### Audit System (100% Done)

| # | File | Purpose | Real/Mock | Status |
|---|------|---------|-----------|--------|
| 17 | `backend/audit/sha256_logger.py` | SHA-256 hashing, append-only INSERT | 🟢 REAL | ✅ Done |
| 18 | `backend/audit/pdf_exporter.py` | Court-admissible PDF via ReportLab | 🟢 REAL | ✅ Done |

### Routes / API Endpoints (100% Done)

| # | File | Endpoints | Status |
|---|------|-----------|--------|
| 19 | `backend/routes/tender.py` | `POST /upload`, `POST /integrity-check`, `GET /status` | ✅ Done |
| 20 | `backend/routes/evaluation.py` | `GET /results`, `GET /yellow-queue`, `POST /officer-decision` | ✅ Done |
| 21 | `backend/routes/collusion.py` | `POST /run`, `GET /report` | ✅ Done |
| 22 | `backend/routes/builder.py` | `POST /upload`, `GET /milestones`, `POST /verify-gps` | ✅ Done |
| 23 | `backend/routes/payment.py` | `POST /trigger` (72-hour auto-release) | ✅ Done |
| 24 | `backend/routes/audit.py` | `GET /trail`, `GET /all`, `GET /export-pdf` | ✅ Done |

### Utility Modules (100% Done)

| # | File | Purpose | Real/Mock | Status |
|---|------|---------|-----------|--------|
| 25 | `backend/utils/pdf_reader.py` | pdfplumber → PyMuPDF fallback | 🟢 REAL | ✅ Done |
| 26 | `backend/utils/gps_verifier.py` | Haversine distance, 100m threshold | 🟢 REAL | ✅ Done |
| 27 | `backend/utils/file_handler.py` | Upload validation, SHA-256 hash | 🟢 REAL | ✅ Done |

### Pydantic Models (100% Done)

| # | File | Status |
|---|------|--------|
| 28 | `backend/models/tender.py` | ✅ Done |
| 29 | `backend/models/bidder.py` | ✅ Done |
| 30 | `backend/models/evaluation.py` | ✅ Done |
| 31 | `backend/models/builder.py` | ✅ Done |

### Frontend — Next.js + Tailwind (100% Foundation Done)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 32 | `frontend/pages/index.js` | Landing page — animated logo, 3 nav cards, auto-redirect | ✅ Done |
| 33 | `frontend/pages/gov.js` | Gov dashboard — PDF upload, AI extraction, integrity alerts, manual check | ✅ Done |
| 34 | `frontend/pages/evaluation.js` | Eval dashboard — bidder list, verdicts, yellow queue, collusion panel | ✅ Done |
| 35 | `frontend/pages/builder.js` | Builder dashboard — GPS upload, milestones, payment release | ✅ Done |
| 36 | `frontend/components/layout/Layout.jsx` | Glassmorphic sidebar + top bar | ✅ Done |
| 37 | `frontend/lib/api.js` | All API calls, consistent `{data, error}` shape | ✅ Done |
| 38 | `frontend/lib/constants.js` | Branding, colors, nav items | ✅ Done |
| 39 | `frontend/styles/globals.css` | Premium design system, glassmorphism, micro-animations | ✅ Done |

### Demo Data (100% Done)

| # | File | Status |
|---|------|--------|
| 40 | `demo/mock_data/evaluation_results.json` | 4 bidders, GREEN/YELLOW/RED with citations | ✅ Done |
| 41 | `demo/mock_data/collusion_results.json` | 5 flags, 2 triggered | ✅ Done |
| 42 | `demo/mock_data/bids.json` | 4 bid amounts | ✅ Done |
| 43 | `demo/mock_data/milestones.json` | 5 construction milestones | ✅ Done |
| 44 | `demo/mock_data/audit_trail.json` | 4 sample audit entries | ✅ Done |
| 45 | `demo/sample_tender_text.txt` | CRPF barracks tender with narrow criteria | ✅ Done |

### Scripts & Config (100% Done)

| # | File | Status |
|---|------|--------|
| 46 | `scripts/seed_demo.py` | Loads mock data into SQLite | ✅ Done |
| 47 | `scripts/test_gemini.py` | API key validation | ✅ Done |
| 48 | `scripts/setup.bat` | Windows one-click setup | ✅ Done |
| 49 | `.env` / `.env.example` | Environment variables | ✅ Done |
| 50 | `.gitignore` | Comprehensive exclusions | ✅ Done |
| 51 | `README.md` | Architecture, API reference, quick start | ✅ Done |

### Current System Status

| Component | Status |
|-----------|--------|
| Backend boots (`/api/health` returns 200) | ✅ Verified |
| Frontend boots (`npm run dev` on :3000) | ✅ Verified |
| Database initializes (6 tables) | ✅ Verified |
| All 16 API routes registered | ✅ Verified |

---

## 🔧 WHAT REMAINS — Tasks for Team

### Priority 1 — CRITICAL FOR DEMO (Must have by May 14)

| Task | Assigned To | Description | Est. Hours |
|------|------------|-------------|------------|
| **T1: Gemini API Key + Test** | — | Get free Gemini key from aistudio.google.com, put in `.env`, run `python scripts/test_gemini.py` | 0.5h |
| **T2: Sample Tender PDF** | — | Convert `demo/sample_tender_text.txt` into a proper PDF for upload demo | 0.5h |
| **T3: End-to-End Demo Flow Test** | — | Upload PDF → see criteria → see alerts → go to evaluation → make decisions → run collusion → GPS upload | 2h |
| **T4: Fix Any Runtime Bugs** | — | Test each dashboard, fix API connection issues, CORS, data loading | 4h |

### Priority 2 — VISUAL POLISH (High impact for judges)

| Task | Assigned To | Description | Est. Hours |
|------|------------|-------------|------------|
| **T5: Recharts Bid Chart** | — | Add bar chart visualization in CollusionPanel showing bid amounts (recharts already in package.json) | 3h |
| **T6: CV Gauge Meter** | — | Animated gauge showing coefficient of variation with 5% threshold line | 2h |
| **T7: Bid Comparison Table** | — | Table in evaluation page comparing all bidders side by side | 3h |
| **T8: Audit Trail Viewer Component** | — | Timeline view of audit entries with hash display, usable across all dashboards | 3h |
| **T9: Loading States & Error Handling** | — | Better loading skeletons, error toasts, empty state messages | 2h |

### Priority 3 — MOBILE APP (Bonus for demo)

| Task | Assigned To | Description | Est. Hours |
|------|------------|-------------|------------|
| **T10: Expo Project Setup** | — | `npx create-expo-app mobile`, basic navigation | 2h |
| **T11: Upload Screen** | — | Camera + GPS capture + upload to backend | 4h |
| **T12: GPS Live Badge** | — | Real-time distance display, green/red indicator | 2h |
| **T13: Milestone Screen** | — | Shows milestone progress from API | 2h |

### Priority 4 — DEPLOYMENT (Must have by May 15)

| Task | Assigned To | Description | Est. Hours |
|------|------------|-------------|------------|
| **T14: Deploy Backend to Railway** | — | railway.app free tier, set env vars, test health endpoint | 2h |
| **T15: Deploy Frontend to Vercel** | — | Connect GitHub repo, set `NEXT_PUBLIC_API_URL` to Railway URL | 1h |
| **T16: Update CORS & API URLs** | — | Update `main.py` CORS origins and `frontend/.env.local` for production URLs | 0.5h |
| **T17: Final Demo Video (OBS)** | — | 3-minute walkthrough: tender upload → evaluation → collusion → builder GPS → audit | 3h |

### Priority 5 — NICE TO HAVE (Only if time permits)

| Task | Assigned To | Description | Est. Hours |
|------|------------|-------------|------------|
| **T18: Bidder Profile Cards** | — | Separate component files for `BidderCard.jsx`, `FlagCard.jsx` etc. | 3h |
| **T19: Demo Script Document** | — | `docs/demo_script.md` — exact click-by-click demo walkthrough for stage | 2h |
| **T20: Architecture Diagram** | — | `docs/architecture.png` using draw.io or Mermaid | 1h |
| **T21: Real CA Fingerprint** | — | Actual n-gram formatting comparison instead of pre-computed values | 4h |
| **T22: Bidder Document Upload** | — | Let evaluators upload actual bidder PDFs for Gemini extraction | 6h |

---

## 📁 Complete File Tree (Current State)

```
nyayadarsi/
├── .env                              ✅
├── .env.example                      ✅
├── .gitignore                        ✅
├── README.md                         ✅
├── worktillnow.md                    ✅ (this file)
│
├── backend/
│   ├── __init__.py                   ✅
│   ├── main.py                       ✅
│   ├── config.py                     ✅
│   ├── database.py                   ✅
│   ├── requirements.txt              ✅
│   ├── ai/
│   │   ├── __init__.py               ✅
│   │   ├── gemini_client.py          ✅
│   │   ├── groq_client.py            ✅
│   │   ├── criteria_extractor.py     ✅
│   │   ├── integrity_alert.py        ✅
│   │   ├── value_extractor.py        ✅
│   │   ├── financial_ontology.py     ✅
│   │   └── consistency_checker.py    ✅
│   ├── collusion/
│   │   ├── __init__.py               ✅
│   │   ├── bid_clustering.py         ✅ (REAL scipy)
│   │   ├── ca_fingerprint.py         ✅
│   │   ├── address_flag.py           ✅
│   │   ├── ownership_network.py      ✅ (Phase 2 stub)
│   │   └── doc_quality.py            ✅
│   ├── audit/
│   │   ├── __init__.py               ✅
│   │   ├── sha256_logger.py          ✅ (REAL SHA-256)
│   │   └── pdf_exporter.py           ✅
│   ├── routes/
│   │   ├── __init__.py               ✅
│   │   ├── tender.py                 ✅ (3 endpoints)
│   │   ├── evaluation.py             ✅ (3 endpoints)
│   │   ├── collusion.py              ✅ (2 endpoints)
│   │   ├── builder.py                ✅ (3 endpoints)
│   │   ├── payment.py                ✅ (1 endpoint)
│   │   └── audit.py                  ✅ (3 endpoints)
│   ├── utils/
│   │   ├── __init__.py               ✅
│   │   ├── pdf_reader.py             ✅
│   │   ├── gps_verifier.py           ✅
│   │   └── file_handler.py           ✅
│   └── models/
│       ├── __init__.py               ✅
│       ├── tender.py                 ✅
│       ├── bidder.py                 ✅
│       ├── evaluation.py             ✅
│       └── builder.py                ✅
│
├── frontend/
│   ├── .env.local                    ✅
│   ├── package.json                  ✅
│   ├── next.config.js                ✅
│   ├── tailwind.config.js            ✅
│   ├── postcss.config.js             ✅
│   ├── styles/
│   │   └── globals.css               ✅
│   ├── pages/
│   │   ├── _app.js                   ✅
│   │   ├── index.js                  ✅ (Landing)
│   │   ├── gov.js                    ✅ (Dashboard 1)
│   │   ├── evaluation.js             ✅ (Dashboard 2)
│   │   └── builder.js                ✅ (Dashboard 3)
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx            ✅
│   └── lib/
│       ├── api.js                    ✅
│       └── constants.js              ✅
│
├── demo/
│   ├── sample_tender_text.txt        ✅
│   └── mock_data/
│       ├── evaluation_results.json   ✅
│       ├── collusion_results.json    ✅
│       ├── bids.json                 ✅
│       ├── milestones.json           ✅
│       └── audit_trail.json          ✅
│
├── scripts/
│   ├── setup.bat                     ✅
│   ├── seed_demo.py                  ✅
│   └── test_gemini.py                ✅
│
├── mobile/                           ❌ NOT STARTED
├── docs/                             ❌ NOT STARTED
└── demo/bidder_*/                    ❌ NOT STARTED
```

---

## 🧮 Progress Summary

| Area | Files Done | Files Remaining | % Complete |
|------|-----------|-----------------|------------|
| Backend Core | 4/4 | 0 | **100%** |
| AI Modules | 7/7 | 0 | **100%** |
| Collusion Engine | 5/5 | 0 | **100%** |
| Audit System | 2/2 | 0 | **100%** |
| API Routes | 6/6 | 0 | **100%** |
| Utilities | 3/3 | 0 | **100%** |
| Models | 4/4 | 0 | **100%** |
| Frontend Pages | 4/4 | 0 | **100%** |
| Frontend Components | 1/10+ | 9+ | **10%** |
| Demo Data | 5/5 | 0 | **100%** |
| Mobile App | 0/8 | 8 | **0%** |
| Docs | 1/3 | 2 | **33%** |
| Deployment | 0/2 | 2 | **0%** |
| **OVERALL** | **42/60+** | **~20** | **~70%** |

---

## 🏁 Demo Readiness Checklist

- [x] Backend boots and returns health check
- [x] Frontend boots and renders all 3 dashboards
- [x] 16 API endpoints registered
- [x] Mock data files ready for all dashboards
- [x] Gemini AI extraction pipeline coded
- [ ] Gemini API key configured and tested
- [ ] End-to-end PDF upload → criteria extraction tested
- [ ] Officer decision flow tested with audit hash
- [ ] Collusion scan tested with real scipy
- [ ] GPS upload acceptance/rejection tested
- [ ] Recharts visualizations added
- [ ] Mobile app built (optional)
- [ ] Deployed to Railway + Vercel
- [ ] Demo video recorded

---

**Team Coding Aghoris — Nyayadarsi — न्यायदर्शी**
**PAN IIT AI for Bharat | Grand Finale May 16, 2026**
