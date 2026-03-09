from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import upload, analyze

app = FastAPI(
    title="Intelli-Credit API",
    description="AI-powered corporate credit analysis engine",
    version="1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analyze.router)

# Download CAM report endpoint
@app.get("/download/")
def download_file(file_path: str):
    """Download a generated report file"""
    try:
        # Ensure file_path is safe (prevent directory traversal)
        if ".." in file_path or file_path.startswith("/"):
            return {"error": "Invalid file path"}
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        if not os.path.exists(full_path):
            return {"error": "File not found"}
        
        filename = os.path.basename(full_path)
        
        # Determine MIME type based on file extension
        if file_path.endswith('.pdf'):
            media_type = "application/pdf"
        elif file_path.endswith('.docx'):
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            media_type = "application/octet-stream"
        
        return FileResponse(
            full_path, 
            media_type=media_type, 
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        return {"error": str(e)}

# Mount uploads folder for static file serving
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
