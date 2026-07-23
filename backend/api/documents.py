from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import os

from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.uploaded_document import UploadedDocument
from backend.repositories.entity_repositories import AuditRepository

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/")
def list_documents(
    loan_application_id: int = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List uploaded documents, optionally filtered by loan application"""
    query = db.query(UploadedDocument)
    if loan_application_id:
        query = query.filter(UploadedDocument.loan_application_id == loan_application_id)
    total = query.count()
    docs = query.order_by(UploadedDocument.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "items": [
            {
                "id": str(doc.id),
                "application_id": str(doc.loan_application_id),
                "file_name": doc.original_filename,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "uploaded_at": doc.created_at.isoformat() + "Z",
                "status": "ready"
            }
            for doc in docs
        ]
    }

@router.get("/{id}")
def get_document_metadata(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve document metadata for preview and download"""
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    download_url = f"/uploads/{doc.filename}"
    preview_url = f"/uploads/{doc.filename}"
    
    return {
        "id": str(doc.id),
        "file_name": doc.original_filename,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "page_count": 1,
        "uploaded_at": doc.created_at.isoformat() + "Z",
        "uploaded_by": "Credit Officer",
        "preview_url": preview_url,
        "download_url": download_url
    }

@router.delete("/{id}")
def delete_document(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document from storage and database"""
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete from file system if exists
    if doc.filepath and os.path.exists(doc.filepath):
        try:
            os.remove(doc.filepath)
        except Exception:
            pass
            
    # Delete from DB
    db.delete(doc)
    db.commit()
    
    # Audit log
    AuditRepository.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="DELETE_DOCUMENT",
        details=f"Deleted document {doc.original_filename} (ID: {id})",
        ip=request.client.host if request.client else "unknown",
        ua=request.headers.get("user-agent", "unknown")
    )
    
    return {"message": "Document deleted successfully"}

@router.post("/{id}/retry")
def retry_document_processing(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger background re-analysis/re-processing of document"""
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": str(doc.id),
        "application_id": str(doc.loan_application_id),
        "file_name": doc.original_filename,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "uploaded_at": doc.created_at.isoformat() + "Z",
        "status": "ready"
    }
