from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.repositories.entity_repositories import LoanRepository
from backend.models.risk_report import RiskReport

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("/")
def global_search(
    q: Optional[str] = Query(None, description="Search term matching Company Name or CIN"),
    status: Optional[str] = Query(None, description="Filter by status (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED)"),
    sector: Optional[str] = Query(None, description="Filter by corporate sector"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Paginated global search engine across Loan Applications, Corporate Profiles, and Appraisals.
    """
    skip = (page - 1) * limit
    loans, total = LoanRepository.list_applications(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        sector=sector,
        search=q
    )
    
    results = []
    for loan in loans:
        # Load related company details
        from backend.models.company import Company
        company = db.query(Company).filter(Company.id == loan.company_id).first()
        company_name = company.name if company else "Unknown"
        company_cin = company.cin if company else ""
        company_sector = company.sector if company else ""
        
        risk = db.query(RiskReport).filter(RiskReport.loan_application_id == loan.id).first()
        results.append({
            "id": loan.id,
            "company_name": company_name,
            "company_cin": company_cin,
            "sector": company_sector,
            "amount": loan.amount,
            "tenure": loan.tenure,
            "interest_rate": loan.interest_rate,
            "loan_type": loan.loan_type,
            "status": loan.status,
            "created_at": loan.created_at,
            "risk_score": risk.overall_score if risk else None
        })
        
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "results": results
    }
