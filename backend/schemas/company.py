from pydantic import BaseModel
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    cin: str
    pan: str
    sector: str
    turnover: str

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
