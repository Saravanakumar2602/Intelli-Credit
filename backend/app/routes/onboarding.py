from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import re
from app.auth import get_db, get_current_user
from app.models.user import User
from app.models.onboarding import Onboarding as OnboardingModel

class OnboardingData(BaseModel):
    cin: str = Field(..., description="Corporate Identification Number")
    pan: str = Field(..., description="Permanent Account Number")
    sector: str
    turnover: str
    type: str = Field(..., alias="type")
    amount: float
    tenure: int
    interest: float

router = APIRouter(prefix="/onboarding")

@router.post("/")
def submit_onboarding(
    data: OnboardingData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate CIN (21 digits, standard Indian CIN format)
    cin_clean = data.cin.strip().upper()
    if not re.match(r"^[L|U]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$", cin_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Corporate Identification Number (CIN) format. Must be 21 characters matching Indian CIN standards."
        )

    # Validate PAN (10 digits, standard Indian PAN format)
    pan_clean = data.pan.strip().upper()
    if not re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Permanent Account Number (PAN) format. Must be 10 characters matching Indian PAN standards."
        )

    # Save to SQLite/PostgreSQL Database
    new_onboarding = OnboardingModel(
        cin=cin_clean,
        pan=pan_clean,
        sector=data.sector,
        turnover=data.turnover,
        loan_type=data.type,
        amount=data.amount,
        tenure=data.tenure,
        interest=data.interest
    )
    
    db.add(new_onboarding)
    db.commit()
    db.refresh(new_onboarding)

    return {
        "message": "Onboarding data received and saved successfully",
        "id": new_onboarding.id,
        "data": {
            "cin": new_onboarding.cin,
            "pan": new_onboarding.pan,
            "sector": new_onboarding.sector,
            "turnover": new_onboarding.turnover,
            "type": new_onboarding.loan_type,
            "amount": new_onboarding.amount,
            "tenure": new_onboarding.tenure,
            "interest": new_onboarding.interest
        }
    }

