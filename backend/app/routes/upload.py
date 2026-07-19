
from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

router = APIRouter(prefix="/upload")

UPLOAD_DIR = "uploads"

@router.post("/")
async def upload_files(
    company: str = Form(...),
    alm: UploadFile = File(...),
    shareholding: UploadFile = File(...),
    borrowing: UploadFile = File(...),
    annual: UploadFile = File(...),
    portfolio: UploadFile = File(...)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_paths = {}
    files = {
        "alm": alm,
        "shareholding": shareholding,
        "borrowing": borrowing,
        "annual": annual,
        "portfolio": portfolio
    }
    for key, upload in files.items():
        filename = f"{company}_{key}_{upload.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)
        file_paths[key] = file_path
    return {
        "message": "All files uploaded successfully",
        "file_paths": file_paths
    }
