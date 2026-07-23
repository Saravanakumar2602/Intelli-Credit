from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime, String
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class ExtractedFinancials(Base):
    __tablename__ = "extracted_financials"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    # Stores raw parsed financials
    financial_data = Column(JSON, nullable=False) # e.g. {"revenue": 10000000, "net_profit": 500000, ...}
    
    # Ratios calculated
    ratios_data = Column(JSON, nullable=True) # Computed ratios
    
    extracted_by = Column(String, default="AI_AGENT", nullable=False) # AI_AGENT, MANUAL
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
