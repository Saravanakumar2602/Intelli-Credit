from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class OnboardingData(BaseModel):
    cin: str = Field(..., description="Corporate Identification Number")
    pan: str = Field(..., description="Permanent Account Number")
    sector: str
    turnover: str
    type: str = Field(..., alias="type")
    amount: float
    tenure: int
    interest: float

    class Config:
        populate_by_name = True

class LoanApplicationBase(BaseModel):
    company_id: int
    amount: float
    tenure: int
    interest_rate: float
    loan_type: str

class LoanApplicationCreate(LoanApplicationBase):
    pass

class LoanApplicationResponse(LoanApplicationBase):
    id: int
    status: str
    officer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
