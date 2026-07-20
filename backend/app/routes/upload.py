from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
import shutil
import os
import uuid
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload")

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx"}

@router.post("/")
async def upload_files(
    company: str = Form(...),
    alm: UploadFile = File(...),
    shareholding: UploadFile = File(...),
    borrowing: UploadFile = File(...),
    annual: UploadFile = File(...),
    portfolio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
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
    
    # Validate formats first before writing anything to disk
    for key, upload in files.items():
        ext = os.path.splitext(upload.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {key}. Only .pdf, .docx, and .xlsx files are allowed."
            )
            
    # Save files with sanitized, unique names
    sanitized_company = "".join(c for c in company if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    
    for key, upload in files.items():
        ext = os.path.splitext(upload.filename)[1].lower()
        # Generate a secure unique name to prevent directory traversal and name collisions
        unique_id = uuid.uuid4().hex
        filename = f"{sanitized_company}_{key}_{unique_id}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Verify the resolved path is inside UPLOAD_DIR
        abs_upload_dir = os.path.abspath(UPLOAD_DIR)
        abs_file_path = os.path.abspath(file_path)
        if not abs_file_path.startswith(abs_upload_dir):
            raise HTTPException(status_code=400, detail="Invalid upload destination")
            
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)
        file_paths[key] = file_path
        
    return {
        "message": "All files uploaded successfully",
        "file_paths": file_paths
    }

@router.get("/")
def upload_info():
    return {
        "message": "Upload endpoint requires a POST request with multi-part form data.",
        "allowed_extensions": list(ALLOWED_EXTENSIONS)
    }


