# 📊 Intelli-Credit Platform

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=React&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=Docker&logoColor=white)](https://www.docker.com/)
[![Database](https://img.shields.io/badge/Database-SQLAlchemy%20%7C%20SQLite-3FCF8E.svg?style=flat&logo=SQLite&logoColor=white)](https://sqlite.org/)
[![LLM Powered](https://img.shields.io/badge/LLM-Groq%20API-red.svg)](https://groq.com/)

**Intelli-Credit** is a production-grade, AI-powered corporate credit appraisal and risk assessment platform. By combining an **asynchronous FastAPI backend** and a modern **React frontend**, it automates corporate loan underwriting pipelines. The system ingests primary corporate materials (PDF/Word/Excel files) and performs parallel LLM-driven parsing, public news research, secondary intelligence collection, and SWOT analysis. It calculates risk indexes and outputs a printable **Credit Appraisal Memo (CAM)** PDF.

---

## 🏛️ System Flow & Architecture

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                 REACT CLIENT SPA (PORT 5173)                │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ (HTTP REST API + JWT Token)
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                FASTAPI WEB SERVER (PORT 8000)               │
       ├─────────────────────────────────────────────────────────────┤
       │                                                             │
       │  [POST /upload]     ──► Sanitizes LFI paths, appends UUIDs   │
       │                         Parses PDF / DOCX / XLSX in parallel│
       │                                                             │
       │  [POST /analyze]    ──► Concurrently runs via asyncio.gather│
       │                         - Custom schema Groq LLM extraction │
       │                         - Neutral-fallback sector news API  │
       │                         - Calculated leverage & margin ratios│
       │                         - SWOT + Triangulation synthesis    │
       │                         - ReportLab multi-page CAM PDF      │
       │                                                             │
       │  [POST /onboarding] ──► Validates CIN/PAN regex patterns    │
       │                         Persists profile to SQL Database    │
       │                                                             │
       └─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Key Features & Refactoring Additions

### 1. Unified Authentication & SQL Database Storage
*   **Onboarding Persistence**: Integrated standard corporate application tables (CIN, PAN, Sector, Loan Details) in SQLite via SQLAlchemy.
*   **Direct Bcrypt Hashing**: Replaced deprecated `passlib` context with direct `bcrypt` calls to resolve environment-specific installation bugs and startup exceptions.
*   **Volatile Storage Removal**: Shifted signup and login queries to authenticate against the persistent database instead of volatile in-memory arrays.
*   **Auto-Seeding**: Seeds a standard bank credit officer demo account (`demo@bank.com` / `demo123`) automatically on startup.

### 2. Multi-Format Parsing & Smart Context Chunking
*   **Word & Excel Reading**: Ingests `.docx` (via `python-docx`) and `.xlsx` (via `pandas`) spreadsheet tab data dynamically in addition to standard PDFs.
*   **Smart Paragraph Ranking**: Evaluates paragraph relevance based on critical financial keyword frequencies. Extracts and combines the highest-density blocks up to 18,000 characters to prevent prompt context truncation.
*   **Dynamic Custom Schemas**: Accepts custom schema arrays configured dynamically on the frontend to format system extraction prompts on-the-fly.

### 3. Asynchronous Pipeline & Parallel Analysis
*   **Parallel Execution**: Concurrently runs LLM financial extraction, sector news indexing, and secondary intelligence collection inside an `asyncio.gather` pipeline.
*   **Non-Blocking Operations**: Executes synchronous text-extraction libraries (`pdfplumber`, `python-docx`, `pandas`) within a thread pool executor (`loop.run_in_executor`) to prevent blocking FastAPI's main event loop.

### 4. Security & Access Control
*   **Local File Inclusion (LFI) Traversal Guard**: Asserts that all path resolutions are strictly jailed inside the `uploads/` subdirectory.
*   **File Overwrite Protections**: Appends random UUID hashes to uploaded files to prevent naming collisions.
*   **JWT Token Protection**: Secures the upload, onboarding, and analysis endpoints using JSON Web Token authentication headers.
*   **Traceback Stripping**: Cleanses internal traceback dumps from 500 error responses to secure server details.

### 5. Credit Appraisal Memo (CAM) & Risk Metric Visualizations
*   **In-Depth Report Generation**: Produces a downloadable multi-page PDF credit memo compiling ratios, SWOT matrices, regulatory warnings, next steps, and dynamic tables mapped to the dynamic schema.
*   **Triangulation bug fix**: Resolved the inverted consistency logic where high-risk parameters were incorrectly categorized as anomalous.
*   **Risk Meter Realignment**: Aligned visual meter scale labels on the frontend to correctly map score boundaries.

### 6. Synchronized Navigation & Routing
*   **Protected Frontend Views**: Restricts the `/onboarding` page behind the React Router auth wrapper to auto-redirect unauthenticated users to `/login`.
*   **Unified Navbar**: Synchronizes active tab visual states dynamically across Dashboard, Onboarding, and Results pages using the `useLocation()` hook.

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
   Interactive API docs are available at `http://localhost:8000/docs`, and online status is checked at `http://localhost:8000/`.

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
To execute the automated `pytest` test suite:
```bash
cd backend
..\.venv\Scripts\python -m pytest
```

---

## 🐳 Running with Docker

Start the entire platform (FastAPI + React compiled on Nginx) with a single command from the project root:

```bash
GROQ_API_KEY="your-groq-api-key" docker compose up --build
```
* **Frontend SPA**: Serves statically on port `80` (`http://localhost`).
* **Backend API**: Accessible on port `8000` (`http://localhost:8000`).

---

## ⚙️ Environment Variables

Configure parameters in your backend `.env` file:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | **Required**. Your Groq Console API credentials. | *None* |
| `GROQ_MODEL` | The Groq LLM model to run extraction tasks. | `llama-3.3-70b-versatile` |
| `DATABASE_URL` | SQLite path or Supabase/PostgreSQL connection string. | `sqlite:///./intelli_credit.db` |
| `NEWS_API_KEY` | Optional NewsAPI key. (If missing, uses LLM-based neutral sector fallback) | *None* |
| `JWT_SECRET_KEY` | Custom encryption string to sign JSON Web Tokens. | `supersecretkey` |

