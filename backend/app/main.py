from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from backend.core.config import settings
from backend.database.connection import engine, SessionLocal
from backend.database.base_class import Base
from backend.models.user import User
from backend.security.password import get_password_hash
from backend.middleware.security import SecurityHeadersMiddleware
from backend.middleware.observability import ObservabilityMiddleware
from backend.api.router import api_router

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed demo user on startup"""
    db = SessionLocal()
    try:
        demo = db.query(User).filter(User.email == "demo@bank.com").first()
        hashed_pwd = get_password_hash("demo123")
        if not demo:
            demo = User(
                username="Demo User",
                email="demo@bank.com",
                hashed_password=hashed_pwd,
                role="credit_officer",
                is_active=True,
                is_verified=True,
            )
            db.add(demo)
        else:
            demo.hashed_password = hashed_pwd
            demo.is_active = True
            demo.is_verified = True
            demo.failed_login_attempts = 0
            demo.lockout_until = None
        db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title="Intelli-Credit Enterprise API",
    description="Corporate Credit Appraisal Multi-Agent Pipeline",
    version=settings.VERSION,
    lifespan=lifespan,
)

# 1. Observability & Security Middleware
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount all routes ONCE under /api/v1 — no duplicate root-level mounts
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs",
    }


@app.get("/download/")
async def download_file(file_path: str):
    """Download appraisal CAM report files securely with directory jail check"""
    try:
        if ".." in file_path or file_path.startswith("/"):
            return {"error": "Invalid file path"}

        full_path = os.path.join(os.getcwd(), file_path)
        abs_upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        abs_file_path = os.path.abspath(full_path)

        if not abs_file_path.startswith(abs_upload_dir):
            return {"error": "Invalid file path"}

        if not os.path.exists(abs_file_path):
            return {"error": "File not found"}

        filename = os.path.basename(abs_file_path)
        media_type = "application/pdf" if file_path.endswith(".pdf") else "application/octet-stream"

        return FileResponse(path=abs_file_path, media_type=media_type, filename=filename)
    except Exception as e:
        return {"error": str(e)}


os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
