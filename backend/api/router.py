from fastapi import APIRouter
from backend.api import auth, onboarding, upload, analyze, search, monitoring

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(onboarding.router)
api_router.include_router(upload.router)
api_router.include_router(analyze.router)
api_router.include_router(search.router)
api_router.include_router(monitoring.router)
