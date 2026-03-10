from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

class OnboardingData(BaseModel):
    cin: str
    pan: str
    sector: str
    turnover: str
    type: str
    amount: str
    tenure: str
    interest: str

router = APIRouter(prefix="/onboarding")

@router.post("/")
def submit_onboarding(data: OnboardingData):
    # Here you would save to DB or process as needed
    # For now, just echo back
    return {"message": "Onboarding data received", "data": data.dict()}
