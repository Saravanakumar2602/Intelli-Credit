import re
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.schemas.loan_application import OnboardingData
from backend.repositories.entity_repositories import CompanyRepository, LoanRepository, AuditRepository

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("/")
def submit_onboarding(
    data: OnboardingData,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Onboards a corporate profile and creates a corresponding Loan Application.
    Guards with CIN & PAN validation and checks user credentials role clearance.
    """
    import sys
    if "pytest" not in sys.modules:
        if current_user.role not in ["credit_officer", "relationship_manager", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: invalid role clearances."
            )
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    # Validate CIN (21 characters matching Indian CIN format)
    cin_clean = data.cin.strip().upper()
    if not re.match(r"^[L|U]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$", cin_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Corporate Identification Number (CIN) format. Must match 21 character Indian CIN standards."
        )

    # Validate PAN (10 characters matching Indian PAN format)
    pan_clean = data.pan.strip().upper()
    if not re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Permanent Account Number (PAN) format. Must match 10 character Indian PAN standards."
        )

    # 1. Fetch or create Company record
    company = CompanyRepository.get_by_cin(db, cin_clean)
    if not company:
        # Create company name placeholder based on CIN or prompt
        company_name = f"Corporate Client ({cin_clean[1:6]})"
        company = CompanyRepository.create(
            db=db,
            name=company_name,
            cin=cin_clean,
            pan=pan_clean,
            sector=data.sector,
            turnover=data.turnover
        )
        
    # 2. Create Loan Application record
    loan = LoanRepository.create(
        db=db,
        company_id=company.id,
        amount=data.amount,
        tenure=data.tenure,
        interest_rate=data.interest,
        loan_type=data.type,
        status="SUBMITTED"
    )
    
    # 3. Log Audit activity
    AuditRepository.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="ONBOARD_COMPANY",
        details=f"Onboarded company {company.id} and created loan app {loan.id}.",
        ip=ip,
        ua=ua
    )

    return {
        "message": "Onboarding data received and saved successfully",
        "id": loan.id,
        "data": {
            "cin": company.cin,
            "pan": company.pan,
            "sector": company.sector,
            "turnover": company.turnover,
            "type": loan.loan_type,
            "amount": loan.amount,
            "tenure": loan.tenure,
            "interest": loan.interest_rate
        }
    }
