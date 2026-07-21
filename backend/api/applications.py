from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.company import Company
from backend.models.loan_application import LoanApplication
from backend.models.uploaded_document import UploadedDocument
from backend.models.risk_report import RiskReport
from backend.models.credit_appraisal_memo import CreditAppraisalMemo
from backend.models.comment import ApplicationComment
from backend.models.extracted_financials import ExtractedFinancials

router = APIRouter(prefix="/applications", tags=["Applications"])

class CommentCreate(BaseModel):
    body: str

@router.get("/")
def list_applications(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List applications with pagination"""
    skip = (page - 1) * limit
    total = db.query(LoanApplication).count()
    loans = db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).offset(skip).limit(limit).all()
    
    items = []
    for loan in loans:
        comp = db.query(Company).filter(Company.id == loan.company_id).first()
        company_name = comp.name if comp else "Unknown Company"
        
        # Check risk score
        risk = db.query(RiskReport).filter(RiskReport.loan_application_id == loan.id).first()
        risk_score = risk.overall_score if risk else None
        
        # Credit Officer username
        officer_name = None
        if loan.officer_id:
            officer = db.query(User).filter(User.id == loan.officer_id).first()
            officer_name = officer.username if officer else None
            
        items.append({
            "id": str(loan.id),
            "company_id": str(loan.company_id),
            "company_name": company_name,
            "amount_requested": loan.amount,
            "currency": "INR",
            "purpose": "Corporate Funding",
            "status": loan.status.lower(),
            "submitted_at": loan.created_at.isoformat() + "Z",
            "officer": officer_name or "Unassigned",
            "risk_score": risk_score
        })
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": limit
    }

@router.get("/{id}")
def get_application(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve detailed corporate application view"""
    loan = db.query(LoanApplication).filter(LoanApplication.id == id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan Application not found")
        
    comp = db.query(Company).filter(Company.id == loan.company_id).first()
    company_name = comp.name if comp else "Unknown"
    
    # Uploaded docs
    docs = db.query(UploadedDocument).filter(UploadedDocument.loan_application_id == loan.id).all()
    uploaded_docs = [
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
    
    # Check category existence
    categories_present = {doc.file_category.lower() for doc in docs}
    required_documents = [
        {"name": "ALM Statement (ALM)", "provided": "alm" in categories_present},
        {"name": "Shareholding Pattern", "provided": "shareholding" in categories_present},
        {"name": "Borrowing Ledger", "provided": "borrowing" in categories_present},
        {"name": "Annual Report", "provided": "annual" in categories_present},
        {"name": "Portfolio Details", "provided": "portfolio" in categories_present}
    ]
    
    # Assigned officer
    assigned_officer = None
    if loan.officer_id:
        officer = db.query(User).filter(User.id == loan.officer_id).first()
        if officer:
            assigned_officer = {
                "id": str(officer.id),
                "name": officer.username,
                "email": officer.email,
                "avatar_url": None
            }
            
    # Comments thread
    comments_db = db.query(ApplicationComment).filter(ApplicationComment.loan_application_id == loan.id).order_by(ApplicationComment.created_at.asc()).all()
    comments = [
        {
            "id": str(c.id),
            "author": c.author,
            "body": c.body,
            "at": c.created_at.isoformat() + "Z"
        }
        for c in comments_db
    ]
    
    # Latest analysis
    latest_analysis = None
    risk = db.query(RiskReport).filter(RiskReport.loan_application_id == loan.id).first()
    if risk:
        # Check financial ratios
        financials = db.query(ExtractedFinancials).filter(ExtractedFinancials.loan_application_id == loan.id).first()
        ratios = financials.ratios_data if financials else None
        
        latest_analysis = {
            "id": str(risk.id),
            "application_id": str(loan.id),
            "company_name": company_name,
            "created_at": risk.created_at.isoformat() + "Z",
            "status": "completed",
            "risk_score": risk.overall_score,
            "confidence": 85.0
        }
        
    # Latest CAM
    cam = db.query(CreditAppraisalMemo).filter(CreditAppraisalMemo.loan_application_id == loan.id).first()
    latest_cam_id = str(cam.id) if cam else None
    
    # Timeline
    status_timeline = [
        {
            "id": "t-1",
            "at": loan.created_at.isoformat() + "Z",
            "status": "Submitted",
            "note": "Application submitted for review"
        }
    ]
    if docs:
        status_timeline.append({
            "id": "t-2",
            "at": docs[0].created_at.isoformat() + "Z",
            "status": "Documents Uploaded",
            "note": f"{len(docs)} files ingested and secure-encrypted"
        })
    if risk:
        status_timeline.append({
            "id": "t-3",
            "at": risk.created_at.isoformat() + "Z",
            "status": "Analyzing Completed",
            "note": "AI analysis task finished, appraisal memo generated"
        })
    if loan.status in ["APPROVED", "REJECTED"]:
        status_timeline.append({
            "id": "t-4",
            "at": loan.updated_at.isoformat() + "Z",
            "status": loan.status.title(),
            "note": f"Application marked as {loan.status.lower()}"
        })

    return {
        "id": str(loan.id),
        "company_id": str(loan.company_id),
        "company_name": company_name,
        "amount_requested": loan.amount,
        "currency": "INR",
        "purpose": "Corporate Funding",
        "status": loan.status.lower(),
        "submitted_at": loan.created_at.isoformat() + "Z",
        "officer": assigned_officer["name"] if assigned_officer else "Unassigned",
        "risk_score": risk.overall_score if risk else None,
        
        "loan_details": {
            "tenure_months": loan.tenure,
            "interest_rate": loan.interest_rate,
            "collateral": "Corporate Guarantee & Receivables charge",
            "facility_type": loan.loan_type
        },
        "status_timeline": status_timeline,
        "required_documents": required_documents,
        "uploaded_documents": uploaded_docs,
        "assigned_officer": assigned_officer,
        "review_stage": "appraisal",
        "comments": comments,
        "latest_cam_id": latest_cam_id,
        "latest_analysis": latest_analysis
    }

@router.post("/{id}/comment")
def create_comment(
    id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Post comment on an application"""
    comment = ApplicationComment(
        loan_application_id=id,
        author=current_user.username,
        body=payload.body
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"message": "Comment posted successfully", "id": comment.id}
