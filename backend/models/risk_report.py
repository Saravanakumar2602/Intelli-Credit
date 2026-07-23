from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime, String, Float
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class RiskReport(Base):
    __tablename__ = "risk_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    overall_score = Column(Float, nullable=False) # e.g. 72.0
    risk_level = Column(String, nullable=False) # Low Risk, Medium Risk, High Risk
    
    # Store scores and weights used for each category:
    # categories: financial, industry, operational, legal, esg, news, management, liquidity
    breakdown = Column(JSON, nullable=False) # e.g. {"financial": {"score": 80, "weight": 0.25}, ...}
    
    explanation = Column(String, nullable=True) # Text reasoning
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
