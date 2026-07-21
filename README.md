# Intelli-Credit

AI-powered corporate credit analysis platform (FastAPI backend + React frontend). Extracts financials from PDFs, runs secondary research, triangulates data, produces SWOT and explainable loan recommendations and a credit appraisal memo (CAM).

**Quick links**
- **Run script**: [run.py](run.py#L1)
- **Requirements**: [requirements.txt](requirements.txt#L1)
- **Quick start guide**: [QUICK_START.md](QUICK_START.md#L1)
- **Architecture doc**: [ARCHITECTURE.md](ARCHITECTURE.md#L1)
- **Backend entry**: [app/main.py](app/main.py#L1)
- **Frontend package**: [frontend/package.json](frontend/package.json#L1)

**Key features**
- Financial data extraction from PDF
- Financial ratios and risk scoring
- Secondary research (news + sentiment)
- Data triangulation and confidence scoring
- LLM-powered SWOT analysis (Ollama integration)
- Explainable recommendation engine (APPROVE/CONDITIONAL/REJECT)
- Credit Appraisal Memo (CAM) generation

**Prerequisites**
- Python 3.10+ (recommended) and node 18+ for frontend
- Local virtual environment (recommended)
- Optional: Ollama running locally for LLM features

**Install (backend)**
1. Create and activate a virtual environment in project root.

2. Install Python dependencies:

```
pip install -r requirements.txt
```

**Run backend (development)**
1. From project root:

```
python run.py
```

This starts the FastAPI app (http://localhost:8000). Swagger UI is available at `/docs`.

**Run frontend (development)**
1. Install frontend deps and start dev server:

```
cd frontend
npm install
npm run dev
```

Frontend typically runs on http://localhost:5173 and communicates with backend at http://localhost:8000. See `QUICK_START.md` for a full testing workflow.

**Environment variables**
- Create a `.env` file in the project root for optional keys. Example values are in `QUICK_START.md`.

Important variables:
- `NEWS_API_KEY` — optional (NewsAPI for secondary research)
- `OLLAMA_URL` — e.g. `http://localhost:11434` (if using Ollama locally)
- `LLM_MODEL` — e.g. `qwen3:8b`
- `DATABASE_URL` — sqlite or other DB connection string
- `SECRET_KEY` — app secret

**Project structure (high level)**
- `app/` — FastAPI backend (routes, services, utils)
  - `app/services/` — analysis modules: `document_parser.py`, `llm_extractor.py`, `financial_analysis.py`, `news_research.py`, `secondary_research.py`, `triangulation_service.py`, `swot_analysis.py`, `recommendation_engine.py`, `cam_generator.py`
- `frontend/` — React UI built with Vite
- `uploads/` — uploaded PDFs and generated reports
- `run.py` — convenience script to start uvicorn
- `requirements.txt` — Python dependencies

**Endpoints of interest**
- `POST /upload` — upload files (handled by `app.routes.upload`)
- `POST /analyze` — run full analysis pipeline (see `app.routes.analyze`)
- `GET /download/?file_path=...` — download CAM or exported files

**Notes & troubleshooting**
- Ollama LLM is optional; if not running, LLM-powered features (SWOT) will fallback or be limited.
- NewsAPI usage is optional; the app works without it but secondary research will be reduced.
- Analysis can take ~30–60 seconds for full pipeline.

**Contributing**
- Add service modules to `app/services` and wire them into `app/routes/analyze.py`.
- Frontend pages live in `frontend/src/pages`; add routes in `App.jsx`.

**Where to look next**
- Implementation and design notes: [ARCHITECTURE.md](ARCHITECTURE.md#L1)
- Quick testing steps: [QUICK_START.md](QUICK_START.md#L1)

---
If you want, I can (a) commit this README, (b) add environment example `.env.example`, or (c) expand README with example API requests — which would you prefer next?
