from fastapi import APIRouter, UploadFile, File
import shutil
import os

router = APIRouter(prefix="/upload")

UPLOAD_DIR = "uploads"

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {
        "message": "File uploaded successfully",
        "file_path": file_path
    }
