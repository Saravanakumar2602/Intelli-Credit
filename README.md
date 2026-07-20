# 📊 Intelli-Credit Enterprise Underwriting Platform

[![Python Version](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=React&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-Enabled-38B2AC.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Hardened](https://img.shields.io/badge/Docker-Hardened_Non--Root-2496ED.svg?style=flat&logo=Docker&logoColor=white)](https://www.docker.com/)

**Intelli-Credit** is a flagship, AI-powered corporate credit underwriting and risk assessment platform designed to reflect software used by premier global banks (e.g. JPMorgan, Goldman Sachs, HSBC). 

By reorganizing code into **Clean Architecture (SOLID/DRY)**, implementing a **9-agent parallel AI synthesis pipeline**, and rebuilding the **React client from scratch using TailwindCSS v4 and TypeScript**, the platform delivers a secure, accessible, and audit-compliant appraisal solution.

---

## 🏛️ System Architecture

```text
       ┌─────────────────────────────────────────────────────────────┐
       │             REACT 19 + TSX CLIENT SPA (PORT 8080)            │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ (HTTP REST API + JWT Token)
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                FASTAPI WEB SERVER (PORT 8000)               │
       ├─────────────────────────────────────────────────────────────┤
       │  [api/]                                                     │
       │    ├── auth.py         ──► Locks attempts (5), rot tokens   │
       │    ├── onboarding.py   ──► Step validations (CIN / PAN)      │
       │    ├── upload.py       ──► Sig magic checks, LFI paths      │
       │    ├── analyze.py      ──► Celery task trigger & polling    │
       │    └── monitoring.py   ──► Prometheus metrics & diagnostics │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                   CELERY TASK RUNNER (REDIS)                │
       ├─────────────────────────────────────────────────────────────┤
       │  [tasks/analysis_task.py]                                   │
       │    ──► Concurrently triggers 9 specialized AI Agents        │
       │    ──► Indexes semantic data with FAISS vector RAG           │
       │    ──► Evaluates Piotroski, Altman Z-Score, Merton Model    │
       │    ──► Synthesizes ReportLab multi-page CAM Underwriting PDF│
       └─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Key Enterprise Transformations

### 1. Robust Clean Backend Architecture
- **Layered Structure**: Restructured code into controllers (`api/`), connection handlers (`database/`), relational entities (`models/`), data queries (`repositories/`), cryptography/ingestion validators (`security/`), financial analytics (`services/`), and queue tasks (`tasks/`).
- **Access Control & RTR**: Lockouts block IP bounds after 5 failed password attempts (12-char complexity rules). Implements refresh token rotation (RTR) to prevent session replays.
- **High-Security Ingestion**: Blocks rename attacks via Magic Bytes checking, zip bomb scans, LFI traversal path overrides, and optional AES-256 storage-level file encryption.

### 2. Parallel 9-Agent AI Pipeline
- **Specialized AI Agents**: Runs 9 models in parallel (Extractors, SWOT Auditors, Ratio analysts, Sentiment engines, Citation guards) validating inputs via strict Pydantic schemas.
- **RAG & Anti-Hallucination**: Embeds documents into a local FAISS index, feeding relevant chunks to the LLM and forcing exact page number citations.

### 3. Financial Scoring & Risk Analytics
- **20+ Ratios**: Operating margins, leverage indices, turnover, and interest cover.
- **Solvency Modeler**: Calculates Altman Z-Score, Piotroski F-Score, Beneish M-Score, and Merton structural probability of default.
- **Risk Heatmap**: Mapped dynamically across 8 distinct categories.

### 4. Fully Redesigned React Client (From Scratch)
- **Design Tokens**: Slate backgrounds with glassmorphic cards and teal/cyan glowing active states.
- **Command Search Palette**: Trigger fuzzy query searches across files and menus using `⌘K` or `Ctrl+K`.
- **Telemetry Monitoring**: Embedded dashboards displaying database load, Prometheus api latencies, and worker queue sizes.

### 5. Hardened Non-Root Containers
- **Non-Privileged Access**: Backend runs under `credit_user` on port 8000; frontend runs under `nginx` on port 8080 (non-privileged port binding).
- **Healthchecks**: Periodically polls endpoints via `curl` and `wget` spider tasks.

---

## ⚡ Local Installation & Development

### 1. Backend API Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure env files:
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY
   ```
5. Launch FastAPI:
   ```bash
   python run.py
   ```

### 2. Frontend React Client Setup
1. Open a new terminal tab and enter the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev compiler:
   ```bash
   npm run dev
   ```

### 3. Running Tests
To run unit and integration tests:
```bash
# From project root
.venv\Scripts\python.exe -m pytest backend/tests
```

---

## 🐳 Docker Deployment

Build and orchestrate the hardened non-root containers:
```bash
GROQ_API_KEY="your-groq-key" docker compose up --build
```
* **Frontend SPA**: Serves statically on port `80` (redirects internally to `8080`).
* **Backend API**: Accessible on port `8000`.
* **Database Location**: Securely mounted inside `/app/intelli_credit.db`.
