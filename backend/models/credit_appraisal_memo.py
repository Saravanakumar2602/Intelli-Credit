from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, JSON, Float
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class CreditAppraisalMemo(Base):
    __tablename__ = "credit_appraisal_memos"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    file_path = Column(String, nullable=False) # uploads/company_CAM.pdf
    decision = Column(String, nullable=False) # APPROVE, CONDITIONAL_APPROVE, REJECT
    confidence_score = Column(Float, default=0.0, nullable=False)
    
    # Store SWOT, recommendation text, and page references for compliance check
    recommendation_summary = Column(String, nullable=True)
    citations_data = Column(JSON, nullable=True) # Page numbers and paragraph quotes
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
