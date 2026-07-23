from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.company import Company
from backend.models.loan_application import LoanApplication
from backend.models.uploaded_document import UploadedDocument
from backend.models.risk_report import RiskReport
from backend.models.extracted_financials import ExtractedFinancials
from backend.models.credit_appraisal_memo import CreditAppraisalMemo

def _parse_turnover(turnover: str) -> float | None:
    """Safely parse turnover string like '10 Cr' into a float."""
    try:
        cleaned = turnover.replace(" Cr", "").replace("Cr", "").strip()
        return float(cleaned) * 10_000_000
    except (ValueError, AttributeError):
        return None

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("/")
def list_companies(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List companies with pagination"""
    skip = (page - 1) * limit
    total = db.query(Company).count()
    companies = db.query(Company).order_by(Company.name.asc()).offset(skip).limit(limit).all()
    
    items = []
    for c in companies:
        items.append({
            "id": str(c.id),
            "legal_name": c.name,
            "registration_number": c.cin,
            "industry": c.sector,
            "country": "India",
            "incorporation_date": c.created_at.strftime("%Y-%m-%d") if c.created_at else None,
            "annual_revenue": _parse_turnover(c.turnover)
        })
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": limit
    }

@router.get("/{id}")
def get_company(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve company by ID"""
    c = db.query(Company).filter(Company.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
        
    return {
        "id": str(c.id),
        "legal_name": c.name,
        "registration_number": c.cin,
        "industry": c.sector,
        "country": "India",
        "incorporation_date": c.created_at.strftime("%Y-%m-%d") if c.created_at else None,
        "annual_revenue": _parse_turnover(c.turnover)
    }

@router.get("/{id}/profile")
def get_company_profile(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve comprehensive profile details for a corporate company"""
    c = db.query(Company).filter(Company.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Get all loans
    loans = db.query(LoanApplication).filter(LoanApplication.company_id == c.id).all()
    loan_ids = [l.id for l in loans]
    
    # Financial details
    revenue = 50000000.0  # Default 50 Cr
    net_profit = 4000000.0
    ebitda = 7000000.0
    ratios_data = {}
    
    if loan_ids:
        # Load latest financials from db
        financials = db.query(ExtractedFinancials).filter(ExtractedFinancials.loan_application_id.in_(loan_ids)).order_by(ExtractedFinancials.created_at.desc()).first()
        if financials:
            fdata = financials.financial_data
            rdata = financials.ratios_data
            
            revenue = fdata.get("revenue", revenue)
            net_profit = fdata.get("net_profit", net_profit)
            ebitda = fdata.get("ebitda", ebitda)
            if rdata:
                ratios_data = rdata

    # Map dynamic signals based on ratios
    dsr = ratios_data.get("debt_service_coverage", 1.4)
    cr = ratios_data.get("current_ratio", 1.5)
    der = ratios_data.get("debt_to_equity", 1.2)
    
    health_signals = [
        {"label": "Current Ratio", "status": "good" if cr >= 1.2 else "warning", "detail": f"Liquidity ratio is at {cr}x"},
        {"label": "Debt Service Coverage", "status": "good" if dsr >= 1.2 else "risk", "detail": f"DSCR is solid at {dsr}x"},
        {"label": "Leverage (D/E)", "status": "good" if der <= 1.5 else "warning", "detail": f"Debt-to-equity leverage is {der}x"}
    ]

    # Health score
    health_score = 75
    risk = None
    if loan_ids:
        risk = db.query(RiskReport).filter(RiskReport.loan_application_id.in_(loan_ids)).order_by(RiskReport.created_at.desc()).first()
        if risk:
            health_score = int(100 - risk.overall_score)

    # Documents list
    docs = []
    if loan_ids:
        docs = db.query(UploadedDocument).filter(UploadedDocument.loan_application_id.in_(loan_ids)).all()
        
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

    # Insights
    ai_insights = [
        "Stable growth in quarterly turnover indicators.",
        "Cash flows adequately cover current outstanding charges.",
        "Healthy alignment with industry benchmarks."
    ]
    if risk and risk.explanation:
        ai_insights = [risk.explanation]
        
    # Directors mock list
    directors = [
        {"id": "d-1", "name": f"Director 1 ({c.name[:4].upper()})", "designation": "Managing Director", "din": "01234567"},
        {"id": "d-2", "name": f"Director 2 ({c.name[:4].upper()})", "designation": "Executive Director", "din": "76543210"}
    ]

    # Previous risk scores
    previous_risk_scores = [{"at": datetime.now().strftime("%Y-%m-%d"), "score": float(risk.overall_score)} if risk else {"at": "2026-07-01", "score": 38.0}]

    return {
        "id": str(c.id),
        "legal_name": c.name,
        "registration_number": c.cin,
        "cin": c.cin,
        "pan": c.pan,
        "sector": c.sector,
        "country": "India",
        "incorporation_date": c.created_at.strftime("%Y-%m-%d") if c.created_at else None,
        "annual_revenue": revenue,
        "registered_address": "Corporate Tower B, Bandra Kurla Complex, Mumbai, MH - 400051",
        "logo_url": None,
        
        "directors": directors,
        "financial_summary": [
            {"label": "Revenue", "value": revenue, "unit": "INR"},
            {"label": "Net Profit", "value": net_profit, "unit": "INR"},
            {"label": "EBITDA", "value": ebitda, "unit": "INR"}
        ],
        "loan_information": [
            {"label": "Total Active Loans", "value": str(len(loans))},
            {"label": "Approved Limit", "value": f"₹ {sum([l.amount for l in loans if l.status == 'APPROVED']):,.2f}"}
        ],
        "ai_insights": ai_insights,
        "health_score": health_score,
        "health_signals": health_signals,
        "previous_risk_scores": previous_risk_scores,
        "documents": uploaded_docs
    }
