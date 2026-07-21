# Intelli-Credit

Intelli-Credit is an enterprise-grade AI-powered corporate credit underwriting and loan analysis platform. The system leverages a multi-agent pipeline to ingest corporate financials, query public records for news and sentiment, calculate financial health scores, perform SWOT analysis, and output explainable credit recommendations alongside auto-generated Credit Appraisal Memos (CAM).

Built with a **FastAPI** backend, a **React + Vite** frontend, and backed by a **Supabase PostgreSQL** database.

---

## Technical Stack
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy ORM, Uvicorn, Pytest
- **Frontend:** React, Vite, TailwindCSS, Axios
- **Database:** PostgreSQL (Supabase)
- **AI/LLM:** Groq & Ollama integration for financials extraction and SWOT generation

---

## Directory Structure
```
├── backend/                  # FastAPI Application
│   ├── api/                  # API routers (auth, dashboard, applications, etc.)
│   ├── app/                  # Main server setup and root level overrides
│   ├── core/                 # Config setup and environment loaders
│   ├── database/             # PostgreSQL engine, session, and declarative base
│   ├── middleware/           # Security headers and observability logging
│   ├── models/               # SQLAlchemy SQL database models
│   ├── security/             # Hashing, JWT tokens, and login rate-limiting
│   ├── services/             # Core appraisal engines (SWOT, ratios, news, etc.)
│   ├── tests/                # Unit test suites (Pytest)
│   └── run.py                # Backend dev server entrypoint
│
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Shared UI component blocks
│   │   ├── pages/            # Core views (Dashboard, Audit Log, Profiles)
│   │   ├── services/         # Axios api service connections (dashboard, reports)
│   │   └── routeTree.gen.ts  # Client side router configurations
│   └── package.json
│
├── scratch/                  # Scripts for developer tasks and database resets
│   └── clean_db.py           # Database migration helper (drops & recreates tables)
│
├── .env                      # Unified environment configurations
└── requirements.txt          # Python dependencies registry
```

---

## Get Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Supabase PostgreSQL instance**

---

### 1. Database Configuration
1. Open the `.env` file in the project root.
2. Ensure your `DATABASE_URL` is set to your Supabase PostgreSQL connection string. 
3. *Note:* Make sure it uses **port `6543`** (Supabase connection pooler port) instead of the standard database port `5432` to avoid network/ISP blocks:
   ```env
   DATABASE_URL=postgresql://<user>.<project-ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

---

### 2. Setup the Backend
1. Navigate to the project root and create a virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   - **Windows PowerShell:** `.venv\Scripts\Activate.ps1`
   - **macOS/Linux:** `source .venv/bin/activate`
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. **Reset & Clean the Database:** (Drops all old tables and recreates the clean schema from scratch):
   ```bash
   $env:PYTHONPATH="."
   python scratch/clean_db.py
   ```
5. **Start the FastAPI Server:**
   ```bash
   python backend/run.py
   ```
   The backend will auto-seed the demo credit officer account in the database on startup and listen on `http://localhost:8000`. Swagger docs are available at `http://localhost:8000/docs`.

---

### 3. Setup the Frontend
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will serve on `http://localhost:8080` (or `5173`) and automatically tunnel requests to the backend server.

---

## Testing & Verification
We use **pytest** to verify API router integrations and logic. To run the tests against your configured database, execute:

```bash
$env:PYTHONPATH="."
pytest backend
```

---

## Demo Access
The login page contains pre-filled credentials for direct 1-click access:
- **Email:** `demo@bank.com`
- **Password:** `demo123`
- **Role:** Credit Officer (full dashboard analytics, appraisal creation, document uploads, and memo downloading).
