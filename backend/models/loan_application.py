from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime
from backend.database.base_class import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Credit Officer assigned
    
    amount = Column(Float, nullable=False)
    tenure = Column(Integer, nullable=False) # In months
    interest_rate = Column(Float, nullable=False)
    loan_type = Column(String, nullable=False) # Term Loan, Working Capital, etc.
    
    status = Column(String, default="SUBMITTED", nullable=False) # SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CONDITIONAL
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
