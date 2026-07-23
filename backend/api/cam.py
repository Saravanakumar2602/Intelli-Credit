from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.credit_appraisal_memo import CreditAppraisalMemo
from backend.models.loan_application import LoanApplication
from backend.models.company import Company
from backend.core.config import settings

router = APIRouter(prefix="/cam", tags=["CAM"])

@router.get("/{id}")
def get_cam_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve structured Credit Appraisal Memo details"""
    memo = db.query(CreditAppraisalMemo).filter(CreditAppraisalMemo.id == id).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Credit Appraisal Memo not found")
        
    loan = db.query(LoanApplication).filter(LoanApplication.id == memo.loan_application_id).first()
    if not loan:
         raise HTTPException(status_code=404, detail="Associated loan application not found")
         
    comp = db.query(Company).filter(Company.id == loan.company_id).first()
    company_name = comp.name if comp else "Unknown"

    from backend.models.extracted_financials import ExtractedFinancials
    from backend.models.risk_report import RiskReport

    financials = db.query(ExtractedFinancials).filter(ExtractedFinancials.loan_application_id == memo.loan_application_id).first()
    risk = db.query(RiskReport).filter(RiskReport.loan_application_id == memo.loan_application_id).first()

    financial_content = "No financial data available."
    if financials and financials.ratios_data:
        ratio_lines = ", ".join(
            f"{k.replace('_', ' ').title()}: {round(float(v), 2)}"
            for k, v in financials.ratios_data.items()
            if isinstance(v, (int, float))
        )
        financial_content = f"Computed credit ratios: {ratio_lines}." if ratio_lines else "Ratios computed but no numeric values found."

    risk_content = "No risk assessment data available."
    if risk:
        risk_content = risk.explanation or f"Overall risk score: {risk.overall_score} ({risk.risk_level})."

    sections = [
        {
            "key": "executive_summary",
            "title": "1. Executive Summary",
            "content": memo.recommendation_summary or "Automatic synthesis memo. Stable financial metrics and cash coverage."
        },
        {
            "key": "financial_analysis",
            "title": "2. Financial Profile & Ratios Analysis",
            "content": financial_content
        },
        {
            "key": "risk_assessment",
            "title": "3. Risk Evaluation & Mitigation",
            "content": risk_content
        }
    ]

    outcome = "approve"
    if memo.decision == "CONDITIONAL_APPROVE" or memo.decision == "CONDITIONAL":
        outcome = "conditional"
    elif memo.decision == "REJECT" or memo.decision == "REJECTED":
        outcome = "decline"

    return {
        "id": str(memo.id),
        "application_id": str(loan.id),
        "company_name": company_name,
        "generated_at": memo.created_at.isoformat() + "Z",
        "version": 1,
        "sections": sections,
        "decision": {
            "outcome": outcome,
            "limit": loan.amount,
            "conditions": ["Quarterly verification of business receivables ledger"],
            "decided_by": "AI Underwriter Pipeline",
            "decided_at": memo.created_at.isoformat() + "Z"
        }
    }

@router.get("/{id}/download")
def download_cam_pdf(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download appraisal CAM PDF report securely"""
    memo = db.query(CreditAppraisalMemo).filter(CreditAppraisalMemo.id == id).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Credit Appraisal Memo not found")
        
    full_path = os.path.join(os.getcwd(), memo.file_path)
    if not os.path.exists(full_path):
        # Generate dummy fallback if file was deleted/moved or has local placeholder
        # Or look in default UPLOAD_DIR
        full_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(memo.file_path))
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="PDF report file not found on disk")
            
    filename = os.path.basename(full_path)
    return FileResponse(
        path=full_path,
        media_type="application/pdf",
        filename=filename
    )
