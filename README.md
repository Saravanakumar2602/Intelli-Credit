# Intelli-Credit

AI-powered corporate credit analysis platform that extracts financials from credit PDFs, calculates ratios, runs secondary market research, triangulates data, performs SWOT analysis, and produces explainable loan recommendations and a Credit Appraisal Memo (CAM).

---

## 📂 Project Structure

The project has been restructured into clean, self-contained directories. This modular separation makes the application highly maintainable, interview-ready, and easy to deploy in production:

```text
Intelli-Credit/                    # Root workspace
├── backend/                       # FastAPI application service
│   ├── app/                       # Source code directory
│   │   ├── models/                # SQLAlchemy database models
│   │   ├── routes/                # FastAPI routing layers
│   │   ├── services/              # Domain logic (OCR, LLM, SWOT, recommendations)
│   │   ├── utils/                 # General utility scripts
│   │   ├── auth.py                # JWT & cryptographic security context
│   │   ├── config.py              # Application settings
│   │   ├── database.py            # SQLite database initialization
│   │   └── main.py                # FastAPI main application instance
│   ├── tests/                     # Backend automated test suite
│   │   ├── conftest.py            # Pytest client fixtures
│   │   ├── test_auth.py           # Authentication route testing
│   │   └── test_analyze.py        # Analysis pipelines & validation testing
│   ├── .env.example               # Backend environment template
│   ├── Dockerfile                 # Production image build context
│   ├── requirements.txt           # Python application dependencies
│   └── run.py                     # Dev convenience start script
│
├── frontend/                      # React frontend application (Vite SPA)
│   ├── src/                       # Source code directory
│   │   ├── assets/                # Visual components & static media
│   │   ├── pages/                 # React pages (login, upload, analysis results)
│   │   └── styles/                # CSS layout definitions
│   ├── public/                    # Uncompiled assets
│   ├── .gitignore                 # Frontend version control rules
│   ├── Dockerfile                 # Nginx-backed multi-stage build file
│   ├── nginx.conf                 # Nginx SPA web server routing configs
│   ├── package.json               # Frontend dependencies & run scripts
│   └── vite.config.js             # Vite compiler & local dev proxy rules
│
├── docs/                          # Cleaned documentation directory
│   ├── ARCHITECTURE.md            # Detailed structural system design doc
│   ├── PHASE2_IMPLEMENTATION.md   # Feature roadmap implementation details
│   └── QUICK_START.md             # Standard platform onboarding guide
│
├── uploads/                       # PDF uploads & generated CAM documents (git-ignored)
├── docker-compose.yml             # Full-stack orchestrator configuration
├── .gitignore                     # Global workspace files ignored in git
└── README.md                      # General introduction and project index
```

---

## ⚡ Quick Start (Local Run)

### Prerequisites
* **Python 3.10+** (Backend)
* **Node.js 18+** (Frontend)
* Optional: **Ollama** running locally on host for local LLM features (`qwen3:8b` model)

### 1. Run the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file and configure variables:
   ```bash
   cp .env.example .env
   ```
5. Start the FastAPI development server:
   ```bash
   python run.py
   ```
   The backend API documentation is now live at `http://localhost:8000/docs`.

### 2. Run the Frontend
1. Open a new terminal tab, and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The application UI is accessible at `http://localhost:5173`.

---

## 🐳 Docker Deployment (Production-Ready)

To package and run the entire stack in isolated Docker containers, execute a single command from the project root:

```bash
docker compose up --build
```

* **Frontend Container**: Listens on port `80` (`http://localhost`). It compiles the React project using Node and serves the static files using a high-performance **Nginx** server.
* **Backend Container**: Listens on port `8000` (`http://localhost:8000`). It hosts the FastAPI server.
* **Database & Volumes**: Mounts the `./uploads` directory dynamically, allowing files to persist on the host filesystem outside the container boundary.

---

## 🧪 Running Automated Tests

A collection of unit and integration tests is included to verify authentication, file upload flows, and request sanitization.

To run the test suite locally:
1. Ensure you are in the `backend` directory with the virtual environment activated.
2. Install testing packages if not already present:
   ```bash
   pip install pytest httpx
   ```
3. Execute the tests:
   ```bash
   pytest
   ```

---

## 📖 Additional Resources
* **System Design & Flow**: [ARCHITECTURE.md](file:///c:/Saravanakumar%20G/Projects/Intelli-Credit/docs/ARCHITECTURE.md)
* **Test Guide & Flow walkthroughs**: [QUICK_START.md](file:///c:/Saravanakumar%20G/Projects/Intelli-Credit/docs/QUICK_START.md)
* **Project Roadmap & Phases**: [PHASE2_IMPLEMENTATION.md](file:///c:/Saravanakumar%20G/Projects/Intelli-Credit/docs/PHASE2_IMPLEMENTATION.md)
