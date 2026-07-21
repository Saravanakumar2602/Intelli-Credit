from fastapi import APIRouter
from backend.api import auth, onboarding, upload, analyze, search, monitoring, dashboard, applications, companies, documents, cam, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(onboarding.router)
api_router.include_router(upload.router)
api_router.include_router(analyze.router)
api_router.include_router(search.router)
api_router.include_router(monitoring.router)
api_router.include_router(dashboard.router)
api_router.include_router(applications.router)
api_router.include_router(companies.router)
api_router.include_router(documents.router)
api_router.include_router(cam.router)
api_router.include_router(reports.router)
