from fastapi import FastAPI
from app.routes import upload, analyze

app = FastAPI(
    title="Intelli-Credit API",
    description="AI-powered corporate credit analysis engine",
    version="1.0"
)

app.include_router(upload.router)
app.include_router(analyze.router)
