from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load envs
load_dotenv()

# Imports from our new clean structure
from backend.core.config import settings
from backend.database.connection import engine, SessionLocal
from backend.database.base_class import Base
from backend.models.user import User
from backend.security.password import get_password_hash
from backend.middleware.security import SecurityHeadersMiddleware
from backend.middleware.observability import ObservabilityMiddleware

# Central API Router
from backend.api.router import api_router

# Auto-create tables on startup (works for SQLite and PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelli-Credit Enterprise API",
    description="Corporate Credit Appraisal Multi-Agent Pipeline",
    version=settings.VERSION
)

@app.on_event("startup")
def create_demo_user():
    """Auto-seeding demo bank credit officer on startup"""
    db = SessionLocal()
    try:
        demo = db.query(User).filter(User.email == "demo@bank.com").first()
        if not demo:
            hashed_pwd = get_password_hash("demo123")
            demo = User(
                username="Demo User",
                email="demo@bank.com",
                hashed_password=hashed_pwd,
                role="credit_officer", # Upgraded to credit officer role
                is_active=True,
                is_verified=True
            )
            db.add(demo)
            db.commit()
    finally:
        db.close()

# 1. Register Observability & Security Middleware
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Register CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount versioned API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# 4. For backward compatibility with existing frontend, mount routers at root prefix too
from backend.api import auth, onboarding, upload, analyze, search, monitoring
app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(search.router)
app.include_router(monitoring.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_v1_docs": f"{settings.API_V1_STR}/docs",
        "documentation": "/docs"
    }

@app.get("/download/")
async def download_file(file_path: str):
    """Download appraisal CAM report files securely with directory jail check"""
    try:
        if ".." in file_path or file_path.startswith("/"):
            return {"error": "Invalid file path"}
            
        full_path = os.path.join(os.getcwd(), file_path)
        
        # Verify filepath directory jail
        abs_upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        abs_file_path = os.path.abspath(full_path)
        if not abs_file_path.startswith(abs_upload_dir):
            return {"error": "Invalid file path"}
            
        if not os.path.exists(abs_file_path):
            return {"error": "File not found"}
            
        filename = os.path.basename(abs_file_path)
        media_type = "application/pdf" if file_path.endswith('.pdf') else "application/octet-stream"
        
        return FileResponse(
            path=abs_file_path,
            media_type=media_type,
            filename=filename
        )
    except Exception as e:
        return {"error": str(e)}

# Mount uploads folder for serving CAM reports
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
