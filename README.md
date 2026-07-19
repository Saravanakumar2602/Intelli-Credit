# 📊 Intelli-Credit Platform

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=React&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=Docker&logoColor=white)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20%7C%20SQLite-3FCF8E.svg?style=flat&logo=Supabase&logoColor=white)](https://supabase.com/)
[![LLM Powered](https://img.shields.io/badge/LLM-Groq%20API-red.svg)](https://groq.com/)

**Intelli-Credit** is an advanced, production-grade AI-powered corporate credit analysis and risk assessment platform. By combining a **FastAPI backend** and a modern **React frontend**, it automates corporate loan appraisals. It processes credit PDF documents (ALM, Shareholding, Borrowings, Annual Reports, and Portfolios), extracts key financial data via the cloud-hosted **Groq API**, calculates key risk metrics, performs market sentiment triangulation, generates SWOT analysis, and produces a printable **Credit Appraisal Memo (CAM)**.

---

## 🏛️ System Flow & Architecture

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                       REACT SPA CLIENT                      │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ (HTTP REST API)
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                      FASTAPI WEB SERVER                     │
       ├─────────────────────────────────────────────────────────────┤
       │                                                             │
       │  [/upload]       ──►  Parse text using pdfplumber           │
       │                                                             │
       │  [/analyze]      ──►  Call Groq API (llama-3.3-70b-versatile) │
       │                       - Extract financial metrics           │
       │                       - Generate risk analysis summary      │
       │                                                             │
       │                  ──►  Analyze Market News & Sentiment       │
       │                       (Triangulate TextBlob + NewsAPI)      │
       │                                                             │
       │                  ──►  Calculate Financial Ratios            │
       │                       (Leverage, Debt, Profit Margins, ROE) │
       │                                                             │
       │                  ──►  Perform SWOT Analysis (Groq LLM)      │
       │                                                             │
       │                  ──►  Generate Credit Appraisal Memo        │
       │                       (ReportLab PDF Generator)             │
       │                                                             │
       │  [/onboarding]   ──►  SQL Database Storage                  │
       │                       (Supabase Postgres / SQLite ORM)      │
       │                                                             │
       └─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Key Features

* **Auto-Document Classification**: Uploads 5 files (ALM, Shareholding, Borrowing, Annual Reports, Portfolio) and auto-detects their document types.
* **LLM-Powered Data Extraction**: Sends raw parsed PDF chunks to the **Groq API** (using high-speed Llama models) to return structured JSON financial schemas.
* **Market & Regulatory Triangulation**: Scrapes market news via NewsAPI and runs NLP sentiment analysis to cross-examine financial metrics against public reputation and find regulatory anomalies.
* **Explainable Loan Recommendation Engine**: Programmatically assesses financials, leverage, and confidence metrics to output `APPROVE`, `CONDITIONAL_APPROVE`, or `REJECT` decisions with explicit justifications and conditions.
* **Credit Appraisal Memo (CAM) Generation**: Compiles the final analysis into a structured, professional, and downloadable PDF report using ReportLab.
* **Database-Agnostic Storage**: Ready to connect out-of-the-box to cloud-based **Supabase (PostgreSQL)** databases or local **SQLite** database engines.

---

## 📂 Project Structure

```text
Intelli-Credit/                    # Root workspace
├── backend/                       # FastAPI application service
│   ├── app/                       # Python source code
│   │   ├── models/                # SQLAlchemy ORM models (User database schemas)
│   │   ├── routes/                # FastAPI routers (upload, analyze, auth, onboarding)
│   │   ├── services/              # Business logic (OCR, Groq LLM parser, CAM writer)
│   │   ├── utils/                 # Utilities
│   │   ├── auth.py                # JWT & cryptographic security context
│   │   ├── database.py            # SQLite/Supabase PostgreSQL engine config
│   │   └── main.py                # FastAPI main app instance & startup schemas
│   ├── tests/                     # Automated test suites
│   │   ├── conftest.py            # Pytest mock client fixtures
│   │   ├── test_auth.py           # Authentication test cases
│   │   └── test_analyze.py        # Analysis endpoints & safety validation tests
│   ├── .env.example               # Backend environment templates
│   ├── Dockerfile                 # Multi-stage production container setup
│   ├── requirements.txt           # Python backend dependencies
│   └── run.py                     # Local dev start script
│
├── frontend/                      # React frontend client
│   ├── src/                       # Javascript source code
│   │   ├── assets/                # Images & public materials
│   │   ├── pages/                 # Single-page UI routing pages
│   │   └── styles/                # CSS themes & glassmorphic layouts
│   ├── public/                    # Uncompiled static assets
│   ├── .gitignore                 # Frontend version control rules
│   ├── Dockerfile                 # Multi-stage client container setup
│   ├── nginx.conf                 # SPA routing proxy rules for Nginx
│   ├── package.json               # Node application packages
│   └── vite.config.js             # Vite configurations
│
├── docs/                          # Project design documentation
│   ├── ARCHITECTURE.md            # Structural diagrams & system explanations
│   ├── PHASE2_IMPLEMENTATION.md   # Deployment workflows & roadmap schedules
│   └── QUICK_START.md             # Testing workflow and sample execution guide
│
├── docker-compose.yml             # Full-stack Docker multi-container runner
├── .gitignore                     # Global ignored files list (local keys, builds)
└── README.md                      # Index page entrypoint
```

---

## ⚡ Local Installation & Development

### 1. Backend API Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment parameters:
   ```bash
   cp .env.example .env
   # Open .env and add your GROQ_API_KEY
   ```
5. Launch FastAPI development server:
   ```bash
   python run.py
   ```
   Interactive API docs are available at `http://localhost:8000/docs`.

### 2. Frontend React Setup
1. Open a new terminal tab and enter the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the dev compiler:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to interact with the platform.

### 3. Running Automated Tests
To run the automated `pytest` test suite:
```bash
cd backend
pytest
```

---

## 🐳 Running with Docker (Recommended)

Start the entire platform (FastAPI + React compiled on Nginx) with a single command from the project root:

```bash
GROQ_API_KEY="your-groq-api-key" docker compose up --build
```
* **Frontend SPA**: Serves statically on port `80` (`http://localhost`).
* **Backend API**: Accessible on port `8000` (`http://localhost:8000`).

---

## ⚙️ Environment Variables

The backend loads configuration variables from your `.env` file. These can be adjusted:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | **Required**. Your Groq Console API credentials. | *None* |
| `GROQ_MODEL` | The Groq LLM model to run extraction tasks. | `llama-3.3-70b-versatile` |
| `DATABASE_URL` | SQLite path or Supabase/PostgreSQL connection string. | `sqlite:///./intelli_credit.db` |
| `NEWS_API_KEY` | Optional NewsAPI key for real-time sentiment analysis. | *None (uses mock fallback)* |
| `JWT_SECRET_KEY` | Custom encryption string to secure JSON Web Tokens. | `supersecretkey` |
